import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/Common/PageLoader';

// Lazy load Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const UserList = lazy(() => import('./pages/Users/UserList'));
const CourseList = lazy(() => import('./pages/Courses/CourseList'));
const BatchList = lazy(() => import('./pages/Batches/BatchList'));
const CategoryList = lazy(() => import('./pages/Courses/CategoryList'));
const LiveClassList = lazy(() => import('./pages/LiveClasses/LiveClassList'));
const AssignmentList = lazy(() => import('./pages/Assignments/AssignmentList'));
const BatchSubmissions = lazy(() => import('./pages/Assignments/BatchSubmissions'));
const AllSubmissions = lazy(() => import('./pages/Assignments/AllSubmissions'));
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
const IndividualResult = lazy(() => import('./pages/Exams/IndividualResult'));
const FeeRecordsPage = lazy(() => import('./pages/Payments/FeeRecordsPage'));
const BookingManagement = lazy(() => import('./pages/Booking/BookingManagement'));
const PublicSeatBooking = lazy(() => import('./pages/Booking/PublicSeatBooking'));
const StudentProfileForm = lazy(() => import('./pages/Users/StudentProfileForm'));
const LeaveManagement = lazy(() => import('./pages/Dashboard/LeaveManagement'));
const AdminLeaveRequests = lazy(() => import('./pages/Users/AdminLeaveRequests'));
const BatchAttendance = lazy(() => import('./pages/Batches/BatchAttendance'));
const BatchStudents = lazy(() => import('./pages/Batches/BatchStudents'));
const EventManagement = lazy(() => import('./pages/Events/EventManagement'));
const PassedStudentManagement = lazy(() => import('./pages/Users/PassedStudentManagement'));
const PublicEvents = lazy(() => import('./pages/Public/EventsPage'));
const PublicSuccessStories = lazy(() => import('./pages/Public/PassedStudentsPage'));

const TimetableAdmin = lazy(() => import('./pages/Timetable/TimetableAdmin'));
const TimetableStudent = lazy(() => import('./pages/Timetable/TimetableStudent'));
const ReferralDashboard = lazy(() => import('./pages/Referrals/ReferralDashboard'));
const WithdrawalRequests = lazy(() => import('./pages/Referrals/WithdrawalRequests'));
const ReferralJoinRequests = lazy(() => import('./pages/Referrals/ReferralJoinRequests'));
const AdminReferralList = lazy(() => import('./pages/Referrals/AdminReferralList'));
const MyRewards = lazy(() => import('./pages/Referrals/MyRewards'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const SupportTickets = lazy(() => import('./pages/Tickets/SupportTickets'));
const ReferralRecordList = lazy(() => import('./pages/Referrals/ReferralRecordList'));
const ResumeBuilder = lazy(() => import('./pages/Resumes/ResumeBuilder'));
const TutorManagement = lazy(() => import('./pages/Tutors/TutorManagement'));
const TutorSupportLanding = lazy(() => import('./pages/TutorSupport/TutorSupportLanding'));
const TutorDashboard = lazy(() => import('./pages/TutorPanel/TutorDashboard'));
const SupportRequests = lazy(() => import('./pages/TutorPanel/SupportRequests'));
const SupportChat = lazy(() => import('./pages/TutorPanel/SupportChat'));
const TutorWithdrawals = lazy(() => import('./pages/TutorPanel/TutorWithdrawals'));
const AdminTutorWithdrawals = lazy(() => import('./pages/Tutors/AdminTutorWithdrawals'));
const SupportChatCenter = lazy(() => import('./pages/Tutors/SupportChatCenter'));

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/verify-email" element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyEmail />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path="/seat-booking" element={<PublicSeatBooking />} />
        <Route path="/all-events" element={<PublicEvents />} />
        <Route path="/success-stories" element={<PublicSuccessStories />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={user?.role === 'tutor' ? <Navigate to="/tutor/dashboard" replace /> : <Dashboard />} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UserList /></ProtectedRoute>} />
          <Route path="leave-requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeaveRequests /></ProtectedRoute>} />
          <Route path="batches" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BatchList /></ProtectedRoute>} />
          <Route path="batches/:batchId/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BatchAttendance /></ProtectedRoute>} />
          <Route path="batches/:batchId/students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BatchStudents /></ProtectedRoute>} />
          <Route path="courses" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><CourseList /></ProtectedRoute>} />
          <Route path="live-classes" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><LiveClassList /></ProtectedRoute>} />
          <Route path="assignments/submissions" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BatchSubmissions /></ProtectedRoute>} />
          <Route path="assignments/all" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AllSubmissions /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AssignmentList /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute allowedRoles={['admin']}><PaymentDashboard /></ProtectedRoute>} />
          <Route path="leaves" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>{user?.role === 'student' ? <LeaveManagement /> : <AdminLeaveRequests />}</ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><NotificationCenter /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsDashboard /></ProtectedRoute>} />
          <Route path="exam-management" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><ExamList /></ProtectedRoute>} />
          <Route path="exam-results/*" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><Routes><Route index element={<ExamResults />} /><Route path=":examId" element={<ExamResults />} /><Route path="details/:resultId" element={<IndividualResult />} /></Routes></ProtectedRoute>} />
          <Route path="question-bank" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><QuestionBank /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoryList /></ProtectedRoute>} />
          <Route path="coupons" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><CouponList /></ProtectedRoute>} />
          <Route path="media-library" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MediaLibrary /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsLayout /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><ChatCenter /></ProtectedRoute>} />
          <Route path="blogs" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BlogList /></ProtectedRoute>} />
          <Route path="events" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><EventManagement /></ProtectedRoute>} />
          <Route path="passed-students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><PassedStudentManagement /></ProtectedRoute>} />
          <Route path="banners" element={<ProtectedRoute allowedRoles={['admin']}><BannerManagement /></ProtectedRoute>} />
          <Route path="news-ticker" element={<ProtectedRoute allowedRoles={['admin']}><NewsTickerManagement /></ProtectedRoute>} />
          <Route path="app-reviews" element={<ProtectedRoute allowedRoles={['admin']}><AppReviewManagement /></ProtectedRoute>} />
          <Route path="free-materials" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><FreeMaterialList /></ProtectedRoute>} />
          <Route path="fee-records" element={<ProtectedRoute allowedRoles={['admin']}><FeeRecordsPage /></ProtectedRoute>} />
          <Route path="booking" element={<ProtectedRoute allowedRoles={['admin']}><BookingManagement /></ProtectedRoute>} />
          <Route path="timetable" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><TimetableAdmin /></ProtectedRoute>} />
          <Route path="referrals" element={<ProtectedRoute allowedRoles={['student']}><ReferralDashboard /></ProtectedRoute>} />
          <Route path="my-rewards" element={<ProtectedRoute allowedRoles={['student']}><MyRewards /></ProtectedRoute>} />
          <Route path="withdrawal-requests" element={<ProtectedRoute allowedRoles={['admin']}><WithdrawalRequests /></ProtectedRoute>} />
          <Route path="referral-joining-requests" element={<ProtectedRoute allowedRoles={['admin']}><ReferralJoinRequests /></ProtectedRoute>} />
          <Route path="referral-records" element={<ProtectedRoute allowedRoles={['admin']}><ReferralRecordList /></ProtectedRoute>} />
          <Route path="all-referrals" element={<ProtectedRoute allowedRoles={['admin']}><AdminReferralList /></ProtectedRoute>} />
          <Route path="leaderboard" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Leaderboard /></ProtectedRoute>} />
          <Route path="support-tickets" element={<ProtectedRoute allowedRoles={['admin', 'student']}><SupportTickets /></ProtectedRoute>}><Route path=":ticketId" element={<SupportTickets />} /></Route>
          <Route path="placements" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><ResumeBuilder /></ProtectedRoute>} />
          <Route path="tutors" element={<ProtectedRoute allowedRoles={['admin']}><TutorManagement /></ProtectedRoute>} />
          <Route path="tutor-withdrawals" element={<ProtectedRoute allowedRoles={['admin']}><AdminTutorWithdrawals /></ProtectedRoute>} />
          <Route path="tutor-chats" element={<ProtectedRoute allowedRoles={['admin']}><SupportChatCenter /></ProtectedRoute>} />
          <Route path="tutor-support" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><TutorSupportLanding /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfileForm /></ProtectedRoute>} />
          <Route path="my-routine" element={<ProtectedRoute allowedRoles={['student']}><TimetableStudent /></ProtectedRoute>} />
          
          {/* Tutor Panel Routes */}
          <Route path="tutor/dashboard" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><TutorDashboard /></ProtectedRoute>} />
          <Route path="tutor/requests" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><SupportRequests /></ProtectedRoute>} />
          <Route path="tutor/chat/:sessionId" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><SupportChat /></ProtectedRoute>} />
          <Route path="tutor/withdrawals" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><TutorWithdrawals /></ProtectedRoute>} />
        </Route>

        <Route path="question-bank/bulk-edit/:editId" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><BulkQuestionEdit /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
