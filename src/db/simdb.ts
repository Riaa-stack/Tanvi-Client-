import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'ctdb.json');

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'student';
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  branch: string;
  description: string;
  created_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  unit_name: string;
  description: string;
}

export interface Paper {
  id: string;
  subject_id: string;
  year: number;
  semester: number;
  exam_type: string; // 'ESE' | 'MSE' | 'Sessional'
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  paper_id: string;
  unit_id: string;
  question_text: string;
  marks: number;
  question_type: string; // 'Descriptive' | 'MCQ' | 'Short'
}

export interface Topic {
  id: string;
  unit_id: string;
  topic_name: string;
  importance_score: number;
}

export interface QuestionOccurrence {
  id: string;
  question_id: string;
  paper_id: string;
  year: number;
  frequency: number;
}

export interface UnitAnalytics {
  id: string;
  unit_id: string;
  total_questions: number;
  total_marks: number;
  weightage_percentage: number;
  importance_score: number;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
}

export interface DBStructure {
  users: User[];
  subjects: Subject[];
  units: Unit[];
  papers: Paper[];
  questions: Question[];
  topics: Topic[];
  question_occurrences: QuestionOccurrence[];
  unit_analytics: UnitAnalytics[];
  search_history: SearchHistory[];
}

const INITIAL_DB: DBStructure = {
  users: [
    {
      id: 'admin-1',
      name: 'Dr. Sarah Mitchell',
      email: 'admin@eduarchive.ac.in',
      // bcrypt hash for "password123"
      password_hash: '$2a$10$vPZ5U4TmsZ4C8HhP3f6hAejZ65q6H9Y92hG9S/eX10f3UvF8B6bT2',
      role: 'admin',
      created_at: new Date('2026-01-10').toISOString()
    },
    {
      id: 'student-1',
      name: 'Rohan Sharma',
      email: 'student@eduarchive.ac.in',
      // bcrypt hash for "password123"
      password_hash: '$2a$10$vPZ5U4TmsZ4C8HhP3f6hAejZ65q6H9Y92hG9S/eX10f3UvF8B6bT2',
      role: 'student',
      created_at: new Date('2026-02-15').toISOString()
    }
  ],
  subjects: [
    {
      id: 'sub-dbms',
      name: 'Database Management Systems',
      code: 'CS-501',
      semester: 5,
      branch: 'Computer Science & Engineering',
      description: 'Covers relational algebra, SQL, normalization, index structures, concurrency control, and transactional processing.',
      created_at: new Date('2026-03-01').toISOString()
    },
    {
      id: 'sub-cn',
      name: 'Computer Networks',
      code: 'CS-502',
      semester: 5,
      branch: 'Computer Science & Engineering',
      description: 'Study of network architecture, OSI and TCP/IP protocol suites, congestion control, routing protocols, and security.',
      created_at: new Date('2026-03-02').toISOString()
    },
    {
      id: 'sub-os',
      name: 'Operating Systems',
      code: 'CS-503',
      semester: 5,
      branch: 'Computer Science & Engineering',
      description: 'Explores process management, thread synchronization, memory management, file systems, disk scheduling, and I/O.',
      created_at: new Date('2026-03-03').toISOString()
    }
  ],
  units: [
    // DBMS Units
    { id: 'unit-dbms-1', subject_id: 'sub-dbms', unit_number: 1, unit_name: 'Introduction & ER Model', description: 'Database system architecture, data models, ER diagrams, constraints, and design issues.' },
    { id: 'unit-dbms-2', subject_id: 'sub-dbms', unit_number: 2, unit_name: 'Relational Model & SQL', description: 'Relational algebra, SQL DDL/DML, joins, subqueries, integrity constraints, and views.' },
    { id: 'unit-dbms-3', subject_id: 'sub-dbms', unit_number: 3, unit_name: 'Database Design & Normalization', description: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, multi-valued dependencies, and indexing mechanisms.' },
    { id: 'unit-dbms-4', subject_id: 'sub-dbms', unit_number: 4, unit_name: 'Transaction & Concurrency Control', description: 'ACID properties, states, schedules, serializability, lock-based protocols, and timestamping.' },
    { id: 'unit-dbms-5', subject_id: 'sub-dbms', unit_number: 5, unit_name: 'Crash Recovery & Modern Systems', description: 'Log-based recovery, shadow paging, ARIES, NoSQL architectures, and distributed databases.' },
    // CN Units
    { id: 'unit-cn-1', subject_id: 'sub-cn', unit_number: 1, unit_name: 'Physical & Data Link Layer', description: 'Transmission media, framing, error detection & correction, sliding window protocols.' },
    { id: 'unit-cn-2', subject_id: 'sub-cn', unit_number: 2, unit_name: 'Medium Access Sublayer', description: 'Multiple access protocols, Ethernet, hubs, bridges, switches, and VLANs.' },
    { id: 'unit-cn-3', subject_id: 'sub-cn', unit_number: 3, unit_name: 'Network Layer', description: 'IPv4, IPv6 routing algorithms, congestion control, DHCP, ICMP, and NAT.' },
    { id: 'unit-cn-4', subject_id: 'sub-cn', unit_number: 4, unit_name: 'Transport Layer', description: 'UDP, TCP connection management, flow control, congestion window, and quality of service.' },
    { id: 'unit-cn-5', subject_id: 'sub-cn', unit_number: 5, unit_name: 'Application Layer', description: 'DNS, SMTP, HTTP, FTP, and basic network cryptography/security.' },
    // OS Units
    { id: 'unit-os-1', subject_id: 'sub-os', unit_number: 1, unit_name: 'OS Overview & Process Management', description: 'System calls, structure, processes, context switching, CPU scheduling algorithms.' },
    { id: 'unit-os-2', subject_id: 'sub-os', unit_number: 2, unit_name: 'Process Synchronization', description: 'Critical sections, semaphores, monitors, classical synchronization problems, and deadlocks.' },
    { id: 'unit-os-3', subject_id: 'sub-os', unit_number: 3, unit_name: 'Memory Management', description: 'Paging, segmentation, page replacement algorithms, Thrashing, and translation lookaside buffer.' },
    { id: 'unit-os-4', subject_id: 'sub-os', unit_number: 4, unit_name: 'Storage & File Systems', description: 'Directory structure, allocation methods, disk head scheduling, RAID, and free space management.' },
    { id: 'unit-os-5', subject_id: 'sub-os', unit_number: 5, unit_name: 'Security & Protection', description: 'Access matrices, authentication, malware, and virtualization mechanics.' }
  ],
  papers: [
    { id: 'paper-dbms-2025-ese', subject_id: 'sub-dbms', year: 2025, semester: 5, exam_type: 'ESE', file_name: 'DBMS_ESE_2025.pdf', file_path: '/uploads/DBMS_ESE_2025.pdf', uploaded_by: 'admin-1', created_at: new Date('2026-03-10').toISOString() },
    { id: 'paper-dbms-2024-ese', subject_id: 'sub-dbms', year: 2024, semester: 5, exam_type: 'ESE', file_name: 'DBMS_ESE_2024.pdf', file_path: '/uploads/DBMS_ESE_2024.pdf', uploaded_by: 'admin-1', created_at: new Date('2026-03-11').toISOString() },
    { id: 'paper-dbms-2025-mse', subject_id: 'sub-dbms', year: 2025, semester: 5, exam_type: 'MSE', file_name: 'DBMS_MSE_2025.pdf', file_path: '/uploads/DBMS_MSE_2025.pdf', uploaded_by: 'admin-1', created_at: new Date('2026-03-12').toISOString() }
  ],
  questions: [
    // 2025 ESE Questions
    { id: 'q-dbms-1', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-1', question_text: 'Draw and explain the overall system architecture of a Database Management System.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-2', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-1', question_text: 'An enterprise wants to maintain a library database. Identify entities, relationships and draw an ER Diagram with keys and cardinality.', marks: 15, question_type: 'Descriptive' },
    { id: 'q-dbms-3', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-2', question_text: 'Explain different types of Outer Joins in SQL with syntax and examples.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-4', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-3', question_text: 'What is normalization? Explain functional dependency and 3NF and BCNF with suitable examples.', marks: 15, question_type: 'Descriptive' },
    { id: 'q-dbms-5', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-4', question_text: 'State and explain ACID properties of a transaction in detail.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-6', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-4', question_text: 'Explain Two-Phase Locking (2PL) protocol. Distinguish between Conservative 2PL and Strict 2PL.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-7', paper_id: 'paper-dbms-2025-ese', unit_id: 'unit-dbms-5', question_text: 'Discuss log-based crash recovery protocols with deferred and immediate update strategies.', marks: 10, question_type: 'Descriptive' },

    // 2024 ESE Questions (some repeated!)
    { id: 'q-dbms-8', paper_id: 'paper-dbms-2024-ese', unit_id: 'unit-dbms-4', question_text: 'Define Transaction. Explain ACID properties with a suitable example.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-9', paper_id: 'paper-dbms-2024-ese', unit_id: 'unit-dbms-3', question_text: 'Discuss normalization. Define 1NF, 2NF, 3NF and BCNF along with decomposition examples.', marks: 15, question_type: 'Descriptive' },
    { id: 'q-dbms-10', paper_id: 'paper-dbms-2024-ese', unit_id: 'unit-dbms-1', question_text: 'Design an ER diagram for a Hospital Management System showing cardinalities and primary keys.', marks: 15, question_type: 'Descriptive' },
    { id: 'q-dbms-11', paper_id: 'paper-dbms-2024-ese', unit_id: 'unit-dbms-2', question_text: 'Explain group by and having clauses in SQL with examples.', marks: 10, question_type: 'Descriptive' },
    { id: 'q-dbms-12', paper_id: 'paper-dbms-2024-ese', unit_id: 'unit-dbms-4', question_text: 'What are serializability and locking protocols? Explain Strict Two-Phase Locking.', marks: 10, question_type: 'Descriptive' }
  ],
  topics: [
    { id: 'top-1', unit_id: 'unit-dbms-4', topic_name: 'ACID Properties', importance_score: 9.8 },
    { id: 'top-2', unit_id: 'unit-dbms-4', topic_name: 'Two-Phase Locking (2PL)', importance_score: 9.2 },
    { id: 'top-3', unit_id: 'unit-dbms-3', topic_name: '3NF & BCNF Decomposition', importance_score: 9.5 },
    { id: 'top-4', unit_id: 'unit-dbms-1', topic_name: 'ER Diagram Design', importance_score: 8.8 },
    { id: 'top-5', unit_id: 'unit-dbms-2', topic_name: 'SQL Joins & Grouping', importance_score: 8.0 },
    { id: 'top-6', unit_id: 'unit-dbms-5', topic_name: 'Log-based Recovery', importance_score: 7.2 }
  ],
  question_occurrences: [
    { id: 'occ-1', question_id: 'q-dbms-5', paper_id: 'paper-dbms-2025-ese', year: 2025, frequency: 3 },
    { id: 'occ-2', question_id: 'q-dbms-8', paper_id: 'paper-dbms-2024-ese', year: 2024, frequency: 3 },
    { id: 'occ-3', question_id: 'q-dbms-4', paper_id: 'paper-dbms-2025-ese', year: 2025, frequency: 2 },
    { id: 'occ-4', question_id: 'q-dbms-9', paper_id: 'paper-dbms-2024-ese', year: 2024, frequency: 2 },
    { id: 'occ-5', question_id: 'q-dbms-6', paper_id: 'paper-dbms-2025-ese', year: 2025, frequency: 2 },
    { id: 'occ-6', question_id: 'q-dbms-12', paper_id: 'paper-dbms-2024-ese', year: 2024, frequency: 2 }
  ],
  unit_analytics: [
    { id: 'ua-1', unit_id: 'unit-dbms-1', total_questions: 3, total_marks: 40, weightage_percentage: 23, importance_score: 8.5 },
    { id: 'ua-2', unit_id: 'unit-dbms-2', total_questions: 2, total_marks: 20, weightage_percentage: 12, importance_score: 7.0 },
    { id: 'ua-3', unit_id: 'unit-dbms-3', total_questions: 2, total_marks: 30, weightage_percentage: 17, importance_score: 9.5 },
    { id: 'ua-4', unit_id: 'unit-dbms-4', total_questions: 4, total_marks: 40, weightage_percentage: 36, importance_score: 9.9 },
    { id: 'ua-5', unit_id: 'unit-dbms-5', total_questions: 1, total_marks: 10, weightage_percentage: 12, importance_score: 6.5 }
  ],
  search_history: []
};

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading ctdb.json, using fallback:', err);
    return INITIAL_DB;
  }
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing ctdb.json:', err);
  }
}

export const db = {
  // USERS
  getUsers: (): User[] => readDB().users,
  getUserById: (id: string): User | undefined => readDB().users.find(u => u.id === id),
  getUserByEmail: (email: string): User | undefined => readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: Omit<User, 'id' | 'created_at'>): User => {
    const data = readDB();
    const newUser: User = {
      ...user,
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },

  // SUBJECTS
  getSubjects: (): Subject[] => readDB().subjects,
  getSubjectById: (id: string): Subject | undefined => readDB().subjects.find(s => s.id === id),
  createSubject: (subject: Omit<Subject, 'id' | 'created_at'>): Subject => {
    const data = readDB();
    const newSubject: Subject = {
      ...subject,
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    data.subjects.push(newSubject);
    writeDB(data);
    return newSubject;
  },
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id' | 'created_at'>>): Subject | undefined => {
    const data = readDB();
    const index = data.subjects.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    data.subjects[index] = { ...data.subjects[index], ...updates };
    writeDB(data);
    return data.subjects[index];
  },
  deleteSubject: (id: string): boolean => {
    const data = readDB();
    const initialLen = data.subjects.length;
    data.subjects = data.subjects.filter(s => s.id !== id);
    // Cascade delete units, papers, etc.
    const unitsToDelete = data.units.filter(u => u.subject_id === id).map(u => u.id);
    data.units = data.units.filter(u => u.subject_id !== id);
    data.papers = data.papers.filter(p => p.subject_id !== id);
    data.questions = data.questions.filter(q => !unitsToDelete.includes(q.unit_id));
    data.unit_analytics = data.unit_analytics.filter(ua => !unitsToDelete.includes(ua.unit_id));
    writeDB(data);
    return data.subjects.length < initialLen;
  },

  // UNITS
  getUnits: (): Unit[] => readDB().units,
  getUnitsBySubject: (subId: string): Unit[] => readDB().units.filter(u => u.subject_id === subId).sort((a,b) => a.unit_number - b.unit_number),
  getUnitById: (id: string): Unit | undefined => readDB().units.find(u => u.id === id),
  createUnit: (unit: Omit<Unit, 'id'>): Unit => {
    const data = readDB();
    const newUnit: Unit = {
      ...unit,
      id: 'unit-' + Math.random().toString(36).substr(2, 9)
    };
    data.units.push(newUnit);
    writeDB(data);
    return newUnit;
  },
  updateUnit: (id: string, updates: Partial<Omit<Unit, 'id'>>): Unit | undefined => {
    const data = readDB();
    const index = data.units.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    data.units[index] = { ...data.units[index], ...updates };
    writeDB(data);
    return data.units[index];
  },
  deleteUnit: (id: string): boolean => {
    const data = readDB();
    const initialLen = data.units.length;
    data.units = data.units.filter(u => u.id !== id);
    data.questions = data.questions.filter(q => q.unit_id !== id);
    data.topics = data.topics.filter(t => t.unit_id !== id);
    data.unit_analytics = data.unit_analytics.filter(ua => ua.unit_id !== id);
    writeDB(data);
    return data.units.length < initialLen;
  },

  // PAPERS
  getPapers: (): Paper[] => readDB().papers,
  getPaperById: (id: string): Paper | undefined => readDB().papers.find(p => p.id === id),
  getPapersBySubject: (subId: string): Paper[] => readDB().papers.filter(p => p.subject_id === subId),
  createPaper: (paper: Omit<Paper, 'id' | 'created_at'>): Paper => {
    const data = readDB();
    const newPaper: Paper = {
      ...paper,
      id: 'paper-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    data.papers.push(newPaper);
    writeDB(data);
    return newPaper;
  },
  deletePaper: (id: string): boolean => {
    const data = readDB();
    const initialLen = data.papers.length;
    data.papers = data.papers.filter(p => p.id !== id);
    data.questions = data.questions.filter(q => q.paper_id !== id);
    data.question_occurrences = data.question_occurrences.filter(qo => qo.paper_id !== id);
    writeDB(data);
    return data.papers.length < initialLen;
  },

  // QUESTIONS
  getQuestions: (): Question[] => readDB().questions,
  getQuestionById: (id: string): Question | undefined => readDB().questions.find(q => q.id === id),
  getQuestionsByPaper: (paperId: string): Question[] => readDB().questions.filter(q => q.paper_id === paperId),
  createQuestion: (question: Omit<Question, 'id'>): Question => {
    const data = readDB();
    const newQuestion: Question = {
      ...question,
      id: 'q-' + Math.random().toString(36).substr(2, 9)
    };
    data.questions.push(newQuestion);
    writeDB(data);
    return newQuestion;
  },
  searchQuestions: (query: string, subjectId?: string, unitId?: string, year?: number): Question[] => {
    const data = readDB();
    let result = data.questions;

    if (subjectId) {
      const papers = data.papers.filter(p => p.subject_id === subjectId).map(p => p.id);
      result = result.filter(q => papers.includes(q.paper_id));
    }
    if (unitId) {
      result = result.filter(q => q.unit_id === unitId);
    }
    if (year) {
      const papers = data.papers.filter(p => p.year === year).map(p => p.id);
      result = result.filter(q => papers.includes(q.paper_id));
    }
    if (query) {
      const qLower = query.toLowerCase();
      result = result.filter(q => q.question_text.toLowerCase().includes(qLower));
    }

    return result;
  },

  getRepeatedQuestions: (subjectId?: string): (Question & { frequency: number; years: number[] })[] => {
    const data = readDB();
    const occurrences = data.question_occurrences;
    const questions = data.questions;
    const papers = data.papers;

    // We can group questions by text similarity, or use occurrences
    // Let's group by question text matching or direct occurrences links
    const repeated: (Question & { frequency: number; years: number[] })[] = [];

    questions.forEach(q => {
      const paperObj = papers.find(p => p.id === q.paper_id);
      if (!paperObj) return;
      if (subjectId && paperObj.subject_id !== subjectId) return;

      const qOccs = occurrences.filter(o => o.question_id === q.id);
      if (qOccs.length > 0) {
        const freq = qOccs.reduce((sum, o) => sum + (o.frequency || 1), 0);
        const years = Array.from(new Set(qOccs.map(o => o.year)));
        repeated.push({
          ...q,
          frequency: freq,
          years: years.length > 0 ? years : [paperObj.year]
        });
      } else {
        // Look for similar text
        const textLower = q.question_text.toLowerCase().trim();
        // Check if we already grouped this question text
        const existing = repeated.find(r => r.question_text.toLowerCase().trim() === textLower);
        if (existing) {
          existing.frequency += 1;
          if (paperObj.year && !existing.years.includes(paperObj.year)) {
            existing.years.push(paperObj.year);
          }
        } else {
          repeated.push({
            ...q,
            frequency: 1,
            years: [paperObj.year]
          });
        }
      }
    });

    return repeated.filter(r => r.frequency > 1).sort((a,b) => b.frequency - a.frequency);
  },

  // TOPICS
  getTopics: (): Topic[] => readDB().topics,
  createTopic: (topic: Omit<Topic, 'id'>): Topic => {
    const data = readDB();
    const newTopic: Topic = {
      ...topic,
      id: 'top-' + Math.random().toString(36).substr(2, 9)
    };
    data.topics.push(newTopic);
    writeDB(data);
    return newTopic;
  },
  getTopicsByUnit: (unitId: string): Topic[] => readDB().topics.filter(t => t.unit_id === unitId),

  // QUESTION OCCURRENCES
  getOccurrences: (): QuestionOccurrence[] => readDB().question_occurrences,
  createOccurrence: (occ: Omit<QuestionOccurrence, 'id'>): QuestionOccurrence => {
    const data = readDB();
    const newOcc: QuestionOccurrence = {
      ...occ,
      id: 'occ-' + Math.random().toString(36).substr(2, 9)
    };
    data.question_occurrences.push(newOcc);
    writeDB(data);
    return newOcc;
  },

  // UNIT ANALYTICS
  getUnitAnalytics: (): UnitAnalytics[] => readDB().unit_analytics,
  getUnitAnalyticsByUnit: (unitId: string): UnitAnalytics | undefined => readDB().unit_analytics.find(ua => ua.unit_id === unitId),
  saveUnitAnalytics: (ua: UnitAnalytics) => {
    const data = readDB();
    const idx = data.unit_analytics.findIndex(item => item.unit_id === ua.unit_id);
    if (idx !== -1) {
      data.unit_analytics[idx] = ua;
    } else {
      data.unit_analytics.push(ua);
    }
    writeDB(data);
  },
  recalculateUnitAnalytics: (subjectId: string) => {
    const data = readDB();
    const units = data.units.filter(u => u.subject_id === subjectId);
    const papers = data.papers.filter(p => p.subject_id === subjectId);
    const paperIds = papers.map(p => p.id);
    const questions = data.questions.filter(q => paperIds.includes(q.paper_id));

    let grandTotalMarks = 0;
    const unitStats = units.map(u => {
      const uQuestions = questions.filter(q => q.unit_id === u.id);
      const totalMarks = uQuestions.reduce((sum, q) => sum + (q.marks || 10), 0);
      grandTotalMarks += totalMarks;

      return {
        unit_id: u.id,
        total_questions: uQuestions.length,
        total_marks: totalMarks,
      };
    });

    unitStats.forEach(stat => {
      const weightage = grandTotalMarks > 0 ? parseFloat(((stat.total_marks / grandTotalMarks) * 100).toFixed(1)) : 0;
      // Calculate importance score: based on total marks and frequency of repeating questions
      const repeatedCount = data.questions.filter(q => q.unit_id === stat.unit_id).reduce((sum, q) => {
        const occs = data.question_occurrences.filter(o => o.question_id === q.id);
        const hasRepeat = occs.length > 0;
        return sum + (hasRepeat ? 1 : 0);
      }, 0);

      const importance = Math.min(10, parseFloat((5 + (stat.total_questions * 0.5) + (repeatedCount * 1.2)).toFixed(1)));

      const idx = data.unit_analytics.findIndex(ua => ua.unit_id === stat.unit_id);
      const newAnalytics: UnitAnalytics = {
        id: idx !== -1 ? data.unit_analytics[idx].id : 'ua-' + Math.random().toString(36).substr(2, 9),
        unit_id: stat.unit_id,
        total_questions: stat.total_questions,
        total_marks: stat.total_marks,
        weightage_percentage: weightage,
        importance_score: importance || 5.0
      };

      if (idx !== -1) {
        data.unit_analytics[idx] = newAnalytics;
      } else {
        data.unit_analytics.push(newAnalytics);
      }
    });

    writeDB(data);
  },

  // SEARCH HISTORY
  getSearchHistory: (userId: string): SearchHistory[] => readDB().search_history.filter(sh => sh.user_id === userId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  addSearchHistory: (userId: string, query: string) => {
    const data = readDB();
    const newSearch: SearchHistory = {
      id: 'sh-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      query,
      created_at: new Date().toISOString()
    };
    data.search_history.push(newSearch);
    writeDB(data);
  }
};
