const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementOffer = require('../models/PlacementOffer');
const InterviewExperience = require('../models/InterviewExperience');
const Question = require('../models/Question');
const StudyResource = require('../models/StudyResource');
const Bookmark = require('../models/Bookmark');
const PreparationProgress = require('../models/PreparationProgress');
const StudyTask = require('../models/StudyTask');
const HelpfulVote = require('../models/HelpfulVote');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections for a clean, deterministic demonstration database
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      PlacementDrive.deleteMany({}),
      PlacementOffer.deleteMany({}),
      InterviewExperience.deleteMany({}),
      Question.deleteMany({}),
      StudyResource.deleteMany({}),
      Bookmark.deleteMany({}),
      PreparationProgress.deleteMany({}),
      StudyTask.deleteMany({}),
      HelpfulVote.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('AdminPass@2026', salt);
    const studentPasswordHash = await bcrypt.hash('StudentPass@2026', salt);

    // 2. Create Users
    const admin = await User.create({
      name: 'Placement Officer Admin',
      email: 'admin@college.edu',
      registerNumber: 'ADMIN001',
      department: 'Placement & Training Directorate',
      graduationYear: 2020,
      passwordHash: adminPasswordHash,
      role: 'admin',
      accountStatus: 'active',
    });

    const student1 = await User.create({
      name: 'Arun Kumar',
      email: 'student1@college.edu',
      registerNumber: '710021104001',
      department: 'Computer Science & Engineering',
      graduationYear: 2025,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: true,
    });

    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'student2@college.edu',
      registerNumber: '710021104045',
      department: 'Information Technology',
      graduationYear: 2025,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: true,
    });

    const student3 = await User.create({
      name: 'Karthik Raja',
      email: 'student3@college.edu',
      registerNumber: '710021104082',
      department: 'Electronics & Communication Engineering',
      graduationYear: 2025,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: true,
    });

    const student4 = await User.create({
      name: 'Divya Ramesh',
      email: 'student4@college.edu',
      registerNumber: '710021104110',
      department: 'Computer Science & Engineering',
      graduationYear: 2026,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: false,
    });

    const student5 = await User.create({
      name: 'Sneha Patel',
      email: 'student5@college.edu',
      registerNumber: '710021104142',
      department: 'Artificial Intelligence & Data Science',
      graduationYear: 2025,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: true,
    });

    const student6 = await User.create({
      name: 'Vikram Sundaram',
      email: 'student6@college.edu',
      registerNumber: '710021104199',
      department: 'Computer Science & Engineering',
      graduationYear: 2025,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      isPlacementVerified: true,
    });

    console.log('[Seed] Created Admin and 6 Demo Students (including Placed seniors).');

    // 3. Create Companies
    const companies = await Company.create([
      {
        name: 'Google',
        slug: 'google',
        description:
          'Google is a global technology leader focusing on search, cloud computing, artificial intelligence, and cutting-edge software systems.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        industry: 'Software / IT',
        website: 'https://careers.google.com',
        jobRoles: ['Software Engineer', 'Application Engineer', 'Cloud Technical Resident'],
        skills: ['Data Structures', 'Algorithms', 'System Design', 'C++', 'Java', 'Python', 'Distributed Systems'],
        status: 'active',
      },
      {
        name: 'Microsoft',
        slug: 'microsoft',
        description:
          'Microsoft Corporation enables digital transformation for the era of an intelligent cloud and an intelligent edge.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
        industry: 'Software / IT',
        website: 'https://careers.microsoft.com',
        jobRoles: ['Software Development Engineer', 'Support Engineer', 'Program Manager'],
        skills: ['Algorithms', 'Data Structures', 'C#', 'C++', 'Azure', 'OOP', 'SQL'],
        status: 'active',
      },
      {
        name: 'Amazon',
        slug: 'amazon',
        description:
          'Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        industry: 'E-commerce & Cloud',
        website: 'https://amazon.jobs',
        jobRoles: ['Software Development Engineer (SDE 1)', 'Data Analyst', 'Quality Assurance Engineer'],
        skills: ['DSA', 'Java', 'Python', 'AWS', 'System Design', 'Leadership Principles'],
        status: 'active',
      },
      {
        name: 'Tata Consultancy Services',
        slug: 'tcs',
        description:
          'TCS is a purpose-led organization that provides IT services, consulting, and business solutions worldwide.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        industry: 'IT Services & Consulting',
        website: 'https://www.tcs.com/careers',
        jobRoles: ['TCS Digital Cadre', 'TCS Ninja Cadre', 'TCS Prime Cadre'],
        skills: ['Aptitude', 'Java', 'Python', 'DBMS', 'Web Technologies', 'Problem Solving'],
        status: 'active',
      },
      {
        name: 'Infosys',
        slug: 'infosys',
        description:
          'Infosys is a global leader in next-generation digital services and consulting with operations in over 50 countries.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        industry: 'IT Services & Consulting',
        website: 'https://www.infosys.com/careers',
        jobRoles: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)', 'Systems Engineer'],
        skills: ['Aptitude', 'Data Structures', 'Java', 'Python', 'SQL', 'OOP Concepts'],
        status: 'active',
      },
      {
        name: 'Zoho Corporation',
        slug: 'zoho',
        description:
          'Zoho is a bootstrapped cloud software powerhouse providing business apps, CRM, and enterprise suites.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Zoho_Corporation_logo.png',
        industry: 'Software / IT',
        website: 'https://www.zoho.com/careers',
        jobRoles: ['Software Developer', 'Quality Analyst', 'Technical Support Engineer'],
        skills: ['C', 'C++', 'Java', 'Problem Solving', 'Data Structures', 'Application Development'],
        status: 'active',
      },
      {
        name: 'Tiger Analytics',
        slug: 'tiger-analytics',
        description:
          'Tiger Analytics is a global AI and analytics consulting firm that builds machine learning and data science solutions for Fortune 500 enterprises across retail, finance, healthcare, and manufacturing.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tiger_Analytics_Logo.png',
        industry: 'AI & Data Analytics',
        website: 'https://www.tigeranalytics.com/careers',
        jobRoles: ['Associate Data Scientist', 'Data Analyst', 'Data Engineer', 'AI Consultant'],
        skills: ['Python', 'SQL (Window Functions)', 'Machine Learning', 'Pandas & NumPy', 'Statistics & Probability', 'Data Structures', 'Data Storytelling'],
        status: 'active',
      },
      {
        name: 'Hexaware Technologies',
        slug: 'hexaware',
        description:
          'Hexaware Technologies is a fast-growing global provider of IT, BPO, and consulting services specializing in cloud modernization, automation-first strategy, and next-generation enterprise application services.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Hexaware_Logo.svg',
        industry: 'IT Services & Consulting',
        website: 'https://jobs.hexaware.com',
        jobRoles: ['Software Engineer (PGET)', 'Graduate Engineer Trainee (GET)', 'Cloud & DevOps Associate', 'Full Stack Developer'],
        skills: ['Java', 'Python', 'Aptitude & Logical Reasoning', 'DBMS & SQL', 'Data Structures', 'OOP Concepts', 'Communication & Versant', 'HTML/CSS/JavaScript'],
        status: 'active',
      },
      {
        name: 'Cognizant',
        slug: 'cognizant',
        description:
          'Cognizant (CTS) is an American multinational IT services, digital engineering, and technology consulting giant empowering global Fortune 500 enterprises with cloud, modern software, and intelligent automation.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Cognizant_logo_2022.svg',
        industry: 'IT Services & Consulting',
        website: 'https://careers.cognizant.com',
        jobRoles: ['GenC Next Software Engineer', 'GenC Elevate Engineer', 'GenC Programmer Analyst Trainee (PAT)', 'Cloud Data Specialist'],
        skills: ['Java', 'Python', 'Data Structures & Algorithms', 'DBMS & SQL', 'OOP Concepts', 'REST APIs', 'Web Technologies', 'Cloud Fundamentals'],
        status: 'active',
      },
    ]);

    const [google, msft, amazon, tcs, infosys, zoho, tiger, hexaware, cognizant] = companies;
    console.log('[Seed] Created 9 Top Placement Companies (including Tiger Analytics, Hexaware, Cognizant).');

    // 4. Create Placement Drives
    const drives = await PlacementDrive.create([
      {
        companyId: google._id,
        title: 'Google Campus Hiring 2025',
        driveYear: 2025,
        jobRoles: ['Software Engineer', 'Application Engineer'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: msft._id,
        title: 'Microsoft College Engage & Placements 2025',
        driveYear: 2025,
        jobRoles: ['Software Development Engineer'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: amazon._id,
        title: 'Amazon WOW & On-Campus SDE Drive 2025',
        driveYear: 2025,
        jobRoles: ['Software Development Engineer (SDE 1)'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: tcs._id,
        title: 'TCS National Qualifier Test (NQT) Drive 2025',
        driveYear: 2025,
        jobRoles: ['TCS Digital Cadre', 'TCS Prime Cadre'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: infosys._id,
        title: 'Infosys HackWithInfy & Campus Connect 2025',
        driveYear: 2025,
        jobRoles: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        graduationYears: [2025, 2026],
        status: 'ongoing',
        createdBy: admin._id,
      },
      {
        companyId: zoho._id,
        title: 'Zoho Campus On-Site Drive 2026',
        driveYear: 2026,
        jobRoles: ['Software Developer'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
        graduationYears: [2026],
        status: 'upcoming',
        createdBy: admin._id,
      },
      {
        companyId: tiger._id,
        title: 'Tiger Analytics Campus AI & Data Science Recruitment Drive 2025',
        driveYear: 2025,
        jobRoles: ['Associate Data Scientist', 'Data Analyst'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Electronics & Communication Engineering'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: hexaware._id,
        title: 'Hexaware Technologies Premier Campus Drive 2025',
        driveYear: 2025,
        jobRoles: ['Software Engineer (PGET)', 'Graduate Engineer Trainee (GET)'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
      {
        companyId: cognizant._id,
        title: 'Cognizant GenC & GenC Next Campus Drive 2025',
        driveYear: 2025,
        jobRoles: ['GenC Next Software Engineer', 'GenC Elevate Engineer', 'GenC Programmer Analyst Trainee (PAT)'],
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      },
    ]);

    const [googleDrive, msftDrive, amazonDrive, tcsDrive, infosysDrive, zohoDrive, tigerDrive, hexawareDrive, cognizantDrive] = drives;
    console.log('[Seed] Created Placement Drives (including Tiger Analytics, Hexaware, Cognizant).');

    // 5. Create Placement Offers (CRITICAL FOR ELIGIBILITY RULE)
    // Student 1: Selected for Google and TCS
    // Student 2: Selected for Microsoft
    // Student 3: Selected for Amazon
    // Student 4: Rejected for Google, Pending for Infosys (Not selected!)
    await PlacementOffer.create([
      {
        studentId: student1._id,
        companyId: google._id,
        placementDriveId: googleDrive._id,
        status: 'selected',
        jobRole: 'Software Engineer',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-08-20'),
        notes: 'Offered Full Time Role via Google Campus Hiring. Document verified.',
      },
      {
        studentId: student1._id,
        companyId: tcs._id,
        placementDriveId: tcsDrive._id,
        status: 'selected',
        jobRole: 'TCS Digital Cadre',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-07-15'),
        notes: 'Offered Digital Cadre based on NQT top percentile.',
      },
      {
        studentId: student2._id,
        companyId: msft._id,
        placementDriveId: msftDrive._id,
        status: 'selected',
        jobRole: 'Software Development Engineer',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-02'),
        notes: 'Final offer letter verified by placement cell.',
      },
      {
        studentId: student3._id,
        companyId: amazon._id,
        placementDriveId: amazonDrive._id,
        status: 'selected',
        jobRole: 'Software Development Engineer (SDE 1)',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-18'),
        notes: 'Selected after 3 interview rounds.',
      },
      {
        studentId: student4._id,
        companyId: google._id,
        placementDriveId: googleDrive._id,
        status: 'rejected',
        jobRole: 'Software Engineer',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-08-22'),
        notes: 'Did not clear round 2 technical assessment.',
      },
      {
        studentId: student4._id,
        companyId: infosys._id,
        placementDriveId: infosysDrive._id,
        status: 'pending',
        jobRole: 'Digital Specialist Engineer (DSE)',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-10-01'),
        notes: 'Assessment completed; awaiting interview results from Infosys HR.',
      },
      {
        studentId: student5._id,
        companyId: tiger._id,
        placementDriveId: tigerDrive._id,
        status: 'selected',
        jobRole: 'Associate Data Scientist',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-10'),
        notes: 'Offered Full Time Associate Data Scientist role. Letter verified.',
      },
      {
        studentId: student3._id,
        companyId: hexaware._id,
        placementDriveId: hexawareDrive._id,
        status: 'selected',
        jobRole: 'Software Engineer (PGET)',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-08-25'),
        notes: 'Premier Graduate Engineer Trainee (PGET) offer verified.',
      },
      {
        studentId: student6._id,
        companyId: cognizant._id,
        placementDriveId: cognizantDrive._id,
        status: 'selected',
        jobRole: 'GenC Next Software Engineer',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-22'),
        notes: 'GenC Next Premium Offer verified by placement office.',
      },
    ]);
    console.log('[Seed] Created Placement Offers (Selected & Non-Selected).');

    // 6. Create Interview Experiences
    // Experience 1: Approved Google Experience by Student 1
    const exp1 = await InterviewExperience.create({
      studentId: student1._id,
      companyId: google._id,
      placementDriveId: googleDrive._id,
      jobRole: 'Software Engineer',
      interviewDate: new Date('2025-08-15'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Hard',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Online Coding Assessment',
          roundType: 'Online Assessment',
          description:
            'Platform was Google internal assessment portal. Two challenging algorithmic questions with 90 minutes duration. First was based on Graph DFS and second was on Dynamic Programming on Trees.',
          questionsAsked: [
            'Shortest path in a weighted DAG with negative edge constraints',
            'Maximum subtree sum with no adjacent node selections',
          ],
          topicsCovered: ['Graphs', 'Dynamic Programming', 'DFS/BFS'],
        },
        {
          roundNumber: 2,
          roundName: 'Technical Round 1 (Data Structures & Coding)',
          roundType: 'Technical Round',
          description:
            '45-minute Google Meet session with a Senior SWE from Mountain View. Interviewer focused heavily on clean modular code, edge case testing, and big-O analysis.',
          questionsAsked: [
            'Design a LRU cache with expiration timestamps for entries (TTL)',
            'Follow up: How to make it thread-safe for high concurrency?',
          ],
          topicsCovered: ['Hash Maps', 'Doubly Linked Lists', 'Concurrency', 'Time Complexity'],
        },
        {
          roundNumber: 3,
          roundName: 'Technical Round 2 (Algorithms & Problem Solving)',
          roundType: 'Technical Round',
          description:
            'Discussion started with an open-ended streaming data problem. Required implementing Median in a Stream of Integers using heaps.',
          questionsAsked: [
            'Find running median of numbers streamed continuously',
            'Given an array of strings, group anagrams in optimal time',
          ],
          topicsCovered: ['Heaps', 'Priority Queue', 'Hashing', 'Sorting'],
        },
        {
          roundNumber: 4,
          roundName: 'Googleyness & Leadership Fit',
          roundType: 'HR',
          description:
            'Behavioral round assessing teamwork, handling ambiguity, resolving conflicts within college projects, and ethical considerations in AI.',
          questionsAsked: [
            'Tell me about a time you strongly disagreed with a team lead and how you handled it',
            'How do you handle tasks when requirements are ambiguous or changing midway?',
          ],
          topicsCovered: ['Googleyness', 'Leadership', 'Conflict Resolution', 'Ethics'],
        },
      ],
      preparationStrategy:
        'Solved ~350 LeetCode problems (Medium & Hard). Focused strongly on Blind 75 and NeetCode 150. Practiced mock coding on Google Docs without syntax highlighting or auto-complete.',
      resourcesRecommended:
        'LeetCode, Striver A2Z DSA Sheet, NeetCode YouTube, Designing Data-Intensive Applications.',
      advice:
        'Always communicate your thought process out loud before writing a single line of code. Write down test cases before saying you are done.',
      status: 'Approved',
      moderationFeedback: 'High quality, well-detailed and authentic experience report verified.',
      moderatedBy: admin._id,
      moderatedAt: new Date('2025-08-25'),
      helpfulCount: 14,
    });

    // Experience 2: Approved Microsoft Experience by Student 2
    const exp2 = await InterviewExperience.create({
      studentId: student2._id,
      companyId: msft._id,
      placementDriveId: msftDrive._id,
      jobRole: 'Software Development Engineer',
      interviewDate: new Date('2025-08-28'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Medium',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Online Assessment (Codility)',
          roundType: 'Online Assessment',
          description:
            '3 coding problems in 75 minutes. Tests speed and handling of large numerical test cases without integer overflow.',
          questionsAsked: [
            'Minimum insertions to form a palindrome',
            'Count valid pairs in an array satisfying modulo constraints',
            'Find celebrity problem in matrix',
          ],
          topicsCovered: ['Strings', 'Math', 'Arrays', 'Two Pointers'],
        },
        {
          roundNumber: 2,
          roundName: 'Technical Round 1 (DSA & Core CS)',
          roundType: 'Technical Round',
          description:
            'Interviewer asked about trees and binary search trees, followed by OS concepts such as virtual memory and paging.',
          questionsAsked: [
            'Lowest Common Ancestor in a Binary Tree (not BST)',
            'Explain process vs thread, virtual memory, and thrashing',
          ],
          topicsCovered: ['Binary Trees', 'Recursion', 'Operating Systems', 'Memory Management'],
        },
        {
          roundNumber: 3,
          roundName: 'Technical Round 2 + System Design Basics',
          roundType: 'Technical Round',
          description:
            'Discussed my final year project architecture, followed by a problem on designing a rate limiter for an API endpoint.',
          questionsAsked: [
            'Design a distributed rate limiter (Token Bucket / Leaky Bucket)',
            'Detect and remove loop in a Linked List',
          ],
          topicsCovered: ['System Design', 'Rate Limiting', 'Linked Lists', 'REST APIs'],
        },
        {
          roundNumber: 4,
          roundName: 'AA (As Appropriate) Director Round',
          roundType: 'Managerial',
          description:
            'High level conversation with Principal Engineering Director about growth mindset, Microsoft values, and why Azure.',
          questionsAsked: [
            'What is a technology you recently learned and what surprised you about it?',
            'Where do you see yourself contributing in cloud systems?',
          ],
          topicsCovered: ['Growth Mindset', 'Cloud Technologies', 'Career Goals'],
        },
      ],
      preparationStrategy:
        'Revised DSA topics systematically. Deep dive into OS (Galvin) and DBMS (Navathe). Mock interviews with college peers were extremely beneficial.',
      resourcesRecommended:
        'GeeksforGeeks Microsoft Interview Archive, Gate Smashers OS Playlist, LeetCode Top Interview Questions.',
      advice:
        'Microsoft values a Growth Mindset above all else. If you make a mistake, acknowledge it, analyze why it happened, and correct it gracefully.',
      status: 'Approved',
      moderationFeedback: 'Approved by administrator.',
      moderatedBy: admin._id,
      moderatedAt: new Date('2025-09-05'),
      helpfulCount: 9,
    });

    // Experience 3: Pending Review Amazon Experience by Student 3 (For testing moderation workflow!)
    const exp3 = await InterviewExperience.create({
      studentId: student3._id,
      companyId: amazon._id,
      placementDriveId: amazonDrive._id,
      jobRole: 'Software Development Engineer (SDE 1)',
      interviewDate: new Date('2025-09-12'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Hard',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Online Assessment (Hackerrank + Workstyles)',
          roundType: 'Online Assessment',
          description:
            '2 coding questions in 70 minutes + 20 minutes Amazon Work Style simulation test.',
          questionsAsked: [
            'Optimal utilization of aircraft routes (Two pointers + binary search)',
            'Number of islands in grid (BFS/DFS)',
          ],
          topicsCovered: ['Arrays', 'Matrix DFS', 'Amazon Leadership Principles'],
        },
        {
          roundNumber: 2,
          roundName: 'Technical Round 1 (Problem Solving & LP)',
          roundType: 'Technical Round',
          description:
            'Started with 20 minutes of Leadership Principles (Customer Obsession), followed by Word Ladder II.',
          questionsAsked: [
            'Word Ladder (Shortest transformation sequence from begin to end word)',
            'Tell me about a time you delivered results under tight deadlines without compromising quality',
          ],
          topicsCovered: ['BFS', 'Graphs', 'Customer Obsession', 'Deliver Results'],
        },
      ],
      preparationStrategy:
        'Practiced Amazon tagged questions on LeetCode. Prepared 2 stories for each of the 16 Amazon Leadership Principles.',
      resourcesRecommended: 'Dan Croitor YouTube channel for Amazon LP questions, LeetCode Amazon Card.',
      advice: 'Never ignore Leadership Principles! They carry equal weight to coding.',
      status: 'Pending Review', // Kept in Pending Review so Admin can review and approve!
      moderationFeedback: '',
      helpfulCount: 0,
    });

    // Experience 4: Approved Tiger Analytics Experience by Student 5 (Sneha Patel)
    const exp4 = await InterviewExperience.create({
      studentId: student5._id,
      companyId: tiger._id,
      placementDriveId: tigerDrive._id,
      jobRole: 'Associate Data Scientist',
      interviewDate: new Date('2025-09-05'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Medium',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Online Assessment (Aptitude, SQL, Probability & Python)',
          roundType: 'Online Assessment',
          description:
            '90 minutes online assessment hosted on HackerEarth. Contained 35 Quantitative Aptitude and Probability questions with negative marking, 2 complex SQL query writing problems, and 1 algorithmic Python problem.',
          questionsAsked: [
            'SQL: Write a query using window functions (DENSE_RANK) to find the 2nd highest transaction amount for each customer in the last 30 days.',
            'SQL: Find all customer IDs who placed orders on consecutive days using LEAD/LAG window functions.',
            'Python: Given an array of integers representing stock prices, find the maximum profit possible from at most two transactions.',
            'Probability: A bag contains 5 red and 7 blue balls. Two balls are drawn without replacement. What is the probability of getting at least one red ball?',
            'Statistics: Explain Type I vs Type II errors with a real-life credit card fraud detection example.',
          ],
          topicsCovered: [
            'Probability',
            'Descriptive Statistics',
            'SQL Window Functions',
            'Self Joins',
            'Dynamic Programming',
            'Python',
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Technical Round 1 (Data Structures, Pandas & Core Machine Learning)',
          roundType: 'Technical Round',
          description:
            '60 minutes Google Meet session with a Senior Lead Data Scientist. Deep dive into machine learning fundamentals, feature engineering pipelines, tree splitting mathematics (Gini vs Entropy), and live Pandas code execution.',
          questionsAsked: [
            'Explain the mathematical difference between Bagging (Random Forest) and Boosting (XGBoost). How do they affect bias vs variance?',
            'Live Coding: Given a messy DataFrame with missing values, categorical columns, and outliers, write clean Pandas code to impute missing values by group median, one-hot encode categories, and filter outliers using IQR.',
            'Why would you use ROC-AUC or PR-AUC instead of standard Accuracy on an imbalanced fraud dataset (99% negative, 1% positive)?',
            'How does K-Fold Cross-Validation protect against data leakage, and why does Time-Series cross-validation require expanding/rolling windows instead?',
          ],
          topicsCovered: [
            'Machine Learning',
            'Pandas DataFrames',
            'Feature Engineering',
            'ROC-AUC',
            'XGBoost',
            'Data Cleaning',
          ],
        },
        {
          roundNumber: 3,
          roundName: 'Technical Round 2 (Live Case Study & Problem Solving)',
          roundType: 'Technical Round',
          description:
            '45 minutes business problem solving. The interviewer presented an e-commerce subscription service experiencing a spike in user churn. I had to formulate the complete lifecycle: problem formulation, data schema requirements, feature hypothesis, model selection, evaluation metric, and business retention actions.',
          questionsAsked: [
            'Business Case Study: How would you design an end-to-end churn prediction model for an online streaming platform? What 5 features would you engineer from raw user clickstream and billing logs?',
            'How would you explain feature importance and SHAP values to non-technical business executives who do not understand ML mathematics?',
            'SQL Live Query: Compute the 7-day moving average of daily active users (DAU) across all regions.',
          ],
          topicsCovered: [
            'Business Problem Solving',
            'Customer Churn',
            'Feature Engineering',
            'Moving Averages in SQL',
            'Stakeholder Storytelling',
          ],
        },
        {
          roundNumber: 4,
          roundName: 'Techno-Managerial & Fitment Round',
          roundType: 'Managerial',
          description:
            '35 minutes conversation with the Associate Director of Analytics. Evaluated analytical consulting mindset, ability to work with incomplete client datasets, conflict resolution, and enthusiasm for Generative AI applications in enterprise business.',
          questionsAsked: [
            'Tell me about your proudest data science project. What was the biggest obstacle you hit, and what would you do differently today?',
            'In enterprise analytics consulting, client requirements frequently shift midway. How do you handle ambiguity and shifting deadlines?',
            'Where do you see Generative AI and LLMs augmenting classical predictive modeling in business intelligence over the next 3 years?',
          ],
          topicsCovered: [
            'Consulting Mindset',
            'Ambiguity Handling',
            'Project Deep Dive',
            'Generative AI Trends',
            'Cultural Fit',
          ],
        },
      ],
      preparationStrategy:
        'Focused systematically on 3 pillars: (1) Mastered advanced SQL (Window functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG, CTEs, and conditional aggregations) on StrataScratch and LeetCode. (2) Deepened ML conceptual clarity from StatQuest with Josh Starmer and Krish Naik YouTube. (3) Practiced explaining technical tradeoffs in plain business English without jargon.',
      resourcesRecommended:
        'StrataScratch SQL questions, StatQuest with Josh Starmer, Hands-On Machine Learning with Scikit-Learn and TensorFlow (Aurelien Geron), LeetCode SQL 50.',
      advice:
        'Direct advice for yet-to-be-placed students aiming for Tiger Analytics and top data firms:\n1. Never neglect SQL! At Tiger Analytics, SQL is just as important as Python or ML algorithms. If you cannot write window functions on the fly, you will struggle to clear Round 1.\n2. Do NOT treat machine learning models as black boxes. Interviewers will drill into the math: "Why did you pick Random Forest over Logistic Regression?", "What loss function does it optimize?", and "How does the tree split nodes?". Be ready with the underlying math.\n3. Build ONE solid end-to-end project where you gathered messy data, cleaned it, trained models, and extracted actionable business insights, rather than 5 basic Titanic or Iris dataset copies.\n4. During the business case study round, never jump to the model immediately! Ask clarifying questions first: "Who is the user?", "What is the business goal?", and "What data is accessible?". Consultants are evaluated on asking the right questions before proposing solutions.',
      status: 'Approved',
      moderationFeedback:
        'Officially verified Tiger Analytics selection. Exceptional round-by-round breakdown and practical advice for analytics aspirants.',
      moderatedBy: admin._id,
      moderatedAt: new Date('2025-09-12'),
      helpfulCount: 21,
    });

    // Experience 5: Approved Hexaware Technologies Experience by Student 3 (Karthik Raja)
    const exp5 = await InterviewExperience.create({
      studentId: student3._id,
      companyId: hexaware._id,
      placementDriveId: hexawareDrive._id,
      jobRole: 'Software Engineer (PGET)',
      interviewDate: new Date('2025-08-20'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Medium',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Online Aptitude & Technical Assessment (Mettl)',
          roundType: 'Online Assessment',
          description:
            '100 minutes assessment on Mettl platform. Section 1: Quantitative Aptitude (20 Qs), Logical Reasoning (20 Qs), and Verbal Ability (20 Qs). Section 2: Technical MCQs on C/Java, OOPs, Data Structures, and Pseudo-code (30 Qs). Section 3: 2 Coding Problems.',
          questionsAsked: [
            'Coding 1: Given a string s, return true if the string can be a palindrome after deleting at most one character from it.',
            'Coding 2: Given an array of integers, sort the array based on the frequency of elements in descending order; if frequencies are equal, sort by value.',
            'MCQ: Output of recursive C function with static pointer variables.',
            'MCQ: Find the time complexity of searching in an AVL tree vs a Binary Search Tree under worst case.',
          ],
          topicsCovered: [
            'Quantitative Aptitude',
            'Logical Reasoning',
            'Strings',
            'Hash Maps',
            'Pointers & Recursion',
            'Pseudo Code',
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Automated Communication & Versant Test',
          roundType: 'Online Assessment',
          description:
            '30 minutes automated voice assessment testing English language proficiency. Evaluated pronunciation, vocabulary, sentence fluency, and spontaneous speaking.',
          questionsAsked: [
            'Part A: Reading 8 displayed sentences aloud with natural pacing and accurate pronunciation.',
            'Part B: Repeat 12 sentences played through headphones without grammatical mistakes.',
            'Part C: Quick short-answer questions (e.g., "If you are freezing, is the weather hot or cold?").',
            'Part D: Sentence rearrangement (reassembling shuffled words spoken aloud into a grammatically correct sentence).',
            'Part E: 1-minute spontaneous speaking on the topic: "Why is continuous upskilling essential for fresh software engineers in the era of AI?".',
          ],
          topicsCovered: [
            'Spoken English',
            'Listening Comprehension',
            'Pronunciation',
            'Sentence Mastery',
            'Spontaneous Speaking',
          ],
        },
        {
          roundNumber: 3,
          roundName: 'Technical Interview (Core CS, OOPS & Project Walkthrough)',
          roundType: 'Technical Round',
          description:
            '40 minutes virtual interview with Technical Lead. Deep focus on Object-Oriented Programming (OOPS), Database Normalization (1NF to 3NF), and an exhaustive review of my academic capstone project.',
          questionsAsked: [
            'Explain the 4 pillars of OOPS with real-life software examples (Encapsulation vs Abstraction, Compile-time vs Runtime Polymorphism).',
            'Why does Java not support multiple inheritance with classes, and how do Interfaces resolve the Diamond Problem?',
            'SQL Query: Write a query to find employees who do not belong to any department using a LEFT JOIN and checking for NULL.',
            'Explain database normalization up to BCNF. What anomalies (insert, update, delete) are resolved by 3NF?',
            'Live Code: Reverse a singly linked list iteratively and explain the pointer manipulation step by step.',
          ],
          topicsCovered: [
            'Java OOPs',
            'Database Normalization',
            'SQL Joins',
            'Linked Lists',
            'Project Architecture',
          ],
        },
        {
          roundNumber: 4,
          roundName: 'HR & Cultural Fitment Round',
          roundType: 'HR',
          description:
            '20 minutes conversational interview evaluating cultural fit, willingness to relocate to Hexaware development centers (Chennai, Pune, Bangalore, Mumbai), communication clarity, and career orientation.',
          questionsAsked: [
            'Walk me through your resume and highlight what sets you apart as a fresher engineer.',
            'Are you comfortable relocating and working in rotational project shifts for global enterprise clients?',
            'What do you know about Hexaware’s automation-first and "Automate Everything" philosophy?',
            'Where do you see yourself technically in the next 3 to 5 years?',
          ],
          topicsCovered: [
            'HR Fitment',
            'Relocation Flexibility',
            'Company Knowledge',
            'Career Vision',
            'Communication',
          ],
        },
      ],
      preparationStrategy:
        'Practiced aptitude problems on IndiaBIX and PrepInsta for 3 weeks to achieve high test speed. Prepared for the Versant round by recording myself speaking English and reviewing pronunciation. For technical rounds, revised Java OOPS concepts thoroughly and practiced basic DSA on LeetCode.',
      resourcesRecommended:
        'PrepInsta Hexaware Placement Material, IndiaBIX Quantitative Aptitude, JavaTpoint Core Java, Gate Smashers DBMS Playlist.',
      advice:
        'Crucial tips for students yet to be placed:\n1. Do NOT underestimate the Versant / Communication test! Every year, dozens of technically sound candidates are eliminated in Round 2 simply because of poor mic quality, background noise, or speaking too fast. Practice speaking slowly and clearly in a quiet room with good earphones.\n2. In the technical round, Hexaware loves testing strong fundamentals over hyper-complex competitive programming. Make sure your OOPS concepts (interfaces vs abstract classes, overriding), SQL queries (Joins, Group By, Having), and basic Data Structures (Arrays, Strings, LinkedLists) are rock solid.\n3. Know every single term on your resume. If you listed React, Docker, or Spring Boot, you must be able to explain how you used it and why you chose it.\n4. Stay positive and maintain high energy throughout the interview. Even when asked a question you do not know, state what you know honestly and try to reason through it aloud.',
      status: 'Approved',
      moderationFeedback:
        'Confirmed offer letter and authentic experience breakdown. High value advice on Versant and core CS fundamentals.',
      moderatedBy: admin._id,
      moderatedAt: new Date('2025-08-28'),
      helpfulCount: 18,
    });

    // Experience 6: Approved Cognizant Experience by Student 6 (Vikram Sundaram)
    const exp6 = await InterviewExperience.create({
      studentId: student6._id,
      companyId: cognizant._id,
      placementDriveId: cognizantDrive._id,
      jobRole: 'GenC Next Software Engineer',
      interviewDate: new Date('2025-09-15'),
      interviewMode: 'virtual',
      selectionOutcome: 'Selected',
      difficulty: 'Medium',
      rounds: [
        {
          roundNumber: 1,
          roundName: 'AMCAT Online Assessment (Aptitude & Advanced Coding)',
          roundType: 'Online Assessment',
          description:
            '120 minutes assessment conducted on Superset/AMCAT. Section 1: Quantitative Ability, Logical Reasoning, and Verbal Ability (60 mins). Section 2: Advanced Coding Assessment with 2 complex algorithmic problems (60 mins). Passing the advanced coding problems with high test case coverage determined eligibility for the premium GenC Next cadre.',
          questionsAsked: [
            'Coding 1: Longest Substring Without Repeating Characters using the Sliding Window technique.',
            'Coding 2: Given an array representing gas stations, find the starting station from which a car can complete a circular tour (Greedy approach).',
            'Aptitude: Time, Speed and Distance problem involving relative speeds of two trains crossing each other.',
            'Logical Reasoning: Complex seating arrangement puzzle with 8 people sitting in a circle facing inward and outward.',
          ],
          topicsCovered: [
            'Sliding Window',
            'Greedy Algorithms',
            'Strings',
            'Quantitative Aptitude',
            'Seating Arrangements',
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Technical Interview (Core CS, DSA & Live Coding)',
          roundType: 'Technical Round',
          description:
            '50 minutes virtual interview with a Senior Architect (12+ years experience). Thorough evaluation of Data Structures, Object-Oriented Architecture, Database design, and live coding on a shared browser IDE with screen sharing.',
          questionsAsked: [
            'Live Coding: Write code to reverse a Singly Linked List in groups of size K.',
            'Core Java: Explain the difference between Comparable and Comparator interfaces. When would you use one over the other?',
            'DBMS: Explain ACID properties with a banking debit/credit transaction example. What is a dirty read, and which isolation level prevents it?',
            'SQL: Find the second highest salary without using TOP or LIMIT keyword (using subqueries).',
            'Web/APIs: Explain RESTful HTTP status codes (200, 201, 400, 401, 403, 500) and difference between synchronous and asynchronous calls.',
            'Project Deep Dive: Explain your database schema design and explain why you added indexes on specific columns.',
          ],
          topicsCovered: [
            'Linked List',
            'Java Interfaces',
            'ACID Properties',
            'SQL Subqueries',
            'REST APIs',
            'Database Indexing',
          ],
        },
        {
          roundNumber: 3,
          roundName: 'HR & Leadership Fitment Round',
          roundType: 'HR',
          description:
            '25 minutes interview assessing professional agility, readiness to adapt to unfamiliar tech stacks (e.g. enterprise cloud platforms), conflict resolution in teamwork, and long-term career orientation.',
          questionsAsked: [
            'Walk me through your engineering journey, highlighting both academic and non-academic achievements.',
            'If Cognizant assigns you to a project with a technology stack you have never touched before (e.g., Salesforce or Cloud DevOps), how will you ramp up?',
            'Tell me about a time you handled a disagreement with a peer during a college hackathon or capstone project.',
            'Where do you see yourself contributing in Cognizant over the next 3 to 5 years?',
          ],
          topicsCovered: [
            'Adaptability',
            'Team Conflict Resolution',
            'Career Expectations',
            'Cultural Fit',
            'Communication',
          ],
        },
      ],
      preparationStrategy:
        'Aimed specifically for the GenC Next role from the start. Practiced medium DSA problems on LeetCode (focused on Sliding Window, Two Pointers, and Binary Search). Solved previous AMCAT aptitude question patterns on FacePrep and PrepInsta. Built a full-stack project so I could talk about frontend, backend, and DB.',
      resourcesRecommended:
        'LeetCode Blind 75, PrepInsta Cognizant Placement Preparation, Striver SDE Sheet, JavaTpoint, GeeksforGeeks Cognizant Interview Experiences.',
      advice:
        'Essential guidance for every student aiming for Cognizant and top IT recruiters:\n1. Aim for the top tier (GenC Next / Elevate)! The difference in role and compensation between standard GenC and GenC Next is significant, and the primary differentiator is your score in the Advanced Coding section of Round 1. Focus on passing ALL hidden test cases, including edge cases with 0, 1, or negative inputs.\n2. In the technical interview, always explain your logic before typing code. Even if your initial approach is brute-force, state it clearly: "The brute force approach takes O(n^2), but we can optimize this to O(n) using a HashMap or Sliding Window." Interviewers love seeing optimization thinking!\n3. Know your final year / capstone project inside out. Don’t just memorize the slides; be ready to explain the database tables, API routes, security measures, and challenges you personally solved.\n4. Stay consistent. Placement season can feel overwhelming when companies visit back-to-back. Don’t get discouraged if you miss one drive; learn from the questions asked and bounce back stronger for the next one!',
      status: 'Approved',
      moderationFeedback:
        'Officially verified GenC Next offer. Detailed breakdown of AMCAT online test and technical interview questions.',
      moderatedBy: admin._id,
      moderatedAt: new Date('2025-09-25'),
      helpfulCount: 26,
    });

    console.log('[Seed] Created Approved & Pending Interview Experiences (including Tiger Analytics, Hexaware, Cognizant).');

    // 7. Create Curated Technical Questions (30+ questions)
    await Question.create([
      // Data Structures & Algorithms
      {
        title: 'Two Sum Problem',
        questionText:
          'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        category: 'Data Structures',
        difficulty: 'Easy',
        companyId: google._id,
        topicTags: ['Arrays', 'Hash Map', 'Two Pointers'],
        answer: 'Use a Hash Map to store compliments with O(n) time and O(n) space.',
        explanation:
          'Iterate through the array. For each element num, compute complement = target - num. If complement exists in map, return [map[complement], currentIndex]. Otherwise store current num into map.',
        codeSnippet: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'LRU Cache Design',
        questionText:
          'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class with `get(key)` and `put(key, value)` in O(1) average time complexity.',
        category: 'Data Structures',
        difficulty: 'Medium',
        companyId: google._id,
        topicTags: ['Hash Map', 'Doubly Linked List', 'System Design'],
        answer: 'Combine a Hash Map with a Doubly Linked List.',
        explanation:
          'The Hash Map provides O(1) key lookups mapping to nodes in a Doubly Linked List. The Doubly Linked List enables O(1) node additions to head and O(1) evictions from tail.',
        codeSnippet: `class Node {
  constructor(k, v) { this.k = k; this.v = v; this.prev = null; this.next = null; }
}`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Merge K Sorted Lists',
        questionText:
          'You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        category: 'Algorithms',
        difficulty: 'Hard',
        companyId: amazon._id,
        topicTags: ['Linked List', 'Divide and Conquer', 'Heap/Priority Queue'],
        answer: 'Use a Min-Heap of size K or Divide and Conquer merge approach.',
        explanation:
          'Push head of each linked list into a Min-Heap. Pop minimum node, attach to result, and push its next node. Time complexity: O(N log k), where N is total number of nodes and k is number of lists.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Trapping Rain Water',
        questionText:
          'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        category: 'Algorithms',
        difficulty: 'Hard',
        companyId: google._id,
        topicTags: ['Arrays', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
        answer: 'Two Pointers approach in O(n) time and O(1) space.',
        explanation:
          'Maintain leftMax and rightMax pointers. Water trapped at position i depends on min(leftMax, rightMax) - height[i]. Move the pointer with the smaller max value.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Longest Palindromic Substring',
        questionText:
          'Given a string `s`, return the longest palindromic substring in `s`. Expand around centers or Dynamic Programming.',
        category: 'Algorithms',
        difficulty: 'Medium',
        companyId: msft._id,
        topicTags: ['Strings', 'Dynamic Programming', 'Two Pointers'],
        answer: 'Expand Around Center approach has O(n^2) time and O(1) space.',
        explanation:
          'A palindrome mirrors around its center. There are 2n - 1 centers (each character and each gap between adjacent characters). Expand left and right while characters match.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // DBMS & SQL
      {
        title: 'ACID Properties in Database Systems',
        questionText:
          'Explain the ACID properties of transactions in a Relational Database Management System. Why are they critical for transaction reliability?',
        category: 'DBMS',
        difficulty: 'Easy',
        companyId: null,
        topicTags: ['Transactions', 'ACID', 'Concurrency', 'RDBMS'],
        answer: 'Atomicity, Consistency, Isolation, and Durability.',
        explanation:
          'Atomicity: All operations succeed or all roll back (All-or-Nothing). Consistency: DB transitions from one valid state to another. Isolation: Concurrent transactions do not interfere with each other. Durability: Once committed, updates persist even across system crashes.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Difference between Indexing Types (B-Tree vs Hash Index)',
        questionText:
          'What is the fundamental difference between a B-Tree index and a Hash index in SQL databases? When should each be chosen?',
        category: 'DBMS',
        difficulty: 'Medium',
        companyId: msft._id,
        topicTags: ['Indexes', 'B-Tree', 'Hash Index', 'Query Optimization'],
        answer: 'B-Tree supports range queries; Hash Index only supports exact equality lookups.',
        explanation:
          'B-Tree indexes maintain sorted keys and provide O(log n) searches, insertions, and range scans (BETWEEN, <, >). Hash indexes provide O(1) equality lookups (key = value) but cannot handle range queries.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Find Nth Highest Salary in SQL',
        questionText:
          'Write a SQL query to find the Nth highest salary from an Employee table without using hardcoded limits.',
        category: 'SQL',
        difficulty: 'Medium',
        companyId: tcs._id,
        topicTags: ['SQL', 'DENSE_RANK', 'Subqueries', 'Window Functions'],
        answer: 'Use DENSE_RANK() window function.',
        explanation:
          'SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk FROM Employee) WHERE rnk = N;',
        codeSnippet: `SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
  FROM Employee
) ranked WHERE rnk = 2 LIMIT 1;`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Operating Systems
      {
        title: 'Process vs Thread & Context Switching Overhead',
        questionText:
          'Explain the key differences between a Process and a Thread. Why is thread context switching faster than process context switching?',
        category: 'Operating Systems',
        difficulty: 'Easy',
        companyId: null,
        topicTags: ['Processes', 'Threads', 'Context Switching', 'Memory'],
        answer:
          'Processes have independent address spaces; threads share the memory and resources of their parent process.',
        explanation:
          'A process has its own PCB, memory space, file descriptors, and page table. A thread shares code, data, and heap with peer threads, having only its own stack and registers. Thread switching avoids invalidating the CPU translation lookaside buffer (TLB), making it much faster.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Deadlock Conditions and Prevention (Coffman Conditions)',
        questionText:
          'What are the four necessary Coffman conditions for a deadlock to occur in an operating system? How can we prevent deadlock by breaking one condition?',
        category: 'Operating Systems',
        difficulty: 'Medium',
        companyId: msft._id,
        topicTags: ['Deadlock', 'Concurrency', 'Semaphores', 'Coffman'],
        answer: 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
        explanation:
          'Breaking any one condition prevents deadlock. For example, enforcing a global resource hierarchy prevents Circular Wait.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Computer Networks
      {
        title: 'What Happens When You Type a URL in a Browser?',
        questionText:
          'Explain step-by-step everything that happens when you type https://www.google.com in a browser and hit Enter, from DNS resolution to DOM rendering.',
        category: 'Computer Networks',
        difficulty: 'Medium',
        companyId: google._id,
        topicTags: ['DNS', 'TCP/IP', 'TLS/SSL', 'HTTP', 'Browser Rendering'],
        answer:
          'Browser cache check -> DNS resolution -> TCP 3-way handshake -> TLS handshake -> HTTP GET -> Server response -> HTML/CSS parsing and rendering.',
        explanation:
          '1. Browser checks cache (browser, OS, hosts file, router). 2. Queries DNS recursive resolver. 3. TCP 3-way handshake (SYN, SYN-ACK, ACK). 4. TLS 1.3 handshake exchange. 5. HTTP GET request sent. 6. Server returns HTML. 7. Browser constructs DOM, CSSOM, Render Tree, and paints screen.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'TCP vs UDP Differences and Use Cases',
        questionText:
          'Compare TCP (Transmission Control Protocol) and UDP (User Datagram Protocol). When is UDP preferred over TCP in modern networks?',
        category: 'Computer Networks',
        difficulty: 'Easy',
        companyId: null,
        topicTags: ['TCP', 'UDP', 'Transport Layer', 'Sockets'],
        answer:
          'TCP is connection-oriented, reliable, and ordered. UDP is connectionless, lightweight, and unordered.',
        explanation:
          'TCP provides checksums, acknowledgments, retransmissions, and flow control (HTTP, FTP, SSH). UDP minimizes overhead and latency, making it ideal for real-time video streaming, VoIP, online gaming, and DNS.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // MERN Stack & Web Development
      {
        title: 'React Virtual DOM and Reconciliation Algorithm',
        questionText:
          'What is the Virtual DOM in React? How does the Diffing/Reconciliation algorithm work to update the real DOM efficiently?',
        category: 'MERN Stack',
        difficulty: 'Medium',
        companyId: null,
        topicTags: ['React', 'Virtual DOM', 'Reconciliation', 'Fiber'],
        answer:
          'Virtual DOM is an in-memory lightweight representation of the real DOM. React diffs old and new trees using heuristic O(n) algorithms.',
        explanation:
          'React creates a new Virtual DOM tree on state change, compares it with the previous snapshot (diffing), calculates the minimal required changes, and batch-updates the browser DOM in a single flush.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Node.js Event Loop & Non-Blocking I/O Architecture',
        questionText:
          'How does Node.js handle thousands of concurrent requests with a single thread? Explain the Event Loop phases.',
        category: 'MERN Stack',
        difficulty: 'Hard',
        companyId: null,
        topicTags: ['Node.js', 'Event Loop', 'libuv', 'Asynchronous'],
        answer:
          'Node.js delegates I/O operations to libuv worker threads and uses an Event Loop to dispatch callbacks back to the main thread.',
        explanation:
          'Event Loop phases: 1. Timers (setTimeout/setInterval) 2. Pending callbacks 3. Idle, prepare 4. Poll (incoming I/O) 5. Check (setImmediate) 6. Close callbacks. process.nextTick executes between phases.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Java & OOP
      {
        title: 'Explain Polymorphism: Compile-Time vs Runtime in Java',
        questionText:
          'Differentiate between Method Overloading (Compile-Time) and Method Overriding (Runtime Polymorphism) in Java with code examples.',
        category: 'Java',
        difficulty: 'Easy',
        companyId: infosys._id,
        topicTags: ['Java', 'OOP', 'Polymorphism', 'Overriding'],
        answer:
          'Overloading occurs within the same class with different parameter signatures; Overriding occurs in child classes with exact same signature using dynamic method dispatch.',
        explanation:
          'Method overloading is resolved at compile time based on parameter types. Method overriding uses the `@Override` annotation and resolves method calls dynamically at runtime based on the actual object instance.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Garbage Collection and Memory Generations in Java JVM',
        questionText:
          'Describe how Java Garbage Collection works. Explain the Young Generation (Eden, Survivor) and Old (Tenured) Generation.',
        category: 'Java',
        difficulty: 'Medium',
        companyId: null,
        topicTags: ['Java', 'JVM', 'Garbage Collection', 'Memory Management'],
        answer:
          'JVM divides heap into Young Generation (Eden, S0, S1) and Old Generation based on the Weak Generational Hypothesis.',
        explanation:
          'New objects are allocated in Eden space. Surviving objects after Minor GC move to Survivor spaces and are aged. Once their age exceeds a threshold, they are promoted to the Old Generation where Major/Full GC occurs.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Python
      {
        title: 'Python GIL (Global Interpreter Lock) and Concurrency',
        questionText:
          'What is the Global Interpreter Lock (GIL) in CPython? How does it affect multi-threaded CPU-bound programs versus I/O-bound programs?',
        category: 'Python',
        difficulty: 'Medium',
        companyId: null,
        topicTags: ['Python', 'GIL', 'Concurrency', 'Multiprocessing'],
        answer:
          'The GIL is a mutex preventing multiple native threads from executing Python bytecodes simultaneously in CPython.',
        explanation:
          'In CPU-bound tasks, multi-threading in Python cannot utilize multi-core processors due to the GIL; use `multiprocessing` instead. In I/O-bound tasks, threads release the GIL during network/disk waiting, allowing concurrent execution.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Aptitude & Logical Reasoning
      {
        title: 'Time, Speed and Distance: Two Trains Moving in Opposite Directions',
        questionText:
          'Two trains 140m and 160m long run at speeds of 60 km/h and 40 km/h respectively in opposite directions on parallel tracks. How long do they take to cross each other from the moment they meet?',
        category: 'Aptitude',
        difficulty: 'Easy',
        companyId: tcs._id,
        topicTags: ['Aptitude', 'Relative Speed', 'Trains', 'Arithmetic'],
        answer: '10.8 seconds.',
        explanation:
          'Total distance = 140 + 160 = 300 meters. Relative speed = 60 + 40 = 100 km/h. Convert to m/s: 100 * (5/18) = 250/9 m/s. Time = 300 / (250/9) = (300 * 9) / 250 = 10.8 seconds.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Probability: Rolling Two Dice with Target Sum',
        questionText:
          'Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on top is either a prime number or greater than 9?',
        category: 'Aptitude',
        difficulty: 'Medium',
        companyId: infosys._id,
        topicTags: ['Probability', 'Combinatorics', 'Aptitude'],
        answer: '19 / 36.',
        explanation:
          'Total outcomes = 36. Prime sums (2, 3, 5, 7, 11): 1 + 2 + 4 + 6 + 2 = 15 outcomes. Sums > 9 (10, 11, 12): (4,6),(5,5),(6,4),(5,6),(6,5),(6,6) = 6 outcomes. Notice sum 11 is in both (2 outcomes). Total unique outcomes = 15 + 6 - 2 = 19. Probability = 19/36.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // HR & Behavioral
      {
        title: 'Tell Me About a Time You Failed (STAR Method)',
        questionText:
          'Describe a situation where a software project or academic goal did not go as planned. What actions did you take and what did you learn?',
        category: 'HR Interview',
        difficulty: 'Easy',
        companyId: amazon._id,
        topicTags: ['STAR Method', 'Behavioral', 'Self-Awareness', 'Resilience'],
        answer:
          'Use Situation, Task, Action, Result framework focusing on personal accountability and constructive reflection.',
        explanation:
          'Structure your response: 1. Situation: Describe context briefly. 2. Task: What were you trying to accomplish. 3. Action: Where did things fall short and what did you proactively do to salvage the situation. 4. Result & Learning: Highlight key lessons and how you applied them to subsequent successes.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Tiger Analytics Practice Questions
      {
        title: 'SQL: Find Second Highest Department Revenue using DENSE_RANK()',
        questionText:
          'Given a sales table `DepartmentSales` with columns `department_id`, `sales_amount`, and `sale_date`, write an SQL query to find the second highest sales amount in each department for the current quarter. Handle ties gracefully.',
        category: 'SQL',
        difficulty: 'Medium',
        companyId: tiger._id,
        topicTags: ['SQL', 'Window Functions', 'DENSE_RANK', 'Analytics', 'Tiger Analytics'],
        answer:
          'Use DENSE_RANK() OVER (PARTITION BY department_id ORDER BY sales_amount DESC) in a Common Table Expression (CTE).',
        explanation:
          'Using DENSE_RANK() ensures that if two salespeople in the same department tie for 1st place, the next distinct revenue amount is assigned rank 2 without skipping ranks. Filter for rank = 2 in the outer query.',
        codeSnippet: `WITH RankedSales AS (
  SELECT 
    department_id, 
    sales_amount,
    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY sales_amount DESC) AS revenue_rank
  FROM DepartmentSales
  WHERE sale_date >= '2025-01-01'
)
SELECT department_id, sales_amount
FROM RankedSales
WHERE revenue_rank = 2;`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Pandas: Missing Value Imputation and Skewness Correction',
        questionText:
          'Write a Python function using Pandas to clean a real-world dataset: impute numerical missing values with group median, impute categorical missing values with mode, and apply log-transformation (np.log1p) to columns with skewness greater than 1.5.',
        category: 'Python',
        difficulty: 'Medium',
        companyId: tiger._id,
        topicTags: ['Pandas', 'Data Cleaning', 'Feature Engineering', 'Data Science', 'Tiger Analytics'],
        answer: 'Use DataFrame transform and np.log1p.',
        explanation:
          'Group median imputation preserves department/category variances better than overall median. Log1p prevents -inf on 0 values and corrects right-skewed revenue/duration data.',
        codeSnippet: `import pandas as pd
import numpy as np

def clean_analytics_data(df, group_col='department'):
    num_cols = df.select_dtypes(include=[np.number]).columns
    cat_cols = df.select_dtypes(include=['object', 'category']).columns

    # Impute numeric columns by group median
    for col in num_cols:
        df[col] = df.groupby(group_col)[col].transform(lambda x: x.fillna(x.median()))

    # Impute categorical columns by mode
    for col in cat_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    # Correct right-skewed numeric columns
    for col in num_cols:
        if df[col].skew() > 1.5:
            df[col] = np.log1p(np.maximum(df[col], 0))

    return df`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Hexaware Technologies Practice Questions
      {
        title: 'Valid Palindrome by Removing at Most One Character',
        questionText:
          'Given a string `s`, return `true` if the string can be a palindrome after deleting at most one character from it. Achieve optimal O(N) time and O(1) space complexity.',
        category: 'Algorithms',
        difficulty: 'Easy',
        companyId: hexaware._id,
        topicTags: ['Strings', 'Two Pointers', 'Hexaware PGET', 'Palindrome'],
        answer: 'Use Two Pointers moving from left and right.',
        explanation:
          'Compare characters at left and right pointers. When a mismatch occurs, check whether skipping left character (left + 1 to right) or skipping right character (left to right - 1) produces a valid palindrome.',
        codeSnippet: `function validPalindrome(s) {
  let left = 0, right = s.length - 1;

  function isPal(l, r) {
    while (l < r) {
      if (s[l] !== s[r]) return false;
      l++;
      r--;
    }
    return true;
  }

  while (left < right) {
    if (s[left] !== s[right]) {
      return isPal(left + 1, right) || isPal(left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Difference Between Abstract Class and Interface in Java',
        questionText:
          'Explain the fundamental differences between an Abstract Class and an Interface in Java (post Java 8 & Java 9). When should you choose an abstract class over an interface in enterprise system design?',
        category: 'Core Java',
        difficulty: 'Easy',
        companyId: hexaware._id,
        topicTags: ['Java', 'OOP', 'Interfaces', 'Abstract Classes', 'Hexaware'],
        answer:
          'Abstract classes can have state (instance variables) and constructors; Interfaces define contract behaviors and support multiple inheritance.',
        explanation:
          'An abstract class is used when classes share a common identity and code reusability (is-a relationship, e.g., Employee -> Manager). An interface is used when unrelated classes share common capabilities (can-do relationship, e.g., Printable, Serializable). Since Java 8, interfaces support default and static methods, and Java 9 added private methods.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },

      // Cognizant Practice Questions
      {
        title: 'Longest Substring Without Repeating Characters',
        questionText:
          'Given a string `s`, find the length of the longest substring without duplicate characters. Implement in O(n) time using the Sliding Window technique.',
        category: 'Algorithms',
        difficulty: 'Medium',
        companyId: cognizant._id,
        topicTags: ['Strings', 'Sliding Window', 'Hash Map', 'Cognizant GenC Next'],
        answer: 'Use Sliding Window with a Hash Map storing the last seen indices.',
        explanation:
          'Maintain a window [left, right]. As right expands, check if s[right] is already in the map with index >= left. If so, move left to map[s[right]] + 1. Update maxLength at each step.',
        codeSnippet: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Reverse a Singly Linked List in Groups of Size K',
        questionText:
          'Given the head of a linked list, reverse the nodes of the list `k` at a time, and return the modified list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.',
        category: 'Data Structures',
        difficulty: 'Hard',
        companyId: cognizant._id,
        topicTags: ['Linked List', 'Recursion', 'Two Pointers', 'Cognizant GenC Next'],
        answer: 'Recursive or iterative pointer reversal in chunks of K nodes.',
        explanation:
          'Count k nodes from head. If k nodes exist, reverse those k nodes, recursively call for head.next, and connect the reversed group to the returned node.',
        sourceType: 'Curated Practice',
        status: 'published',
        createdBy: admin._id,
      },
    ]);
    console.log('[Seed] Created Curated Technical Questions (including Tiger Analytics, Hexaware, Cognizant).');

    // 8. Create Study Resources
    await StudyResource.create([
      {
        title: 'Striver SDE Sheet - Essential DSA Topic Guide',
        description:
          'Curated list of 180+ problems covering arrays, linked lists, trees, graphs, dynamic programming, and greedy algorithms for product company interviews.',
        category: 'Coding practice',
        companyId: null,
        topicTags: ['DSA', 'LeetCode', 'Interview Prep', 'Algorithms'],
        resourceType: 'guide',
        resourceUrl: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Google Technical Interview Preparation Comprehensive Guide',
        description:
          'Official guidelines and tips for passing Google software engineering assessments, whiteboard coding, and Googleyness rounds.',
        category: 'Company preparation guides',
        companyId: google._id,
        topicTags: ['Google', 'Software Engineer', 'System Design', 'Algorithms'],
        resourceType: 'article',
        resourceUrl: 'https://careers.google.com/how-we-hire/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Microsoft College Placement Roadmap & Core CS Revision',
        description:
          'Comprehensive checklist for Microsoft campus recruitment covering Data Structures, Operating Systems, Computer Networks, and Azure fundamentals.',
        category: 'Company preparation guides',
        companyId: msft._id,
        topicTags: ['Microsoft', 'SDE', 'OS', 'DBMS'],
        resourceType: 'article',
        resourceUrl: 'https://careers.microsoft.com',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Amazon Leadership Principles with STAR Method Answer Templates',
        description:
          'Detailed guide on answering Amazon behavioral interview questions across all 16 Leadership Principles using verified STAR stories.',
        category: 'HR interview preparation',
        companyId: amazon._id,
        topicTags: ['Amazon', 'Leadership Principles', 'STAR Method', 'Behavioral'],
        resourceType: 'guide',
        resourceUrl: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'DBMS & SQL High-Yield Revision Notes for Campus Placements',
        description:
          'High-yield study notes covering Normalization (1NF to BCNF), Transaction ACID properties, Joins, Indexing, and Query Optimization.',
        category: 'Technical interview notes',
        companyId: null,
        topicTags: ['DBMS', 'SQL', 'Normalization', 'ACID'],
        resourceType: 'guide',
        resourceUrl: 'https://www.geeksforgeeks.org/dbms/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Quantitative Aptitude & Logical Reasoning Formula Cheat Sheet',
        description:
          'Formulas and shortcuts for Time & Work, Time Speed Distance, Permutations, Probability, Syllogisms, and Data Interpretation.',
        category: 'Aptitude notes',
        companyId: null,
        topicTags: ['Aptitude', 'Formulas', 'TCS NQT', 'Infosys'],
        resourceType: 'pdf',
        resourceUrl: 'https://www.indiabix.com/aptitude/questions-and-answers/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Modern Technical Resume Blueprint for Software Engineering Interns & Freshers',
        description:
          'ATS-friendly LaTeX and Markdown resume templates with strong action verbs and project impact quantification guidelines.',
        category: 'Resume preparation',
        companyId: null,
        topicTags: ['Resume', 'ATS', 'Projects', 'Career'],
        resourceType: 'guide',
        resourceUrl: 'https://www.overleaf.com/gallery/tagged/cv',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Tiger Analytics Data Science & Advanced SQL Preparation Playbook',
        description:
          'Comprehensive placement playbook detailing SQL Window functions (RANK, DENSE_RANK, LEAD/LAG), ML algorithm tradeoffs, customer churn case study frameworks, and live coding interview tips.',
        category: 'Interview Guide',
        companyId: tiger._id,
        topicTags: ['Tiger Analytics', 'SQL', 'Machine Learning', 'Data Science', 'Case Study'],
        resourceType: 'guide',
        resourceUrl: 'https://www.tigeranalytics.com/careers/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Hexaware Premier GET (PGET) Recruitment Crack Kit & Versant Audio Guide',
        description:
          'Step-by-step preparation kit for Hexaware Mettl Aptitude, automated Versant voice assessment tips, core Java OOPS revision, and database normalization notes.',
        category: 'Interview Guide',
        companyId: hexaware._id,
        topicTags: ['Hexaware', 'PGET', 'Versant', 'Java OOPS', 'Aptitude'],
        resourceType: 'guide',
        resourceUrl: 'https://jobs.hexaware.com/',
        status: 'published',
        createdBy: admin._id,
      },
      {
        title: 'Cognizant GenC & GenC Next Comprehensive Placement Cracking Roadmap',
        description:
          'Complete roadmap for cracking the GenC Next premium package: AMCAT advanced coding patterns, sliding window techniques, DBMS ACID properties, and technical interview walkthroughs.',
        category: 'Cheat Sheet',
        companyId: cognizant._id,
        topicTags: ['Cognizant', 'GenC Next', 'AMCAT', 'DSA', 'Java'],
        resourceType: 'guide',
        resourceUrl: 'https://careers.cognizant.com/',
        status: 'published',
        createdBy: admin._id,
      },
    ]);
    console.log('[Seed] Created Study Resources (including Tiger Analytics, Hexaware, Cognizant).');

    // 9. Create Study Tasks for Demo Student 1
    await StudyTask.create([
      {
        userId: student1._id,
        title: 'Review System Design basics (Load balancers & Caching)',
        description: 'Read chapter 1 of Alex Xu System Design Volume 1.',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        userId: student1._id,
        title: 'Solve 5 Tree BFS problems on LeetCode',
        description: 'Level order traversal, zigzag traversal, right view of binary tree.',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
        completedAt: new Date(),
      },
      {
        userId: student1._id,
        title: 'Practice mock HR questions using STAR format',
        description: 'Prepare answers for conflict resolution and leadership examples.',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ]);

    // 10. Create Bookmarks for Demo Student 1
    await Bookmark.create([
      {
        userId: student1._id,
        itemType: 'experience',
        itemId: exp2._id,
      },
      {
        userId: student1._id,
        itemType: 'company',
        itemId: google._id,
      },
    ]);

    // 11. Initial Audit Log
    await AuditLog.create({
      actorId: admin._id,
      actorEmail: admin.email,
      actorRole: 'admin',
      action: 'SYSTEM_SEEDED',
      entityType: 'System',
      safeMetadata: { note: 'Initial placement demo data populated successfully with top recruiters.' },
    });

    console.log('[Seed] All sample data successfully seeded!');
    console.log('====================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@college.edu');
    console.log('  Password: AdminPass@2026');
    console.log('Student Accounts:');
    console.log('  Placed Student 1 (Google & TCS):         student1@college.edu / StudentPass@2026');
    console.log('  Placed Student 2 (Microsoft):            student2@college.edu / StudentPass@2026');
    console.log('  Placed Student 3 (Amazon & Hexaware):    student3@college.edu / StudentPass@2026');
    console.log('  Student 4 (Not Placed / Preparing):      student4@college.edu / StudentPass@2026');
    console.log('  Placed Student 5 (Tiger Analytics):      student5@college.edu / StudentPass@2026');
    console.log('  Placed Student 6 (Cognizant GenC Next):  student6@college.edu / StudentPass@2026');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
