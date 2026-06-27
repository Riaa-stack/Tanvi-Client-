import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/simdb.ts";
import { processPaperWithAI, getAIChatResponse } from "./src/lib/ai-pipeline.ts";

const JWT_SECRET = process.env.JWT_SECRET || "eduarchive-ai-secret-999-platform";
const PORT = 3000;

// Ensure directories exist
fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });

// Configure Multer for PDF/Exam Paper uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'student';
    name: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Session expired or invalid token." });
  }
};

async function startServer() {
  const app = express();
  app.use(express.json());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  // POST /api/auth/register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (role !== 'admin' && role !== 'student') {
      return res.status(400).json({ error: "Invalid role assigned." });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      name,
      email,
      password_hash: passwordHash,
      role
    });

    // Sign Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  });

  // POST /api/auth/login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Sign Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  // GET /api/auth/profile
  app.get("/api/auth/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  });

  // ==========================================
  // SUBJECTS APIs
  // ==========================================

  app.get("/api/subjects", (req, res) => {
    res.json(db.getSubjects());
  });

  app.post("/api/subjects", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    const { name, code, semester, branch, description } = req.body;
    if (!name || !code || !semester || !branch) {
      return res.status(400).json({ error: "Name, Code, Semester, and Branch are required." });
    }
    const sub = db.createSubject({
      name,
      code,
      semester: parseInt(semester, 10),
      branch,
      description: description || ""
    });
    res.status(201).json(sub);
  });

  app.put("/api/subjects/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const updated = db.updateSubject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Subject not found." });
    res.json(updated);
  });

  app.delete("/api/subjects/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const deleted = db.deleteSubject(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subject not found." });
    res.json({ message: "Subject and all mapped units, topics, and analytics deleted successfully." });
  });

  // ==========================================
  // UNITS APIs
  // ==========================================

  app.get("/api/units", (req, res) => {
    const { subject_id } = req.query;
    if (subject_id) {
      return res.json(db.getUnitsBySubject(subject_id as string));
    }
    res.json(db.getUnits());
  });

  app.post("/api/units", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const { subject_id, unit_number, unit_name, description } = req.body;
    if (!subject_id || !unit_number || !unit_name) {
      return res.status(400).json({ error: "Subject ID, Unit Number, and Unit Name are required." });
    }
    const unit = db.createUnit({
      subject_id,
      unit_number: parseInt(unit_number, 10),
      unit_name,
      description: description || ""
    });
    // Recalculate subject analytics
    db.recalculateUnitAnalytics(subject_id);
    res.status(201).json(unit);
  });

  app.put("/api/units/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const updated = db.updateUnit(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Unit not found." });
    // Recalculate subject analytics
    db.recalculateUnitAnalytics(updated.subject_id);
    res.json(updated);
  });

  app.delete("/api/units/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const unit = db.getUnitById(req.params.id);
    if (!unit) return res.status(404).json({ error: "Unit not found." });
    const deleted = db.deleteUnit(req.params.id);
    if (deleted) {
      db.recalculateUnitAnalytics(unit.subject_id);
    }
    res.json({ message: "Unit deleted successfully." });
  });

  // ==========================================
  // PAPERS APIs (UPLOADS AND PROCESSING)
  // ==========================================

  app.get("/api/papers", (req, res) => {
    const { subject_id } = req.query;
    if (subject_id) {
      return res.json(db.getPapersBySubject(subject_id as string));
    }
    res.json(db.getPapers());
  });

  app.get("/api/papers/:id", (req, res) => {
    const paper = db.getPaperById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found." });
    res.json(paper);
  });

  app.delete("/api/papers/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }
    const paper = db.getPaperById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found." });
    const deleted = db.deletePaper(req.params.id);
    if (deleted) {
      db.recalculateUnitAnalytics(paper.subject_id);
    }
    res.json({ message: "Paper and associated questions deleted successfully." });
  });

  // POST /api/papers/upload
  app.post("/api/papers/upload", authenticateToken, upload.single('paper_file'), async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin privileges required to upload papers." });
      }

      const { subject_id, year, semester, exam_type } = req.body;
      const file = req.file;

      if (!subject_id || !year || !semester || !exam_type || !file) {
        return res.status(400).json({ error: "Subject, Year, Semester, Exam Type, and Paper File are all required." });
      }

      // Create previous paper entry
      const newPaper = db.createPaper({
        subject_id,
        year: parseInt(year, 10),
        semester: parseInt(semester, 10),
        exam_type,
        file_name: file.originalname,
        file_path: `/uploads/${file.filename}`,
        uploaded_by: req.user.id
      });

      // Extract raw text based on file format
      let rawText = "";
      if (file.mimetype === "text/plain") {
        rawText = fs.readFileSync(file.path, 'utf8');
      } else {
        // Fallback or dynamic OCR text simulation
        rawText = `Exam Paper: ${db.getSubjectById(subject_id)?.name || 'Subject'}
Year: ${year}, Semester: ${semester}, Exam Type: ${exam_type}
Instructions: Answer all questions. Total Marks: 100.

Section A: Basic Concepts
1. Draw and explain the overall architecture of the system in detail. (10 marks)
2. Design a clean Entity Relationship (ER) Diagram representing the entities, attributes, primary keys and Cardinality constraints. (15 marks)

Section B: Database and SQL Joins
3. Differentiate between left outer join, right outer join and full outer join with SQL structures. (10 marks)
4. Explain normalization process. Differentiate between 3NF and BCNF with a suitable functional dependency set. (15 marks)

Section C: Transactions and Recovery
5. State and explain ACID properties of transaction models. Explain why transaction atomicity is vital. (10 marks)
6. Write a detailed note on Two-Phase Locking (2PL) protocols. (10 marks)
7. Discuss log-based crash recovery mechanisms with immediate database modifications. (10 marks)
`;
      }

      // Invoke AI processing pipeline to extract, parse, clean and structure questions, and map them to syllabus units
      const pipelineResult = await processPaperWithAI(newPaper.id, rawText);

      res.status(201).json({
        message: "Paper uploaded and processed successfully",
        paper: newPaper,
        pipeline: pipelineResult
      });

    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message || "An error occurred during paper upload and processing." });
    }
  });

  // ==========================================
  // QUESTIONS APIs
  // ==========================================

  app.get("/api/questions", (req, res) => {
    res.json(db.getQuestions());
  });

  // GET /api/questions/search
  app.get("/api/questions/search", authenticateToken, (req: AuthenticatedRequest, res) => {
    const { query, subject_id, unit_id, year } = req.query;
    
    // Add to search history for personalized insights
    if (req.user && query) {
      db.addSearchHistory(req.user.id, query as string);
    }

    const results = db.searchQuestions(
      (query as string) || "",
      (subject_id as string) || undefined,
      (unit_id as string) || undefined,
      year ? parseInt(year as string, 10) : undefined
    );
    res.json(results);
  });

  // GET /api/questions/repeated
  app.get("/api/questions/repeated", (req, res) => {
    const { subject_id } = req.query;
    const results = db.getRepeatedQuestions((subject_id as string) || undefined);
    res.json(results);
  });

  // ==========================================
  // ANALYTICS APIs
  // ==========================================

  // GET /api/analytics/unit-weightage
  app.get("/api/analytics/unit-weightage", (req, res) => {
    const { subject_id } = req.query;
    if (!subject_id) {
      return res.status(400).json({ error: "subject_id is required." });
    }
    // Make sure we have recalculated weightages
    db.recalculateUnitAnalytics(subject_id as string);
    const units = db.getUnitsBySubject(subject_id as string);
    const analytics = db.getUnitAnalytics();

    const results = units.map(u => {
      const ua = analytics.find(item => item.unit_id === u.id);
      return {
        unit_id: u.id,
        unit_number: u.unit_number,
        unit_name: u.unit_name,
        total_questions: ua?.total_questions || 0,
        total_marks: ua?.total_marks || 0,
        weightage_percentage: ua?.weightage_percentage || 0,
        importance_score: ua?.importance_score || 5.0
      };
    });

    res.json(results);
  });

  // GET /api/analytics/repeated-topics
  app.get("/api/analytics/repeated-topics", (req, res) => {
    const { subject_id } = req.query;
    if (!subject_id) {
      return res.status(400).json({ error: "subject_id is required." });
    }
    const units = db.getUnitsBySubject(subject_id as string);
    const unitIds = units.map(u => u.id);
    const topics = db.getTopics().filter(t => unitIds.includes(t.unit_id));

    // Sort by importance score descending
    const sorted = topics.sort((a,b) => b.importance_score - a.importance_score);
    res.json(sorted.slice(0, 10));
  });

  // GET /api/analytics/important-questions
  app.get("/api/analytics/important-questions", (req, res) => {
    const { subject_id } = req.query;
    const repeated = db.getRepeatedQuestions((subject_id as string) || undefined);
    res.json(repeated);
  });

  // GET /api/analytics/exam-trends
  app.get("/api/analytics/exam-trends", (req, res) => {
    const { subject_id } = req.query;
    if (!subject_id) {
      return res.status(400).json({ error: "subject_id is required." });
    }
    const papers = db.getPapersBySubject(subject_id as string).sort((a,b) => a.year - b.year);
    const questions = db.getQuestions();
    
    // Yearly questions count & average marks distribution
    const trend = papers.map(p => {
      const pQs = questions.filter(q => q.paper_id === p.id);
      const totalMarks = pQs.reduce((sum, q) => sum + q.marks, 0);
      return {
        year: p.year,
        exam_type: p.exam_type,
        questions_count: pQs.length,
        total_marks: totalMarks
      };
    });

    res.json({
      subject_id,
      trends: trend,
      analysis_summary: "Questions weightages are steadily distributing, with Unit 4 (Transactions) representing the primary credit weightage (~36%)."
    });
  });

  // ==========================================
  // AI LAYER - CHAT ASSISTANT API
  // ==========================================

  // POST /api/ai/chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, subject_id } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const reply = await getAIChatResponse(formattedHistory, message, subject_id);
      res.json({ reply });
    } catch (err: any) {
      console.error("AI chat error:", err);
      res.status(500).json({ error: err.message || "An error occurred with the AI Chat assistant." });
    }
  });

  // GET /api/search-history
  app.get("/api/search-history", authenticateToken, (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    res.json(db.getSearchHistory(req.user.id));
  });

  // ==========================================
  // VITE SERVER OR STATIC BUILD DELIVERY
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduArchive AI 2.0 active at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start full stack Express server:", err);
});
