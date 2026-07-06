import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from './components/ui/Toast';
import { FullPageSpinner } from './components/ui/Spinner';
import { ProtectedRoute, PublicOnlyRoute, HomeRoute } from './components/shared/ProtectedRoute';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import './components/charts/ChartSetup';

const Landing = lazy(() => import('./pages/public/Landing'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const SubmitFeedback = lazy(() => import('./pages/citizen/SubmitFeedback'));
const TrackFeedback = lazy(() => import('./pages/citizen/TrackFeedback'));
const FeedbackDetail = lazy(() => import('./pages/citizen/FeedbackDetail'));
const Profile = lazy(() => import('./pages/citizen/Profile'));
const Notifications = lazy(() => import('./pages/citizen/Notifications'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageFeedback = lazy(() => import('./pages/admin/ManageFeedback'));
const FeedbackSummary = lazy(() => import('./pages/admin/FeedbackSummary'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageDepartments = lazy(() => import('./pages/admin/ManageDepartments'));
const DepartmentAnalytics = lazy(() => import('./pages/admin/DepartmentAnalytics'));

function App() {
  return (
    <>
      <Suspense fallback={<FullPageSpinner />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public site */}
            <Route element={<HomeRoute />}>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>
            </Route>

            {/* Public-only auth routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Citizen protected routes */}
            <Route element={<ProtectedRoute roles={['citizen']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/submit-feedback" element={<SubmitFeedback />} />
                <Route path="/track" element={<TrackFeedback />} />
                <Route path="/feedback/:id" element={<FeedbackDetail />} />
              </Route>
            </Route>

            {/* Admin / moderator / department head routes */}
            <Route element={<ProtectedRoute roles={['admin', 'moderator', 'department_head']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/feedback" element={<ManageFeedback />} />
                <Route path="/admin/feedback/:id" element={<FeedbackSummary />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/departments" element={<ManageDepartments />} />
                <Route path="/admin/departments/:id" element={<DepartmentAnalytics />} />
              </Route>
            </Route>

            {/* Shared authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
