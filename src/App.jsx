import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Box } from '@mui/material';
import PageLoader from './components/Common/PageLoader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useSettings } from './context/SettingsContext';

// Lazy load Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const UserList = lazy(() => import('./pages/Users/UserList'));
const CourseList = lazy(() => import('./pages/Courses/CourseList'));
const CategoryList = lazy(() => import('./pages/Courses/CategoryList'));
const LiveClassList = lazy(() => import('./pages/LiveClasses/LiveClassList'));
const AssignmentList = lazy(() => import('./pages/Assignments/AssignmentList'));
const PaymentDashboard = lazy(() => import('./pages/Payments/PaymentDashboard'));
const NotificationCenter = lazy(() => import('./pages/Notifications/NotificationCenter'));
const ReportsDashboard = lazy(() => import('./pages/Reports/ReportsDashboard'));
const ExamList = lazy(() => import('./pages/Exams/ExamList'));
const ExamResults = lazy(() => import('./pages/Exams/ExamResults'));
const QuestionBank = lazy(() => import('./pages/Exams/QuestionBank'));
const BulkQuestionEdit = lazy(() => import('./pages/Exams/BulkQuestionEdit'));
const CouponList = lazy(() => import('./pages/Coupons/CouponList'));
const MediaLibrary = lazy(() => import('./pages/Media/MediaLibrary'));
const ChatCenter = lazy(() => import('./pages/Chat/ChatCenter'));
const SettingsLayout = lazy(() => import('./pages/Settings/SettingsLayout'));
const MainLayout = lazy(() => import('./components/Layout/MainLayout'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const BlogList = lazy(() => import('./pages/Blogs/BlogList'));
const BannerManagement = lazy(() => import('./pages/Banners/BannerManagement'));
const AppReviewManagement = lazy(() => import('./pages/AppReviews/AppReviewManagement'));
const NewsTickerManagement = lazy(() => import('./pages/Banners/NewsTickerManagement'));
const FreeMaterialList = lazy(() => import('./pages/FreeMaterials/FreeMaterialList'));


function App() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const googleClientId = settings?.integrations?.googleClientId;
  const recaptchaKey = settings?.integrations?.recaptchaKey;

  const renderApp = () => (
    <>
      {/* ... previous content ... */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
          />
          <Route
            path="/verify-email"
            element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyEmail />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Admin & Teacher Routes */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserList />
                </ProtectedRoute>
              }
            />

            <Route
              path="courses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <CourseList />
                </ProtectedRoute>
              }
            />

            <Route
              path="live-classes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <LiveClassList />
                </ProtectedRoute>
              }
            />

            <Route
              path="assignments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AssignmentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PaymentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="notifications"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <NotificationCenter />
                </ProtectedRoute>
              }
            />

            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="exam-management"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <ExamList />
                </ProtectedRoute>
              }
            />

            <Route
              path="exam-results"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <ExamResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="question-bank"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <QuestionBank />
                </ProtectedRoute>
              }
            />

            <Route
              path="categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryList />
                </ProtectedRoute>
              }
            />

            <Route
              path="coupons"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <CouponList />
                </ProtectedRoute>
              }
            />
            <Route
              path="media-library"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <MediaLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="chat"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                  <ChatCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="blogs"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <BlogList />
                </ProtectedRoute>
              }
            />
            <Route
              path="banners"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BannerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="news-ticker"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <NewsTickerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="app-reviews"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppReviewManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="free-materials"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <FreeMaterialList />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="question-bank/bulk-edit/:editId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <BulkQuestionEdit />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );

  let content = renderApp();

  // Wrap with reCAPTCHA ONLY if a real key is configured
  if (recaptchaKey) {
    content = (
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
        {content}
      </GoogleReCaptchaProvider>
    );
  }

  // Wrap with Google OAuth ONLY if a real client ID is configured
  if (googleClientId) {
    content = (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}

export default App;
