import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExamList from './components/ExamList';
import CourseManagement from './components/CourseManagement';
import UserManagement from './components/UserManagement';
import CourseStudentManagement from './components/CourseStudentManagement';
import TeacherExamManagement from './components/TeacherExamManagement';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ExamResolver from './components/ExamResolver';

function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <Navbar />}
        <main className={`flex-grow ${isAuthenticated ? 'pt-16 sm:pt-20' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password/:token" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/exams" 
              element={
                <ProtectedRoute>
                  <ExamList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam/:examId/resolve" 
              element={
                <ProtectedRoute>
                  <ExamResolver />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute>
                  <CourseManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/course/:courseId/students" 
              element={
                <ProtectedRoute>
                  <CourseStudentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/course/:courseId/exams" 
              element={
                <ProtectedRoute>
                  <TeacherExamManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exams" 
              element={
                <ProtectedRoute>
                  <TeacherExamManagement />
                </ProtectedRoute>
              } 
            />
            {/* Redireccionar cualquier otra ruta al dashboard o login */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
