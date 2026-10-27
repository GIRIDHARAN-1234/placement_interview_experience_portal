import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { Home } from '../pages/public/Home';
import { CompanyDirectory } from '../pages/public/CompanyDirectory';
import { CompanyDetail } from '../pages/public/CompanyDetail';
import { ExperienceList } from '../pages/public/ExperienceList';
import { ExperienceDetail } from '../pages/public/ExperienceDetail';
import { QuestionBank } from '../pages/public/QuestionBank';
import { QuestionDetail } from '../pages/public/QuestionDetail';
import { ResourceList } from '../pages/public/ResourceList';
import { NotFound } from '../pages/public/NotFound';
import { Unauthorized } from '../pages/public/Unauthorized';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Profile } from '../pages/auth/Profile';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { SubmitExperience } from '../pages/student/SubmitExperience';
import { MyExperiences } from '../pages/student/MyExperiences';
import { SmartPractice } from '../pages/student/SmartPractice';
import { Bookmarks } from '../pages/student/Bookmarks';
import { Roadmap } from '../pages/student/Roadmap';
import { StudyTasks } from '../pages/student/StudyTasks';
import { PreparationAnalytics } from '../pages/student/PreparationAnalytics';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { StudentManagement } from '../pages/admin/StudentManagement';
import { CompanyManagement } from '../pages/admin/CompanyManagement';
import { DriveManagement } from '../pages/admin/DriveManagement';
import { OfferManagement } from '../pages/admin/OfferManagement';
import { ExperienceModeration } from '../pages/admin/ExperienceModeration';
import { QuestionManagement } from '../pages/admin/QuestionManagement';
import { ResourceManagement } from '../pages/admin/ResourceManagement';
import { AuditLogViewer } from '../pages/admin/AuditLogViewer';

// Dynamic Dashboard redirect based on role
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <StudentDashboard />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<CompanyDirectory />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/experiences" element={<ExperienceList />} />
        <Route path="/experiences/:id" element={<ExperienceDetail />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/resources" element={<ResourceList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Authenticated Student & Shared Portal Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardDispatcher />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/practice" element={<SmartPractice />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/tasks" element={<StudyTasks />} />
        <Route path="/analytics" element={<PreparationAnalytics />} />
        <Route path="/submit-experience" element={<SubmitExperience />} />
        <Route path="/my-experiences" element={<MyExperiences />} />
      </Route>

      {/* Authenticated Administrator Console Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/companies" element={<CompanyManagement />} />
        <Route path="/admin/placement-drives" element={<DriveManagement />} />
        <Route path="/admin/placement-offers" element={<OfferManagement />} />
        <Route path="/admin/experiences" element={<ExperienceModeration />} />
        <Route path="/admin/questions" element={<QuestionManagement />} />
        <Route path="/admin/resources" element={<ResourceManagement />} />
        <Route path="/admin/audit-logs" element={<AuditLogViewer />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
