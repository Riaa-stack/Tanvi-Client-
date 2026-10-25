import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Layers,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Sparkles,
  ExternalLink,
  BookMarked,
  CheckCircle2,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { StickyNote } from '@/components/notebook/StickyNote';
import { toast } from '@/store/useToastStore';
import { useNavigate } from 'react-router-dom';

interface SyllabusUnit {
  unitNumber: number;
  title: string;
  hours: number;
  marksWeightage: number;
  topics: string[];
}

interface SyllabusSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  branch: string;
  credits: number;
  theoryMarks: number;
  internalMarks: number;
  overview: string;
  objectives: string[];
  units: SyllabusUnit[];
  textbooks: string[];
  references: string[];
}

const SYLLABUS_DATA: SyllabusSubject[] = [
  // ── SEMESTER 3 ─────────────────────────────────────────────────────────────
  {
    id: 'sem3-dsa',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    semester: 3,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Foundational course on linear and non-linear data structures, asymptotic algorithm analysis, algorithm design paradigms, memory layouts, and practical applications in engineering.',
    objectives: [
      'Understand primitive and abstract data types (ADTs)',
      'Analyze algorithmic time and space complexity using Big-O, Theta, and Omega notations',
      'Implement linear data structures: stacks, queues, and linked lists',
      'Master non-linear trees, binary search trees, AVL trees, and graphs',
      'Apply dynamic programming, divide and conquer, and greedy strategies',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Introduction to Algorithms & Complexity Analysis',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Definition of algorithms, pseudo-code conventions, space and time tradeoffs',
          'Asymptotic notations: Big-O, Omega, Theta, Little-o, and Little-omega',
          'Recurrence relations: Substitution method, Recursion tree method, and Master Theorem',
          'Array ADT: Row-major and column-major address calculation, sparse matrix representations',
          'Searching techniques: Linear search, binary search, and exponential search analysis',
        ],
      },
      {
        unitNumber: 2,
        title: 'Linear Data Structures: Stacks & Queues',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Stack ADT: Array and pointer-based implementations, push, pop, peek operations',
          'Stack applications: Infix to postfix/prefix conversion, postfix expression evaluation, recursion simulation',
          'Queue ADT: FIFO property, array and circular queue implementation',
          'Double-Ended Queue (Deque) and Priority Queues using ordered lists',
          'Queue applications: CPU scheduling simulation, round-robin dispatch, breadth-first traversal buffer',
        ],
      },
      {
        unitNumber: 3,
        title: 'Linked Lists & Dynamic Memory Structures',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Singly linked list: Dynamic node allocation, insertion, deletion at arbitrary positions, reversing',
          'Doubly linked list: Bidirectional traversal, deletion of given node without header traversal',
          'Circular linked lists: Single and double circular implementations, applications in buffer rings',
          'Polynomial representation and addition using linked lists',
          'Memory management: Dynamic heap allocation, fragmentation issues, and free list coalescing',
        ],
      },
      {
        unitNumber: 4,
        title: 'Non-Linear Structures: Trees & Binary Search Trees',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Tree terminology: Root, children, height, depth, level, binary tree properties and theorems',
          'Tree traversals: Recursive and iterative Pre-order, In-order, Post-order, and Level-order',
          'Binary Search Trees (BST): Insertion, searching, predecessor, successor, and node deletion cases',
          'Self-balancing trees: AVL trees, balance factor, single (LL, RR) and double (LR, RL) rotations',
          'Heaps: Max-heap, min-heap properties, array representation, heapify algorithm, and priority queue operations',
        ],
      },
      {
        unitNumber: 5,
        title: 'Graphs & Network Algorithms',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Graph representations: Adjacency matrix, adjacency list, compact array representation',
          'Graph traversals: Depth-First Search (DFS) with time stamps, Breadth-First Search (BFS) and queue queueing',
          'Topological sorting of Directed Acyclic Graphs (DAGs) using Kahn algorithm and DFS finish times',
          'Minimum Spanning Trees: Kruskal algorithm with Disjoint-Set Union (DSU) and Prim algorithm',
          'Shortest Paths: Dijkstra algorithm with priority queue, Bellman-Ford algorithm with negative cycle detection',
        ],
      },
      {
        unitNumber: 6,
        title: 'Sorting, Hashing & Algorithm Paradigms',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Comparison-based sorting: MergeSort, QuickSort (Lomuto vs Hoare partitioning), HeapSort',
          'Linear time sorting: Counting sort, Radix sort, and Bucket sort assumptions',
          'Hashing techniques: Hash functions (division, multiplication, universal hashing)',
          'Collision resolution: Chaining vs Open Addressing (linear probing, quadratic probing, double hashing)',
          'Algorithm paradigms overview: Divide & Conquer, Greedy method, Dynamic Programming introduction',
        ],
      },
    ],
    textbooks: [
      'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein — "Introduction to Algorithms" (CLRS), 3rd Edition, MIT Press',
      'Ellis Horowitz, Sartaj Sahni, Susan Anderson-Freed — "Fundamentals of Data Structures in C", 2nd Edition, Universities Press',
    ],
    references: [
      'Robert Sedgewick, Kevin Wayne — "Algorithms", 4th Edition, Addison-Wesley Professional',
      'Mark Allen Weiss — "Data Structures and Algorithm Analysis in C++", 4th Edition, Pearson',
    ],
  },
  {
    id: 'sem3-oop',
    code: 'CS302',
    name: 'Object-Oriented Programming with C++',
    semester: 3,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Comprehensive study of object-oriented principles, classes, abstraction, encapsulation, inheritance, polymorphism, templates, exception handling, and standard template library (STL).',
    objectives: [
      'Apply OOP paradigms to develop modular and maintainable software systems',
      'Understand constructors, destructors, dynamic memory allocation with new/delete',
      'Implement single, multiple, multilevel, hierarchical, and hybrid inheritance',
      'Master compile-time and runtime polymorphism with virtual functions and pure virtual methods',
      'Utilize Standard Template Library (STL) containers, iterators, and generic algorithms',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Principles of OOP & C++ Basics',
        hours: 7,
        marksWeightage: 14,
        topics: [
          'Limitations of procedural programming, OOP concepts: Abstraction, Encapsulation, Inheritance, Polymorphism',
          'C++ tokens, keywords, data types, scope resolution operator (::), reference variables',
          'Function prototyping, inline functions, default arguments, const arguments, function overloading',
          'Dynamic memory management: new and delete operators compared with malloc and free',
        ],
      },
      {
        unitNumber: 2,
        title: 'Classes, Objects & Constructors',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Specifying a class, defining member functions inside and outside class boundary',
          'Access specifiers: private, protected, public, memory allocation for objects, static data members and functions',
          'Arrays of objects, passing objects as arguments, returning objects from functions',
          'Friend functions and friend classes, dereferencing operators and this pointer',
          'Constructors: Default, parameterized, copy constructor, dynamic constructor, destructor semantics',
        ],
      },
      {
        unitNumber: 3,
        title: 'Operator Overloading & Type Conversions',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Concept of operator overloading, rules and constraints for overloading operators',
          'Overloading unary operators (prefix and postfix increment/decrement)',
          'Overloading binary operators using member functions and friend functions',
          'Overloading stream insertion (<<) and extraction (>>) operators',
          'Type conversions: Basic to class type, class to basic type, class to another class type',
        ],
      },
      {
        unitNumber: 4,
        title: 'Inheritance & Reusability',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Inheritance concepts, base class and derived class declaration, visibility modes',
          'Single inheritance, multilevel inheritance, multiple inheritance with ambiguity resolution',
          'Hierarchical inheritance and hybrid inheritance, diamond problem',
          'Virtual base classes, order of constructor and destructor calls in inheritance hierarchy',
          'Containership vs inheritance (has-a vs is-a relationship)',
        ],
      },
      {
        unitNumber: 5,
        title: 'Polymorphism & Virtual Functions',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Compile-time vs run-time polymorphism, pointers to objects, base class pointers to derived objects',
          'Virtual functions, vtable and vptr internal mechanics',
          'Pure virtual functions and abstract classes, virtual destructors and importance',
          'Dynamic binding, object slicing phenomena and prevention with references and pointers',
        ],
      },
      {
        unitNumber: 6,
        title: 'Templates, Exception Handling & STL',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Function templates with multiple parameters, class templates with default arguments',
          'Exception handling: try, throw, catch mechanisms, rethrowing exceptions, catch-all handler',
          'Standard Template Library (STL) architecture: Containers (vector, list, map, set), Iterators, Algorithms',
          'File stream operations: ifstream, ofstream, fstream, reading and writing objects to binary files',
        ],
      },
    ],
    textbooks: [
      'E. Balagurusamy — "Object Oriented Programming with C++", 8th Edition, McGraw-Hill',
      'Robert Lafore — "Object-Oriented Programming in C++", 4th Edition, Sams Publishing',
    ],
    references: [
      'Bjarne Stroustrup — "The C++ Programming Language", 4th Edition, Addison-Wesley',
      'Scott Meyers — "Effective C++: 55 Specific Ways to Improve Your Programs and Designs", 3rd Edition, O\'Reilly',
    ],
  },

  // ── SEMESTER 4 ─────────────────────────────────────────────────────────────
  {
    id: 'sem4-dbms',
    code: 'CS401',
    name: 'Database Management Systems',
    semester: 4,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Database system architectures, relational data modeling, relational algebra, advanced SQL, normalisation theory (1NF to BCNF), transaction processing, concurrency control, and recovery mechanisms.',
    objectives: [
      'Design conceptual Entity-Relationship (ER) schemas for enterprise domains',
      'Convert ER diagrams into normalized relational schema tables',
      'Formulate complex relational algebra queries and SQL queries with joins and subqueries',
      'Apply functional dependencies and normal forms to eradicate update, insert, and delete anomalies',
      'Understand ACID properties, serializability, two-phase locking (2PL), and logging protocols',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Database Architecture & ER Modeling',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'DBMS vs file systems, 3-tier ANSI-SPARC architecture, physical and logical data independence',
          'Data models: Hierarchical, network, relational, object-relational',
          'Entity-Relationship model: Entities, attributes (composite, multivalued, derived), keys, relationship sets',
          'Cardinality ratios, participation constraints, weak entities, enhanced ER (EER) specialization and generalization',
        ],
      },
      {
        unitNumber: 2,
        title: 'Relational Model & Relational Algebra',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Relational model concepts: Domains, attributes, tuples, relations, relation schema',
          'Integrity constraints: Domain constraints, primary key constraints, entity integrity, referential integrity',
          'Relational algebra operations: Select, project, union, set difference, Cartesian product, rename',
          'Relational joins: Theta join, equijoin, natural join, outer joins (left, right, full)',
          'Tuple relational calculus and domain relational calculus expressive power overview',
        ],
      },
      {
        unitNumber: 3,
        title: 'Structured Query Language (SQL)',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'SQL data definition (DDL): CREATE, ALTER, DROP, TRUNCATE, constraints (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE)',
          'SQL data manipulation (DML): INSERT, UPDATE, DELETE, SELECT query clauses (WHERE, GROUP BY, HAVING, ORDER BY)',
          'SQL aggregate functions: COUNT, SUM, AVG, MIN, MAX, handling NULL values',
          'Nested subqueries: Correlated and non-correlated subqueries, IN, EXISTS, ANY, ALL clauses',
          'Views: Creation, updating through views, indexed views, assertions and triggers',
        ],
      },
      {
        unitNumber: 4,
        title: 'Relational Database Design & Normalisation',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Pitfalls in relational database design: Redundancy, update anomalies, insertion anomalies, deletion anomalies',
          'Functional dependencies: Definition, inference rules, Armstrong axioms, attribute closure algorithm',
          'Canonical cover, minimal cover of functional dependencies, lossless-join decomposition, dependency preservation',
          'Normal forms: First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF)',
          'Boyce-Codd Normal Form (BCNF): Decomposition algorithm, multi-valued dependencies and 4NF preview',
        ],
      },
      {
        unitNumber: 5,
        title: 'Transaction Processing & ACID Properties',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Transaction concept: States of transaction (active, partially committed, committed, failed, aborted)',
          'ACID properties: Atomicity, Consistency, Isolation, Durability',
          'Schedules: Serial, non-serial, concurrent execution benefits',
          'Serializability: Conflict serializability, conflict equivalence, precedence graph algorithm',
          'View serializability, recoverability: Recoverable schedules, cascadeless schedules, strict schedules',
        ],
      },
      {
        unitNumber: 6,
        title: 'Concurrency Control & Crash Recovery',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Concurrency problems: Dirty read, unrepeatable read, lost update, phantom read',
          'Lock-based protocols: Shared and exclusive locks, Two-Phase Locking (2PL), Strict 2PL, Rigorous 2PL',
          'Deadlock handling: Prevention (Wait-Die, Wound-Wait) vs Deadlock detection and cycle recovery',
          'Timestamp ordering protocol, write-ahead logging (WAL), log records format, checkpointing',
          'Recovery algorithms: Deferred database modification, immediate database modification, ARIES overview',
        ],
      },
    ],
    textbooks: [
      'Abraham Silberschatz, Henry F. Korth, S. Sudarshan — "Database System Concepts", 7th Edition, McGraw-Hill',
      'Ramez Elmasri, Shamkant B. Navathe — "Fundamentals of Database Systems", 7th Edition, Pearson',
    ],
    references: [
      'Raghu Ramakrishnan, Johannes Gehrke — "Database Management Systems", 3rd Edition, McGraw-Hill',
      'C.J. Date — "An Introduction to Database Systems", 8th Edition, Addison-Wesley',
    ],
  },
  {
    id: 'sem4-os',
    code: 'CS402',
    name: 'Operating Systems',
    semester: 4,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Structures of operating systems, process management, CPU scheduling algorithms, inter-process communication, synchronization primitives, deadlocks, virtual memory architectures, and file system layouts.',
    objectives: [
      'Understand dual-mode kernel architecture and system call execution',
      'Evaluate preemptive and non-preemptive CPU scheduling algorithms',
      'Solve process synchronization challenges using semaphores, mutexes, and monitors',
      'Detect and prevent deadlocks with Banker\'s algorithm and resource allocation graphs',
      'Analyze paging, segmentation, page fault replacement algorithms, and disk scheduling',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'OS Overview & System Structures',
        hours: 7,
        marksWeightage: 14,
        topics: [
          'Role of OS, mainframe, multiprocessor, distributed, clustered, and real-time systems',
          'Dual-mode operation (user mode vs kernel mode), privileged instructions, trap handling',
          'System calls: Process control, file management, device management, information maintenance, communication',
          'OS structures: Monolithic, layered, microkernel, and modular architecture comparisons',
        ],
      },
      {
        unitNumber: 2,
        title: 'Processes, Threads & CPU Scheduling',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Process concept, Process Control Block (PCB), process state transitions, context switching mechanics',
          'Process scheduling queues: Job queue, ready queue, device queue, schedulers (long, medium, short-term)',
          'Threads: User threads vs kernel threads, multithreading models (many-to-one, one-to-one, many-to-many)',
          'CPU scheduling criteria: Turnaround time, waiting time, response time, CPU utilization',
          'Scheduling algorithms: FCFS, SJF, Shortest Remaining Time First (SRTF), Priority, Round Robin (RR), Multilevel feedback queues',
        ],
      },
      {
        unitNumber: 3,
        title: 'Process Synchronization & IPC',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Cooperating processes, race conditions, critical section problem requirements: Mutual exclusion, progress, bounded waiting',
          'Peterson solution for two processes, hardware atomic instructions (test_and_set, compare_and_swap)',
          'Mutex locks and Semaphores (counting vs binary), wait() and signal() operations',
          'Classical synchronization problems: Bounded-Buffer (Producer-Consumer), Readers-Writers, Dining Philosophers',
          'Monitors and conditional variables, Inter-Process Communication (IPC): Shared memory and message passing',
        ],
      },
      {
        unitNumber: 4,
        title: 'Deadlocks: Characterization & Resolution',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Deadlock concept, Coffman conditions: Mutual exclusion, hold and wait, no preemption, circular wait',
          'Resource Allocation Graph (RAG) with cycle detection rules',
          'Deadlock prevention methods targeting each Coffman condition',
          'Deadlock avoidance: Safe state definition, Banker algorithm for single and multi-instance resources',
          'Deadlock detection: Wait-for graph, reduction algorithms, and recovery strategies (process termination, resource preemption)',
        ],
      },
      {
        unitNumber: 5,
        title: 'Memory Management & Virtual Memory',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Logical vs physical address space, dynamic loading, dynamic linking, overlays',
          'Contiguous memory allocation: Fixed and variable partitioning, internal and external fragmentation, compaction',
          'Paging: Page table architecture, hardware translation with Translation Lookaside Buffer (TLB), effective access time',
          'Segmentation: Hardware architecture, segment table, protection and sharing advantages',
          'Virtual memory: Demand paging, page fault handling routine, page replacement algorithms: FIFO, Optimal (OPT), Least Recently Used (LRU)',
          'Thrashing: Working set model, page-fault frequency technique',
        ],
      },
      {
        unitNumber: 6,
        title: 'Storage Management & File Systems',
        hours: 7,
        marksWeightage: 10,
        topics: [
          'File concept, access methods (sequential, direct, indexed), directory structures (single-level, two-level, tree, acyclic graph)',
          'File system implementation: Virtual File System (VFS), directory implementation, allocation methods (contiguous, linked, indexed with inode)',
          'Free space management: Bit vector, linked list, grouping, counting',
          'Disk scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK',
        ],
      },
    ],
    textbooks: [
      'Abraham Silberschatz, Peter B. Galvin, Greg Gagne — "Operating System Concepts", 10th Edition, Wiley',
      'William Stallings — "Operating Systems: Internals and Design Principles", 9th Edition, Pearson',
    ],
    references: [
      'Andrew S. Tanenbaum, Herbert Bos — "Modern Operating Systems", 4th Edition, Pearson',
      'Dhananjay M. Dhamdhere — "Operating Systems: A Concept-based Approach", 3rd Edition, McGraw-Hill',
    ],
  },

  // ── SEMESTER 5 ─────────────────────────────────────────────────────────────
  {
    id: 'sem5-cn',
    code: 'CS501',
    name: 'Computer Networks',
    semester: 5,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Seven-layer OSI reference model and TCP/IP protocol suite, physical transmission media, framing, error detection/correction, sliding window protocols, subnetting, CIDR, distance vector and link-state routing, TCP/UDP sockets, DNS, and HTTP/HTTPS.',
    objectives: [
      'Differentiate OSI reference model and TCP/IP stack protocol interactions',
      'Calculate Hamming distance and CRC polynomial checksum codes',
      'Analyze sliding window flow control protocols (Stop-and-Wait, Go-Back-N, Selective Repeat)',
      'Perform IPv4 subnetting, VLSM calculations, and hierarchical CIDR routing',
      'Explain TCP three-way handshake, congestion control (Slow Start, Tahoe, Reno), and application layer DNS/HTTP',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Network Models & Physical Layer',
        hours: 7,
        marksWeightage: 14,
        topics: [
          'Data communication components, network topologies (bus, star, ring, mesh, hybrid), PAN, LAN, MAN, WAN',
          'Protocol layering: OSI 7-layer reference model functions vs TCP/IP 4-layer architecture',
          'Physical media: Guided (twisted pair, coaxial, optical fiber) vs unguided (radio, microwave, infrared)',
          'Transmission impairments: Attenuation, distortion, noise, Nyquist bit rate and Shannon capacity theorem',
        ],
      },
      {
        unitNumber: 2,
        title: 'Data Link Layer & Error Control',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Data Link Layer design issues: Services provided to network layer, framing techniques (byte counting, character/bit stuffing)',
          'Error control: Error detection vs correction, parity checks, checksum algorithms',
          'Cyclic Redundancy Check (CRC) polynomial division and verification mathematics',
          'Hamming code: Minimum distance concept, single-bit error correction parity bit placement',
          'Elementary protocols: Unrestricted simplex, Stop-and-Wait, Stop-and-Wait ARQ',
          'Sliding window protocols: Go-Back-N (GBN) vs Selective Repeat (SR) window size constraints and retransmissions',
        ],
      },
      {
        unitNumber: 3,
        title: 'Medium Access Control (MAC) Sublayer',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Channel allocation: Static vs dynamic channel allocation',
          'Multiple access protocols: Pure ALOHA, Slotted ALOHA throughput analysis',
          'Carrier Sense Multiple Access (CSMA): 1-persistent, non-persistent, p-persistent',
          'CSMA/CD protocol for Ethernet, collision detection window, binary exponential backoff algorithm',
          'CSMA/CA protocol for wireless networks, hidden and exposed terminal problems, RTS/CTS handshake',
          'IEEE 802.3 Ethernet standards, frame format, and IEEE 802.11 Wi-Fi fundamentals',
        ],
      },
      {
        unitNumber: 4,
        title: 'Network Layer: Addressing & Subnetting',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Network layer design: Virtual circuit vs datagram networks',
          'IPv4 addressing: Classful addressing (Classes A, B, C, D, E), network ID, host ID, broadcast addresses',
          'Subnetting: Subnet masks, Variable Length Subnet Masking (VLSM) problem solving',
          'Classless Inter-Domain Routing (CIDR): Slash notation, address aggregation, supernetting',
          'IPv4 packet header format, fragmentation and reassembly (ID, Flags, Fragment Offset, TTL)',
          'IPv6 addressing, 128-bit address representation, header format improvements, transition mechanisms (dual-stack, tunneling)',
        ],
      },
      {
        unitNumber: 5,
        title: 'Routing Protocols & Control Plane',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Routing algorithms: Static (shortest path, flooding) vs dynamic routing',
          'Distance Vector Routing: Bellman-Ford algorithm, Count-to-Infinity problem and solutions (split horizon, poison reverse)',
          'Link State Routing: Dijkstra algorithm, link state packets (LSP) generation and reliable flooding',
          'Hierarchical routing, Autonomous Systems (AS), intra-domain vs inter-domain routing',
          'Internet routing protocols: RIP (Routing Information Protocol), OSPF (Open Shortest Path First), BGP (Border Gateway Protocol)',
          'Control protocols: Address Resolution Protocol (ARP), Reverse ARP, ICMP error reporting, DHCP operation',
        ],
      },
      {
        unitNumber: 6,
        title: 'Transport & Application Layers',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Transport services: Port numbers, socket abstraction, multiplexing and demultiplexing',
          'User Datagram Protocol (UDP): Header structure, checksum computation, connectionless semantics',
          'Transmission Control Protocol (TCP): Segment structure, connection establishment (3-way handshake), termination (4-way)',
          'TCP reliable transmission, flow control with sliding window, silly window syndrome',
          'TCP congestion control: AIMD, Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery',
          'Application layer protocols: DNS hierarchy and query resolution, HTTP/1.1 vs HTTP/2 vs HTTP/3, HTTPS and TLS/SSL overview',
        ],
      },
    ],
    textbooks: [
      'Andrew S. Tanenbaum, David J. Wetherall — "Computer Networks", 5th Edition, Pearson',
      'James F. Kurose, Keith W. Ross — "Computer Networking: A Top-Down Approach", 7th Edition, Pearson',
    ],
    references: [
      'Behrouz A. Forouzan — "Data Communications and Networking", 5th Edition, McGraw-Hill',
      'W. Richard Stevens — "TCP/IP Illustrated, Volume 1: The Protocols", Addison-Wesley',
    ],
  },
  {
    id: 'sem5-daa',
    code: 'CS502',
    name: 'Design & Analysis of Algorithms',
    semester: 5,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Advanced algorithm analysis, divide and conquer, greedy heuristics, dynamic programming recurrence formulation, backtracking, branch-and-bound, P vs NP theory, NP-completeness proofs, and approximation algorithms.',
    objectives: [
      'Formulate dynamic programming matrix tables and state transition equations',
      'Solve optimization problems using greedy algorithms and prove matroid correctness',
      'Implement state-space tree traversal with backtracking and branch-and-bound pruning',
      'Prove NP-completeness of decision problems using polynomial-time reductions',
      'Design approximation heuristics for NP-hard optimization problems',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Algorithm Foundations & Divide and Conquer',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Order of growth, amortized analysis: Aggregate analysis, accounting method, potential method',
          'Divide and Conquer paradigm: MergeSort analysis, QuickSort randomized analysis and worst-case prevention',
          'Strassen matrix multiplication algorithm analysis and recurrence relation',
          'Selection in expected linear time and worst-case linear time (Median-of-Medians)',
        ],
      },
      {
        unitNumber: 2,
        title: 'Greedy Technique & Matroid Theory',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Greedy choice property, optimal substructure proof template',
          'Fractional knapsack problem, interval scheduling and activity selection problem',
          'Huffman coding algorithm for lossless text compression and prefix-free trees',
          'Theoretical foundations of greedy methods: Matroids, hereditary systems, greedy matroid algorithms',
        ],
      },
      {
        unitNumber: 3,
        title: 'Dynamic Programming (DP)',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Overlapping subproblems and optimal substructure, memoization vs bottom-up tabulation',
          '0/1 Knapsack problem recurrence formulation and DP table construction',
          'Longest Common Subsequence (LCS) and sequence alignment algorithms',
          'Matrix Chain Multiplication: Formulation, parenthesization optimization table',
          'All-Pairs Shortest Path: Floyd-Warshall algorithm DP equation and transitive closure (Warshall)',
          'Optimal Binary Search Trees (OBST) and Coin Change problems',
        ],
      },
      {
        unitNumber: 4,
        title: 'Backtracking & Pruning Strategies',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'State-space tree representation, depth-first generation, bounding functions',
          'N-Queens problem: 4-queens, 8-queens recursive formulation and diagonal collision detection',
          'Subset Sum problem and Hamiltonian Cycle backtracking',
          'Graph Coloring problem: m-coloring decision and chromatic number determination',
        ],
      },
      {
        unitNumber: 5,
        title: 'Branch & Bound Techniques',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Breadth-first and Least-Cost (LC) search, FIFO branch-and-bound, LIFO branch-and-bound',
          'Bounding functions: Lower bounds on cost and upper bounds on profit',
          'Traveling Salesperson Problem (TSP) using reduced cost matrices',
          '0/1 Knapsack problem solved via LC-Branch and Bound',
        ],
      },
      {
        unitNumber: 6,
        title: 'NP-Completeness & Approximation Algorithms',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Tractable vs intractable problems, complexity classes P, NP, NP-Hard, NP-Complete',
          'Non-deterministic algorithms, polynomial-time verification, polynomial-time reductions',
          'Cook-Levin Theorem: Satisfiability (SAT) is NP-Complete (conceptual overview)',
          'Standard NP-Complete reductions: 3-SAT to CLIQUE, CLIQUE to Vertex Cover, Vertex Cover to Set Cover',
          'Approximation algorithms: Ratio bound, 2-approximation for Vertex Cover, Metric-TSP approximation heuristic',
        ],
      },
    ],
    textbooks: [
      'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein — "Introduction to Algorithms", 3rd Edition, MIT Press',
      'Ellis Horowitz, Sartaj Sahni, Sanguthevar Rajasekaran — "Fundamentals of Computer Algorithms", 2nd Edition, Universities Press',
    ],
    references: [
      'Jon Kleinberg, Éva Tardos — "Algorithm Design", Pearson',
      'Michael R. Garey, David S. Johnson — "Computers and Intractability: A Guide to the Theory of NP-Completeness", W. H. Freeman',
    ],
  },

  // ── SEMESTER 6 ─────────────────────────────────────────────────────────────
  {
    id: 'sem6-ai',
    code: 'CS601',
    name: 'Artificial Intelligence & Machine Learning',
    semester: 6,
    branch: 'Computer Science & Engineering',
    credits: 4,
    theoryMarks: 80,
    internalMarks: 20,
    overview:
      'Intelligent agents, uninformed and heuristic state-space search, game playing (Minimax, Alpha-Beta pruning), probabilistic reasoning, Bayesian networks, supervised learning, and neural network foundations.',
    objectives: [
      'Formulate problem states, actions, transition models, and goal tests for AI agents',
      'Apply A* search and prove heuristic admissibility and consistency',
      'Implement adversarial game-playing algorithms with Alpha-Beta pruning',
      'Represent uncertainty with conditional probability tables and Bayesian networks',
      'Evaluate machine learning classifiers: Decision trees, SVMs, and perceptrons',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Intelligent Agents & Problem Formulation',
        hours: 7,
        marksWeightage: 14,
        topics: [
          'Definitions of AI, Turing Test, Rational Agent view, PEAS description of task environments',
          'Environment types: Fully observable vs partially observable, deterministic vs stochastic, static vs dynamic',
          'Agent architectures: Simple reflex, model-based, goal-based, utility-based, learning agents',
          'State-space formulation: Initial state, actions, transition model, goal test, path cost',
        ],
      },
      {
        unitNumber: 2,
        title: 'Heuristic Search & Adversarial Games',
        hours: 9,
        marksWeightage: 14,
        topics: [
          'Uninformed search strategies: Breadth-First Search, Uniform Cost Search, Depth-First Search, Iterative Deepening',
          'Heuristic search: Greedy Best-First Search, A* search, admissible and consistent heuristics proof',
          'Local search: Hill climbing, local maxima, plateaus, Simulated Annealing, Genetic Algorithms basics',
          'Adversarial search: Two-player zero-sum games, Minimax decision rule, Alpha-Beta pruning algorithm',
        ],
      },
      {
        unitNumber: 3,
        title: 'Knowledge Representation & Logic',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Propositional logic: Syntax, semantics, truth tables, inference rules, resolution refutation',
          'First-Order Predicate Logic (FOL): Quantifiers, universal and existential instantiation, unification algorithm',
          'Forward chaining and backward chaining in Horn clause knowledge bases',
          'Ontological engineering, semantic networks, frames, and conceptual dependency graphs',
        ],
      },
      {
        unitNumber: 4,
        title: 'Probabilistic Reasoning & Bayesian Networks',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Handling uncertain knowledge, prior and conditional probabilities, axioms of probability',
          'Bayes rule and applications in medical diagnosis and spam filtering',
          'Bayesian Belief Networks: Directed Acyclic Graph topology, Conditional Probability Tables (CPT)',
          'Inference in Bayesian networks: Exact inference by enumeration, variable elimination, Markov blankets',
        ],
      },
      {
        unitNumber: 5,
        title: 'Supervised Learning Algorithms',
        hours: 8,
        marksWeightage: 14,
        topics: [
          'Machine learning paradigm: Training, validation, testing, bias-variance tradeoff',
          'Linear regression: Ordinary least squares, gradient descent optimization',
          'Logistic regression: Sigmoid function, binary classification, log-loss cost function',
          'Decision Trees: Information Gain, Entropy, Gini Index, ID3 and CART algorithms',
          'Support Vector Machines (SVM): Maximum margin hyperplanes, support vectors, kernel trick overview',
        ],
      },
      {
        unitNumber: 6,
        title: 'Unsupervised Learning & Deep Learning Foundations',
        hours: 8,
        marksWeightage: 10,
        topics: [
          'Clustering: K-Means algorithm, inertia, elbow method, Hierarchical clustering (agglomerative)',
          'Dimensionality reduction: Principal Component Analysis (PCA) eigenvalue decomposition concept',
          'Neural Networks: McCulloch-Pitts neuron, Single-layer Perceptron, Multi-Layer Perceptron (MLP)',
          'Backpropagation algorithm: Forward pass, error gradient calculation, weight updates with learning rate',
          'Deep learning landscape overview: CNNs for vision, RNNs/Transformers for sequences',
        ],
      },
    ],
    textbooks: [
      'Stuart Russell, Peter Norvig — "Artificial Intelligence: A Modern Approach", 4th Edition, Pearson',
      'Tom M. Mitchell — "Machine Learning", McGraw-Hill',
    ],
    references: [
      'Ethem Alpaydin — "Introduction to Machine Learning", 4th Edition, MIT Press',
      'Ian Goodfellow, Yoshua Bengio, Aaron Courville — "Deep Learning", MIT Press',
    ],
  },
];

export const SyllabusPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>('sem3-dsa');

  // Semester tabs list
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Filter subjects based on active selections
  const filteredSubjects = SYLLABUS_DATA.filter((subject) => {
    const matchesSem = selectedSemester === 0 || subject.semester === selectedSemester;
    const matchesBranch =
      selectedBranch === 'All Branches' || subject.branch.includes(selectedBranch);
    const matchesSearch =
      searchQuery.trim() === '' ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.units.some(
        (u) =>
          u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    return matchesSem && matchesBranch && matchesSearch;
  });

  const toggleSubject = (id: string) => {
    setExpandedSubjectId((prev) => (prev === id ? null : id));
  };

  const handleAskAIAboutSubject = (subjectName: string, unitTitle: string) => {
    toast.info(`Preparing AI study session for "${unitTitle}"...`);
    navigate('/student/assistant');
  };

  const handlePrintSyllabus = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed] dark:bg-slate-950 transition-colors duration-200">
      <TopBar title="Curriculum Syllabus & Course Outlines" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold font-mono mb-2">
              <GraduationCap size={14} />
              <span>Sant Gadge Baba Amravati University (SGBAU) Curriculum</span>
            </div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink dark:text-slate-100 flex items-center gap-2">
              <span>Academic Syllabus Vault</span> 📚
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-sans mt-0.5 max-w-2xl">
              Comprehensive semester syllabus breakdown, unit topics, credit hours, mark schemes, and prescribed textbooks. Fully aligned with historical past paper archives.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrintSyllabus}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs transition-colors"
            >
              <Download size={14} />
              <span>Print / Export</span>
            </button>
            <button
              onClick={() => navigate('/student/assistant')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Sparkles size={14} />
              <span>Ask AI on Syllabus</span>
            </button>
          </div>
        </div>

        {/* Semester Selection Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xs flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedSemester(0)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSemester === 0
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            All Semesters
          </button>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSemester === sem
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, unit name, algorithm, or subject code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
            >
              <option value="All Branches">All Branches / Disciplines</option>
              <option value="Computer Science">Computer Science & Engineering (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Artificial Intelligence">AI & Data Science (AI&DS)</option>
            </select>
          </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-6">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => {
              const isExpanded = expandedSubjectId === subject.id;

              return (
                <div
                  key={subject.id}
                  className="bg-[#fdfbf7] dark:bg-slate-900/90 rounded-3xl border border-stone-300 dark:border-slate-800 shadow-notebook overflow-hidden transition-all duration-200"
                >
                  {/* Subject Header Card */}
                  <div
                    onClick={() => toggleSubject(subject.id)}
                    className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950/80 text-brand-900 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          {subject.code}
                        </span>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Semester {subject.semester}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                          {subject.branch}
                        </span>
                      </div>

                      <h2 className="font-handwriting font-bold text-2xl text-ink dark:text-slate-100">
                        {subject.name}
                      </h2>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-sans max-w-3xl leading-relaxed">
                        {subject.overview}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {subject.credits} Credits • {subject.theoryMarks + subject.internalMarks} Marks
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          {subject.theoryMarks} Theory + {subject.internalMarks} Internal
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Syllabus Content */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Course Objectives */}
                      <div>
                        <h3 className="font-handwriting font-bold text-lg text-ink dark:text-slate-100 mb-2 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Course Learning Objectives (COs)</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
                          {subject.objectives.map((obj, oIdx) => (
                            <div
                              key={oIdx}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/80 flex items-start gap-2"
                            >
                              <span className="font-mono font-bold text-brand-600 dark:text-brand-400 shrink-0">
                                CO{oIdx + 1}:
                              </span>
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Units Breakdown */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-handwriting font-bold text-xl text-ink dark:text-slate-100 flex items-center gap-2">
                            <Layers size={18} className="text-brand-600 dark:text-brand-400" />
                            <span>Unit-Wise Syllabus Breakdown (6 Units)</span>
                          </h3>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            Total: 48 Lecture Hours
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {subject.units.map((unit) => (
                            <div
                              key={unit.unitNumber}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 shadow-2xs space-y-3 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-2 mb-2.5">
                                  <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/70 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
                                    UNIT {unit.unitNumber}
                                  </span>
                                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} /> {unit.hours} Hours
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-amber-700 dark:text-amber-400">
                                      ~{unit.marksWeightage} Marks
                                    </span>
                                  </div>
                                </div>

                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-sans mb-2">
                                  {unit.title}
                                </h4>

                                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-sans list-disc pl-4 leading-relaxed">
                                  {unit.topics.map((topic, tIdx) => (
                                    <li key={tIdx}>{topic}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2 border-t border-stone-100 dark:border-slate-700/60 flex items-center justify-between">
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                  SGBAU Standard Unit
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAskAIAboutSubject(subject.name, unit.title)}
                                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1 transition-colors"
                                >
                                  <Sparkles size={12} />
                                  <span>Ask AI on this Unit →</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Textbooks & References */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 text-xs font-sans space-y-2">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <BookMarked size={16} className="text-amber-700 dark:text-amber-400" />
                            <span>Prescribed Textbooks</span>
                          </div>
                          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4">
                            {subject.textbooks.map((tb, idx) => (
                              <li key={idx} className="leading-snug">
                                {tb}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-xs font-sans space-y-2">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <BookOpen size={16} className="text-brand-600 dark:text-brand-400" />
                            <span>Reference Books</span>
                          </div>
                          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4">
                            {subject.references.map((rb, idx) => (
                              <li key={idx} className="leading-snug">
                                {rb}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-handwriting font-bold text-2xl text-ink dark:text-slate-100">
                No syllabus topics found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto">
                Try selecting "All Semesters", or search with another keyword like "Algorithms", "Tree", "Network", or "SQL".
              </p>
              <button
                onClick={() => {
                  setSelectedSemester(0);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold font-sans"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
