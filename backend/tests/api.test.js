const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementOffer = require('../models/PlacementOffer');
const InterviewExperience = require('../models/InterviewExperience');

describe('Placement Portal Backend API Integration Tests', () => {
  let adminToken;
  let student1Token;
  let student4Token;
  let googleCompany;
  let msftCompany;
  let googleDrive;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Login Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@college.edu',
      password: 'AdminPass@2026',
    });
    adminToken = adminRes.body.token;

    // Login Placed Student 1 (Selected for Google)
    const s1Res = await request(app).post('/api/auth/login').send({
      email: 'student1@college.edu',
      password: 'StudentPass@2026',
    });
    student1Token = s1Res.body.token;

    // Login Non-placed Student 4 (Not selected for Google)
    const s4Res = await request(app).post('/api/auth/login').send({
      email: 'student4@college.edu',
      password: 'StudentPass@2026',
    });
    student4Token = s4Res.body.token;

    googleCompany = await Company.findOne({ slug: 'google' });
    msftCompany = await Company.findOne({ slug: 'microsoft' });
    googleDrive = await PlacementDrive.findOne({ companyId: googleCompany._id });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // ================= 1. AUTHENTICATION & AUTHORIZATION =================
  describe('Authentication Tests', () => {
    it('should register a new student with valid credentials', async () => {
      const uniqueId = Date.now();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Candidate',
          email: `candidate_${uniqueId}@college.edu`,
          registerNumber: `REG${uniqueId.toString().slice(-6)}`,
          department: 'Computer Science & Engineering',
          graduationYear: 2026,
          password: 'Password@123',
          confirmPassword: 'Password@123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user.role).toBe('student');
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Student',
        email: 'student1@college.edu',
        registerNumber: 'NEWREG999',
        department: 'Information Technology',
        graduationYear: 2026,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with duplicate register number', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate RegNo Student',
        email: 'newemail999@college.edu',
        registerNumber: '710021104001', // student1's registerNumber
        department: 'Information Technology',
        graduationYear: 2026,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/register number already exists/i);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'student1@college.edu',
        password: 'StudentPass@2026',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('student1@college.edu');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'student1@college.edu',
        password: 'WrongPassword@123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject access to protected endpoint without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject student from accessing admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ================= 2. PLACEMENT ELIGIBILITY ENFORCEMENT =================
  describe('Placement Offer Eligibility Verification Rule', () => {
    it('should allow student with verified SELECTED offer to submit an interview experience', async () => {
      const res = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          companyId: googleCompany._id,
          placementDriveId: googleDrive._id,
          jobRole: 'Software Engineer',
          interviewDate: '2025-08-16',
          interviewMode: 'virtual',
          selectionOutcome: 'Selected',
          difficulty: 'Hard',
          rounds: [
            {
              roundNumber: 1,
              roundName: 'Coding Assessment',
              roundType: 'Online Assessment',
              description: 'Solved 2 algorithmic problems on graphs and trees.',
              questionsAsked: ['Topological sort variation'],
              topicsCovered: ['Graphs'],
            },
          ],
          preparationStrategy: 'Comprehensive preparation using LeetCode and System Design notes.',
          resourcesRecommended: 'Striver SDE Sheet, NeetCode 150',
          advice: 'Practice edge case handling thoroughly.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Pending Review'); // Must enter moderation queue
    });

    it('should allow student to submit an interview experience for any company for admin moderation', async () => {
      // Student 4 submits an experience for Google
      const res = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${student4Token}`)
        .send({
          companyId: googleCompany._id,
          jobRole: 'Software Engineer',
          interviewDate: '2025-08-16',
          interviewMode: 'virtual',
          selectionOutcome: 'Selected',
          difficulty: 'Hard',
          rounds: [
            {
              roundNumber: 1,
              roundName: 'Online Round',
              roundType: 'Online Assessment',
              description: 'Technical round attempt with 2 problems.',
              questionsAsked: ['Tree traversal'],
              topicsCovered: ['Trees'],
            },
          ],
          preparationStrategy: 'Comprehensive preparation using DSA and system design.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Pending Review');
    });

    it('should allow student to submit experience for Microsoft without drive specified', async () => {
      const res = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          companyId: msftCompany._id,
          jobRole: 'Software Development Engineer',
          interviewDate: '2025-08-20',
          interviewMode: 'virtual',
          rounds: [
            {
              roundNumber: 1,
              roundName: 'Technical Coding',
              roundType: 'Technical Round',
              description: 'Coding and algorithm problem solving.',
            },
          ],
          preparationStrategy: 'Practiced coding questions and system architecture concepts.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Pending Review');
    });

    it('should allow admin to toggle student placement verification badge', async () => {
      const student = await User.findOne({ email: 'student4@college.edu' });
      const initialStatus = student.isPlacementVerified;

      const res = await request(app)
        .put(`/api/admin/students/${student._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPlacementVerified).toBe(!initialStatus);
    });
  });

  // ================= 3. MODERATION WORKFLOW =================
  describe('Experience Moderation Workflow', () => {
    let pendingExpId;

    it('should ensure pending experiences are NOT visible in public approved listings', async () => {
      const pendingExp = await InterviewExperience.findOne({ status: 'Pending Review' });
      expect(pendingExp).toBeDefined();
      pendingExpId = pendingExp._id;

      const res = await request(app).get('/api/experiences');
      expect(res.status).toBe(200);

      const returnedIds = res.body.data.map((item) => item._id.toString());
      expect(returnedIds).not.toContain(pendingExpId.toString());
    });

    it('should allow admin to approve a pending experience', async () => {
      const res = await request(app)
        .put(`/api/admin/experiences/${pendingExpId}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Approved',
          moderationFeedback: 'Verified authentic by placement directorate.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Approved');
    });

    it('should now include the newly approved experience in public listings', async () => {
      const res = await request(app).get('/api/experiences');
      expect(res.status).toBe(200);

      const returnedIds = res.body.data.map((item) => item._id.toString());
      expect(returnedIds).toContain(pendingExpId.toString());
    });
  });

  // ================= 4. QUESTION BANK & FEATURES =================
  describe('Question Bank, Bookmarks, and Readiness Score', () => {
    it('should return published questions with pagination and category filter', async () => {
      const res = await request(app).get('/api/questions?category=Data Structures');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support Smart Practice session creation', async () => {
      const res = await request(app)
        .post('/api/questions/smart-practice')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          count: 5,
          timeLimitMinutes: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.questions.length).toBeGreaterThan(0);
    });

    it('should calculate Placement Readiness Score', async () => {
      const res = await request(app)
        .get('/api/progress/readiness-score')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('readinessScore');
      expect(res.body.data.readinessScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.readinessScore).toBeLessThanOrEqual(100);
      expect(res.body.data).toHaveProperty('breakdown');
    });
  });
});
