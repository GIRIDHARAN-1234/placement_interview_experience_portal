const Company = require('../models/Company');
const User = require('../models/User');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementOffer = require('../models/PlacementOffer');
const InterviewExperience = require('../models/InterviewExperience');
const Question = require('../models/Question');
const StudyResource = require('../models/StudyResource');

/**
 * Ensures Tiger Analytics, Hexaware Technologies, and Cognizant exist in the database
 * with verified recruitment experiences, questions, placement offers, and drives.
 * Safe to run on every server startup without duplicating data.
 */
const ensureDefaultData = async () => {
  try {
    // 1. Check or fetch admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('[Auto-Ensure] Admin user not found. Skipping auto-seed until admin is created.');
      return;
    }

    // 2. Ensure Tiger Analytics
    let tiger = await Company.findOne({ slug: 'tiger-analytics' });
    if (!tiger) {
      tiger = await Company.create({
        name: 'Tiger Analytics',
        slug: 'tiger-analytics',
        description:
          'Tiger Analytics is a global AI and analytics consulting firm that builds machine learning and data science solutions for Fortune 500 enterprises across retail, finance, healthcare, and manufacturing.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tiger_Analytics_Logo.png',
        industry: 'AI & Data Analytics',
        website: 'https://www.tigeranalytics.com/careers',
        jobRoles: ['Associate Data Scientist', 'Data Analyst', 'Data Engineer', 'AI Consultant'],
        skills: [
          'Python',
          'SQL (Window Functions)',
          'Machine Learning',
          'Pandas & NumPy',
          'Statistics & Probability',
          'Data Structures',
          'Data Storytelling',
          'Tableau / PowerBI',
        ],
        status: 'active',
      });
      console.log('[Auto-Ensure] Created company: Tiger Analytics');
    }

    // 3. Ensure Hexaware Technologies
    let hexaware = await Company.findOne({ slug: 'hexaware' });
    if (!hexaware) {
      hexaware = await Company.create({
        name: 'Hexaware Technologies',
        slug: 'hexaware',
        description:
          'Hexaware Technologies is a fast-growing global provider of IT, BPO, and consulting services specializing in cloud modernization, automation-first strategy, and next-generation enterprise application services.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Hexaware_Logo.svg',
        industry: 'IT Services & Consulting',
        website: 'https://jobs.hexaware.com',
        jobRoles: [
          'Software Engineer (PGET)',
          'Graduate Engineer Trainee (GET)',
          'Cloud & DevOps Associate',
          'Full Stack Developer',
        ],
        skills: [
          'Java',
          'Python',
          'Aptitude & Logical Reasoning',
          'DBMS & SQL',
          'Data Structures',
          'OOP Concepts',
          'Communication & Versant',
          'HTML/CSS/JavaScript',
        ],
        status: 'active',
      });
      console.log('[Auto-Ensure] Created company: Hexaware Technologies');
    }

    // 4. Ensure Cognizant
    let cognizant = await Company.findOne({ slug: 'cognizant' });
    if (!cognizant) {
      cognizant = await Company.create({
        name: 'Cognizant',
        slug: 'cognizant',
        description:
          'Cognizant (CTS) is an American multinational IT services, digital engineering, and technology consulting giant empowering global Fortune 500 enterprises with cloud, modern software, and intelligent automation.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Cognizant_logo_2022.svg',
        industry: 'IT Services & Consulting',
        website: 'https://careers.cognizant.com',
        jobRoles: [
          'GenC Next Software Engineer',
          'GenC Elevate Engineer',
          'GenC Programmer Analyst Trainee (PAT)',
          'Cloud Data Specialist',
        ],
        skills: [
          'Java',
          'Python',
          'Data Structures & Algorithms',
          'DBMS & SQL',
          'OOP Concepts',
          'REST APIs',
          'Web Technologies',
          'Cloud Fundamentals',
        ],
        status: 'active',
      });
      console.log('[Auto-Ensure] Created company: Cognizant');
    }

    // 5. Ensure Demo Placed Students for verification
    let studentSneha = await User.findOne({ email: 'sneha.patel@college.edu' });
    if (!studentSneha) {
      studentSneha = await User.create({
        name: 'Sneha Patel',
        email: 'sneha.patel@college.edu',
        registerNumber: '710021104142',
        department: 'Artificial Intelligence & Data Science',
        graduationYear: 2025,
        passwordHash: admin.passwordHash,
        role: 'student',
        accountStatus: 'active',
        isPlacementVerified: true,
        verifiedCompanies: [tiger._id],
      });
      console.log('[Auto-Ensure] Created placed student: Sneha Patel (Tiger Analytics)');
    } else if (!studentSneha.isPlacementVerified) {
      studentSneha.isPlacementVerified = true;
      if (!studentSneha.verifiedCompanies.includes(tiger._id)) {
        studentSneha.verifiedCompanies.push(tiger._id);
      }
      await studentSneha.save();
    }

    let studentKarthik = await User.findOne({ email: 'student3@college.edu' });
    if (studentKarthik && !studentKarthik.isPlacementVerified) {
      studentKarthik.isPlacementVerified = true;
      if (!studentKarthik.verifiedCompanies.includes(hexaware._id)) {
        studentKarthik.verifiedCompanies.push(hexaware._id);
      }
      await studentKarthik.save();
    }

    let studentVikram = await User.findOne({ email: 'vikram.sundaram@college.edu' });
    if (!studentVikram) {
      studentVikram = await User.create({
        name: 'Vikram Sundaram',
        email: 'vikram.sundaram@college.edu',
        registerNumber: '710021104199',
        department: 'Computer Science & Engineering',
        graduationYear: 2025,
        passwordHash: admin.passwordHash,
        role: 'student',
        accountStatus: 'active',
        isPlacementVerified: true,
        verifiedCompanies: [cognizant._id],
      });
      console.log('[Auto-Ensure] Created placed student: Vikram Sundaram (Cognizant)');
    } else if (!studentVikram.isPlacementVerified) {
      studentVikram.isPlacementVerified = true;
      if (!studentVikram.verifiedCompanies.includes(cognizant._id)) {
        studentVikram.verifiedCompanies.push(cognizant._id);
      }
      await studentVikram.save();
    }

    // 6. Ensure Placement Drives
    let tigerDrive = await PlacementDrive.findOne({ companyId: tiger._id });
    if (!tigerDrive) {
      tigerDrive = await PlacementDrive.create({
        companyId: tiger._id,
        title: 'Tiger Analytics Campus AI & Data Science Recruitment Drive 2025',
        driveYear: 2025,
        jobRoles: ['Associate Data Scientist', 'Data Analyst'],
        eligibleDepartments: [
          'Computer Science & Engineering',
          'Information Technology',
          'Artificial Intelligence & Data Science',
          'Electronics & Communication Engineering',
        ],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      });
    }

    let hexawareDrive = await PlacementDrive.findOne({ companyId: hexaware._id });
    if (!hexawareDrive) {
      hexawareDrive = await PlacementDrive.create({
        companyId: hexaware._id,
        title: 'Hexaware Technologies Premier Campus Drive 2025',
        driveYear: 2025,
        jobRoles: ['Software Engineer (PGET)', 'Graduate Engineer Trainee (GET)'],
        eligibleDepartments: [
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics & Communication Engineering',
          'Electrical & Electronics Engineering',
        ],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      });
    }

    let cognizantDrive = await PlacementDrive.findOne({ companyId: cognizant._id });
    if (!cognizantDrive) {
      cognizantDrive = await PlacementDrive.create({
        companyId: cognizant._id,
        title: 'Cognizant GenC & GenC Next Campus Drive 2025',
        driveYear: 2025,
        jobRoles: [
          'GenC Next Software Engineer',
          'GenC Elevate Engineer',
          'GenC Programmer Analyst Trainee (PAT)',
        ],
        eligibleDepartments: [
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics & Communication Engineering',
        ],
        graduationYears: [2025],
        status: 'completed',
        createdBy: admin._id,
      });
    }

    // 7. Ensure Placement Offers
    const tigerOffer = await PlacementOffer.findOne({
      studentId: studentSneha._id,
      companyId: tiger._id,
    });
    if (!tigerOffer) {
      await PlacementOffer.create({
        studentId: studentSneha._id,
        companyId: tiger._id,
        placementDriveId: tigerDrive._id,
        status: 'selected',
        jobRole: 'Associate Data Scientist',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-10'),
        notes:
          'Selected for Associate Data Scientist position via campus placement. Full document and offer letter verified.',
      });
    }

    const hexawareOffer = await PlacementOffer.findOne({
      studentId: studentKarthik ? studentKarthik._id : admin._id,
      companyId: hexaware._id,
    });
    if (!hexawareOffer && studentKarthik) {
      await PlacementOffer.create({
        studentId: studentKarthik._id,
        companyId: hexaware._id,
        placementDriveId: hexawareDrive._id,
        status: 'selected',
        jobRole: 'Software Engineer (PGET)',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-08-25'),
        notes:
          'Selected for Premier Graduate Engineer Trainee (PGET) role. Selection verified by placement office.',
      });
    }

    const cognizantOffer = await PlacementOffer.findOne({
      studentId: studentVikram._id,
      companyId: cognizant._id,
    });
    if (!cognizantOffer) {
      await PlacementOffer.create({
        studentId: studentVikram._id,
        companyId: cognizant._id,
        placementDriveId: cognizantDrive._id,
        status: 'selected',
        jobRole: 'GenC Next Software Engineer',
        verifiedBy: admin._id,
        verifiedAt: new Date('2025-09-22'),
        notes:
          'Top score in AMCAT Advanced Coding assessment. Confirmed GenC Next offer verified.',
      });
    }

    // 8. Ensure Tiger Analytics Verified Interview Experience
    const tigerExp = await InterviewExperience.findOne({ companyId: tiger._id });
    if (!tigerExp) {
      await InterviewExperience.create({
        studentId: studentSneha._id,
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
        helpfulCount: 19,
      });
      console.log('[Auto-Ensure] Created verified experience for Tiger Analytics');
    }

    // 9. Ensure Hexaware Technologies Verified Interview Experience
    const hexawareExp = await InterviewExperience.findOne({ companyId: hexaware._id });
    if (!hexawareExp) {
      await InterviewExperience.create({
        studentId: studentKarthik ? studentKarthik._id : admin._id,
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
        helpfulCount: 16,
      });
      console.log('[Auto-Ensure] Created verified experience for Hexaware Technologies');
    }

    // 10. Ensure Cognizant Verified Interview Experience
    const cognizantExp = await InterviewExperience.findOne({ companyId: cognizant._id });
    if (!cognizantExp) {
      await InterviewExperience.create({
        studentId: studentVikram._id,
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
        helpfulCount: 24,
      });
      console.log('[Auto-Ensure] Created verified experience for Cognizant');
    }

    // 11. Ensure Curated Questions for these companies
    const tigerQuestion = await Question.findOne({ companyId: tiger._id });
    if (!tigerQuestion) {
      await Question.create([
        {
          title: 'SQL: Find Second Highest Department Revenue using DENSE_RANK()',
          questionText:
            'Given a sales table `DepartmentSales` with columns `department_id`, `sales_amount`, and `sale_date`, write an SQL query to find the second highest sales amount in each department for the current quarter. Handle ties gracefully.',
          category: 'SQL',
          difficulty: 'Medium',
          companyId: tiger._id,
          topicTags: ['SQL', 'Window Functions', 'DENSE_RANK', 'Analytics'],
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
          topicTags: ['Pandas', 'Data Cleaning', 'Feature Engineering', 'Data Science'],
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
      ]);
      console.log('[Auto-Ensure] Added Tiger Analytics curated questions');
    }

    const hexawareQuestion = await Question.findOne({ companyId: hexaware._id });
    if (!hexawareQuestion) {
      await Question.create([
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
          category: 'Object-Oriented Programming',
          difficulty: 'Easy',
          companyId: hexaware._id,
          topicTags: ['Java', 'OOP', 'Interfaces', 'Abstract Classes'],
          answer:
            'Abstract classes can have state (instance variables) and constructors; Interfaces define contract behaviors and support multiple inheritance.',
          explanation:
            'An abstract class is used when classes share a common identity and code reusability (is-a relationship, e.g., Employee -> Manager). An interface is used when unrelated classes share common capabilities (can-do relationship, e.g., Printable, Serializable). Since Java 8, interfaces support default and static methods, and Java 9 added private methods.',
          sourceType: 'Curated Practice',
          status: 'published',
          createdBy: admin._id,
        },
      ]);
      console.log('[Auto-Ensure] Added Hexaware curated questions');
    }

    const cognizantQuestion = await Question.findOne({ companyId: cognizant._id });
    if (!cognizantQuestion) {
      await Question.create([
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
      console.log('[Auto-Ensure] Added Cognizant curated questions');
    }

    // 12. Ensure Curated Study Resources
    const tigerResource = await StudyResource.findOne({ companyId: tiger._id });
    if (!tigerResource) {
      await StudyResource.create({
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
      });
      console.log('[Auto-Ensure] Added Tiger Analytics study resource');
    }

    const hexawareResource = await StudyResource.findOne({ companyId: hexaware._id });
    if (!hexawareResource) {
      await StudyResource.create({
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
      });
      console.log('[Auto-Ensure] Added Hexaware study resource');
    }

    const cognizantResource = await StudyResource.findOne({ companyId: cognizant._id });
    if (!cognizantResource) {
      await StudyResource.create({
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
      });
      console.log('[Auto-Ensure] Added Cognizant study resource');
    }

    console.log('[Auto-Ensure] Default companies & verified recruitment experiences ensured!');
  } catch (error) {
    console.error(`[Auto-Ensure Error] ${error.message}`);
  }
};

module.exports = ensureDefaultData;
