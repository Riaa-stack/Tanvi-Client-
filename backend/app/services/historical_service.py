"""
app/services/historical_service.py — Historical intelligence engine.

Implements dynamic recomputation every time a new paper becomes READY.

Algorithm:
1. Fetch all READY papers for the academic scope
2. Build topic frequency from structured DB data (no Gemini needed)
3. Detect semantic repetitions using vector similarity
4. Verify repetition clusters with Gemini where beneficial
5. Aggregate statistics
6. Update SubjectHistoricalAnalysis
7. Assign evidence level: NONE/LOW/MEDIUM/HIGH

CRITICAL: Never fabricate historical frequency.
Everything is derived from actual DB records.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import List, Optional

from app.config import get_settings
from app.logging_config import get_logger
from app.models.historical_analysis import EvidenceLevel, SubjectHistoricalAnalysis
from app.models.paper import Paper
from app.models.paper_question import PaperQuestion
from app.models.repetition import QuestionRepetitionGroup, QuestionRepetitionOccurrence
from app.repositories.historical_repository import HistoricalRepository
from app.repositories.paper_repository import PaperRepository

logger = get_logger(__name__)


class HistoricalService:
    """
    Manages historical intelligence per academic scope.
    Called after every new paper reaches READY state.
    """

    def update_for_scope(
        self,
        academic_scope_id: str,
        new_paper: Paper,
        embedding_svc,
        vector_svc,
        gemini_svc,
        db,
    ) -> SubjectHistoricalAnalysis:
        """
        Recompute historical intelligence for the given academic scope.
        Includes the newly processed paper.
        """
        settings = get_settings()

        # Get all READY papers for this scope (including the new one)
        all_papers = PaperRepository.get_ready_papers_in_scope(academic_scope_id)
        # Ensure new_paper is included even if its status transition is still in progress
        paper_ids = {p.id for p in all_papers}
        if new_paper and new_paper.id not in paper_ids:
            all_papers.append(new_paper)
        paper_count = len(all_papers)

        logger.info(
            "historical_update_starting",
            scope_id=academic_scope_id,
            paper_count=paper_count,
        )

        # Determine evidence level
        if paper_count == 0:
            evidence_level = EvidenceLevel.NONE
        elif paper_count == 1:
            evidence_level = EvidenceLevel.LOW
        elif paper_count <= 3:
            evidence_level = EvidenceLevel.MEDIUM
        else:
            evidence_level = EvidenceLevel.HIGH

        # Build structured statistics from DB (no LLM for this part)
        topic_frequency = self._compute_topic_frequency(all_papers)
        unit_importance = self._compute_unit_importance(all_papers)
        marks_distribution = self._compute_marks_distribution(all_papers)
        difficulty_trends = self._compute_difficulty_trends(all_papers)
        question_type_trends = self._compute_question_type_trends(all_papers)

        # Detect repetitions if we have enough papers
        repetition_clusters = []
        if paper_count >= 2:
            repetition_clusters = self._detect_repetitions(
                all_papers=all_papers,
                new_paper=new_paper,
                academic_scope_id=academic_scope_id,
                embedding_svc=embedding_svc,
                vector_svc=vector_svc,
                gemini_svc=gemini_svc,
                db=db,
                similarity_threshold=settings.REPETITION_SIMILARITY_THRESHOLD,
            )

        # Generate recommendations from structured data (optionally with Gemini)
        study_recommendations = []
        potential_patterns = []
        historical_trends = None

        if paper_count >= 2:
            try:
                recommendations_data = self._generate_recommendations_with_gemini(
                    gemini_svc=gemini_svc,
                    paper_count=paper_count,
                    papers=all_papers,
                    topic_frequency=topic_frequency,
                    repetition_clusters=repetition_clusters,
                    marks_distribution=marks_distribution,
                    difficulty_trends=difficulty_trends,
                )
                study_recommendations = recommendations_data.get("study_recommendations", [])
                potential_patterns = recommendations_data.get("potential_patterns", [])
                historical_trends = recommendations_data.get("historical_trends")
            except Exception as e:
                logger.warning(
                    "historical_gemini_recommendations_failed",
                    scope_id=academic_scope_id,
                    error=str(e),
                )

        # Build the analysis object
        analysis = SubjectHistoricalAnalysis(
            academic_scope_id=academic_scope_id,
            papers_count=paper_count,
            papers_included=[p.id for p in all_papers],
            evidence_level=evidence_level,
            topic_frequency=topic_frequency,
            unit_importance=unit_importance,
            marks_distribution=marks_distribution,
            difficulty_trends=difficulty_trends,
            question_type_trends=question_type_trends,
            repetition_clusters=[g.to_dict() for g in repetition_clusters] if repetition_clusters else [],
            study_recommendations=study_recommendations,
            potential_patterns=potential_patterns,
            historical_trends=historical_trends,
            generated_at=datetime.now(timezone.utc),
            analysis_version="1.0",
        )

        saved = HistoricalRepository.save_analysis(analysis)
        db.session.commit()
        logger.info(
            "historical_update_complete",
            scope_id=academic_scope_id,
            paper_count=paper_count,
            evidence_level=evidence_level,
        )
        return saved

    def _compute_topic_frequency(self, papers: List[Paper]) -> dict:
        """Aggregate topic frequency across all papers from DB data."""
        topic_data: dict = defaultdict(lambda: {"count": 0, "papers": [], "total_marks": 0})
        for paper in papers:
            for q in paper.questions:
                if q.topic:
                    topic_data[q.topic]["count"] += 1
                    if paper.id not in topic_data[q.topic]["papers"]:
                        topic_data[q.topic]["papers"].append(paper.id)
                    topic_data[q.topic]["total_marks"] += q.marks or 0
        return dict(topic_data)

    def _compute_unit_importance(self, papers: List[Paper]) -> dict:
        """Aggregate unit-level marks and question count across papers."""
        unit_data: dict = defaultdict(
            lambda: {"total_marks": 0, "question_count": 0, "paper_count": 0, "importance": "LOW"}
        )
        for paper in papers:
            paper_units = set()
            for q in paper.questions:
                unit_key = q.unit or "Unknown"
                unit_data[unit_key]["total_marks"] += q.marks or 0
                unit_data[unit_key]["question_count"] += 1
                paper_units.add(unit_key)
            for unit_key in paper_units:
                unit_data[unit_key]["paper_count"] += 1

        # Assign importance based on frequency
        total_papers = len(papers)
        for unit_key, data in unit_data.items():
            ratio = data["paper_count"] / max(total_papers, 1)
            if ratio >= 0.8:
                data["importance"] = "VERY_HIGH"
            elif ratio >= 0.6:
                data["importance"] = "HIGH"
            elif ratio >= 0.4:
                data["importance"] = "MEDIUM"
            else:
                data["importance"] = "LOW"
        return dict(unit_data)

    def _compute_marks_distribution(self, papers: List[Paper]) -> dict:
        """Compute marks distribution trends."""
        avg_marks_by_year: dict = {}
        for paper in papers:
            year = str(paper.year)
            year_marks = [q.marks for q in paper.questions if q.marks]
            if year_marks:
                avg_marks_by_year[year] = sum(year_marks) / len(year_marks)

        total_q = sum(len(p.questions) for p in papers)
        marks_counts: Counter = Counter()
        for paper in papers:
            for q in paper.questions:
                if q.marks is not None:
                    bucket = f"{int(q.marks)}M"
                    marks_counts[bucket] += 1

        return {
            "by_year": avg_marks_by_year,
            "frequency": dict(marks_counts),
            "total_questions_analyzed": total_q,
        }

    def _compute_difficulty_trends(self, papers: List[Paper]) -> dict:
        """Compute difficulty distribution per year."""
        trends: dict = {}
        for paper in papers:
            year = str(paper.year)
            counts: Counter = Counter(q.difficulty for q in paper.questions)
            total = len(paper.questions) or 1
            trends[year] = {
                "EASY": counts.get("EASY", 0),
                "MEDIUM": counts.get("MEDIUM", 0),
                "HARD": counts.get("HARD", 0),
                "distribution": {
                    "EASY": round(counts.get("EASY", 0) / total * 100),
                    "MEDIUM": round(counts.get("MEDIUM", 0) / total * 100),
                    "HARD": round(counts.get("HARD", 0) / total * 100),
                },
            }
        return trends

    def _compute_question_type_trends(self, papers: List[Paper]) -> dict:
        """Compute question type distribution per year."""
        trends: dict = {}
        for paper in papers:
            year = str(paper.year)
            counts: Counter = Counter(q.question_type for q in paper.questions)
            trends[year] = dict(counts)
        return trends

    def _detect_repetitions(
        self,
        all_papers: List[Paper],
        new_paper: Paper,
        academic_scope_id: str,
        embedding_svc,
        vector_svc,
        gemini_svc,
        db,
        similarity_threshold: float,
    ) -> List[QuestionRepetitionGroup]:
        """
        Detect semantically repeated questions using vector similarity.

        Algorithm:
        1. For each question in the new paper, search for similar questions in other papers
        2. Questions exceeding similarity_threshold are candidates for repetition
        3. Optionally verify with Gemini
        4. Create/update repetition groups
        """
        settings = get_settings()

        # Remove old occurrences for the new paper before recomputing
        HistoricalRepository.delete_occurrences_for_paper(new_paper.id)

        # Get existing groups for this scope
        existing_groups = {
            g.id: g
            for g in HistoricalRepository.get_groups_by_scope(academic_scope_id)
        }

        new_paper_questions = [q for q in new_paper.questions]
        if not new_paper_questions:
            return list(existing_groups.values())

        # Embed new paper's questions
        question_texts = [q.question_text for q in new_paper_questions]
        question_embeddings = embedding_svc.embed_texts(question_texts)

        updated_group_ids = set()

        for i, (q, embedding) in enumerate(zip(new_paper_questions, question_embeddings)):
            # Search for similar questions in other papers (exclude new paper)
            similar = vector_svc.search_paper_questions(
                query_embedding=embedding,
                n_results=10,
                where={
                    "$and": [
                        {"academic_scope_id": {"$eq": academic_scope_id}},
                        {"paper_id": {"$ne": new_paper.id}},
                    ]
                },
            )

            # Filter by threshold
            high_similarity = [
                r for r in similar
                if r["similarity"] >= similarity_threshold
            ]

            if not high_similarity:
                continue

            # Find or create a repetition group
            # Check if any matching question is already in a group
            matched_group = None
            for sim_result in high_similarity:
                q_id = sim_result["metadata"].get("question_id")
                if not q_id:
                    continue
                # Look for existing occurrence
                for group in existing_groups.values():
                    for occ in group.occurrences:
                        if occ.question_id == q_id:
                            matched_group = group
                            break
                    if matched_group:
                        break

            if matched_group:
                # Add new occurrence to existing group
                occ = QuestionRepetitionOccurrence(
                    group_id=matched_group.id,
                    question_id=q.id,
                    paper_id=new_paper.id,
                    year=new_paper.year,
                    similarity_score=high_similarity[0]["similarity"],
                )
                HistoricalRepository.save_occurrence(occ)
                matched_group.occurrence_count += 1
                if new_paper.year not in (matched_group.years or []):
                    matched_group.years = (matched_group.years or []) + [new_paper.year]
                db.session.flush()
                updated_group_ids.add(matched_group.id)
            else:
                # Create a new repetition group
                # Get the most similar existing question for canonical
                best_match = high_similarity[0]
                canonical = q.question_text  # new question as canonical

                group = QuestionRepetitionGroup(
                    academic_scope_id=academic_scope_id,
                    canonical_question=canonical,
                    concept_label=q.topic or "Repeated Question",
                    occurrence_count=2,  # this question + matched
                    importance="MEDIUM",
                    topic=q.topic,
                    unit=q.unit,
                    years=sorted(list({new_paper.year, best_match["metadata"].get("year", new_paper.year)})),
                )
                HistoricalRepository.save_group(group)

                # Add occurrence for the matched question
                matched_q_id = best_match["metadata"].get("question_id")
                if matched_q_id:
                    occ_old = QuestionRepetitionOccurrence(
                        group_id=group.id,
                        question_id=matched_q_id,
                        paper_id=best_match["metadata"]["paper_id"],
                        year=best_match["metadata"].get("year", 0),
                        similarity_score=best_match["similarity"],
                    )
                    HistoricalRepository.save_occurrence(occ_old)

                # Add occurrence for the new question
                occ_new = QuestionRepetitionOccurrence(
                    group_id=group.id,
                    question_id=q.id,
                    paper_id=new_paper.id,
                    year=new_paper.year,
                    similarity_score=best_match["similarity"],
                )
                HistoricalRepository.save_occurrence(occ_new)
                existing_groups[group.id] = group
                updated_group_ids.add(group.id)

        db.session.flush()

        # Remove groups with no remaining occurrences
        HistoricalRepository.delete_empty_groups(academic_scope_id)

        # Return updated groups
        return list(existing_groups.values())

    def _generate_recommendations_with_gemini(
        self, gemini_svc, paper_count: int, papers: List[Paper],
        topic_frequency: dict, repetition_clusters: list,
        marks_distribution: dict, difficulty_trends: dict,
    ) -> dict:
        """Generate study recommendations using Gemini, grounded in actual data."""
        from app.prompts.paper_prompts import HISTORICAL_ANALYSIS_PROMPT

        if not papers:
            return {}

        # Get academic scope info from first paper
        first_paper = papers[0]
        subject = first_paper.subject.name if first_paper.subject else "Unknown"
        branch = first_paper.branch.name if first_paper.branch else "Unknown"
        semester = first_paper.semester.name if first_paper.semester else "Unknown"
        university = ""
        college = ""
        if first_paper.academic_scope:
            university = first_paper.academic_scope.university
            college = first_paper.academic_scope.college

        years = sorted(list({p.year for p in papers}))

        cluster_data = []
        if repetition_clusters:
            for g in repetition_clusters[:10]:  # Limit context size
                cluster_data.append(
                    {
                        "canonical_question": g.canonical_question[:200],
                        "occurrence_count": g.occurrence_count,
                        "years": g.years,
                        "topic": g.topic,
                        "importance": g.importance,
                    }
                )

        prompt = HISTORICAL_ANALYSIS_PROMPT.format(
            university=university or "SGBAU",
            college=college or "Ram Meghe College",
            branch=branch,
            semester=semester,
            subject=subject,
            paper_count=paper_count,
            years=", ".join(str(y) for y in years),
            topic_frequency_json=json.dumps(dict(list(topic_frequency.items())[:15]), indent=2),
            repetition_clusters_json=json.dumps(cluster_data, indent=2),
            marks_data_json=json.dumps(marks_distribution, indent=2),
            difficulty_data_json=json.dumps(difficulty_trends, indent=2),
        )

        return gemini_svc.generate_json(prompt, "historical_analysis")

    def get_subject_intelligence(self, academic_scope_id: str) -> dict:
        """
        Return historical intelligence for a subject scope.
        Returns appropriate response based on evidence level.
        """
        analysis = HistoricalRepository.get_by_scope(academic_scope_id)
        if not analysis:
            return {
                "available": False,
                "evidence_level": EvidenceLevel.NONE,
                "message": "No processed papers found for this subject.",
                "requires_papers": True,
            }

        if analysis.papers_count < 2:
            return {
                "available": False,
                "evidence_level": analysis.evidence_level,
                "papers_count": analysis.papers_count,
                "message": "Historical comparison requires at least two papers in this subject.",
                "single_paper_analysis_available": analysis.papers_count == 1,
            }

        return {
            "available": True,
            "evidence_level": analysis.evidence_level,
            "papers_count": analysis.papers_count,
            "data": analysis.to_dict(),
        }

    def get_fallback_study_intelligence(
        self,
        branch: str,
        semester: str,
        subject: str,
        year: int,
        gemini_svc,
    ) -> dict:
        """
        Gemini fallback when no historical papers exist.
        Explicitly scoped to SGBAU/Ram Meghe College.
        """
        from app.prompts.paper_prompts import FALLBACK_STUDY_INTELLIGENCE_PROMPT

        prompt = FALLBACK_STUDY_INTELLIGENCE_PROMPT.format(
            branch=branch,
            semester=semester,
            subject=subject,
            year=year,
        )
        try:
            result = gemini_svc.generate_json(prompt, "fallback_study_intelligence")
            result["used_fallback"] = True
            result["evidence_level"] = EvidenceLevel.NONE
            return result
        except Exception as e:
            logger.error("fallback_study_intelligence_failed", error=str(e))
            return {
                "used_fallback": True,
                "evidence_level": EvidenceLevel.NONE,
                "data_source": "curriculum_fallback",
                "disclaimer": "AI guidance based on typical curriculum knowledge.",
                "error": "Fallback AI service temporarily unavailable.",
            }
