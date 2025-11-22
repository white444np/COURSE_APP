import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseList from './pages/admin/CourseList';
import CourseForm from './pages/admin/CourseForm';
import Billing from './pages/Billing';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import Button from './components/Button';
import FullScreenLoader from './components/FullScreenLoader';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';

function Navigation(){
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const navLinks = useMemo(() => ([
    { to: '/', label: 'Home', show: true },
    { to: '/signup', label: 'Signup', show: !user },
    { to: '/login', label: 'Login', show: !user },
    { to: '/dashboard', label: 'Dashboard', show: true },
    { to: '/admin/dashboard', label: 'Admin Panel', show: user?.role === 'admin' },
  ]), [user]);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate('/login');
  };

  const handleNavClick = () => setExpanded(false);

  const isActive = (to) => {
    if (to === '/') {
      return pathname === '/';
    }
    if (to === '/signup') {
      return pathname === '/signup';
    }
    return pathname.startsWith(to);
  };

  return (
    <nav className="navbar navbar-expand-lg nav">
      <div className="container">
        <Link to="/" className="navbar-brand brand" onClick={handleNavClick}>MiniCourse</Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-navbar"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="main-navbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {navLinks.filter(link => link.show).map((link) => (
              <li key={link.to} className="nav-item">
                <Link
                  to={link.to}
                  className={`nav-link nav__link ${isActive(link.to) ? 'is-active active' : ''}`}
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && (
              <li className="nav-item d-flex align-items-center gap-2 ms-lg-3">
                <span className="chip" title={user.email}>{user.name}</span>
                <Button
                  variant="ghost"
                  className="btn-sm"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function AppShell() {
  const { loading } = useAuth();

  return (
    <>
      {loading && <FullScreenLoader message="Restoring your session…" />}
      <Navigation />
      <main className="container page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/billing" element={<Billing />} />
          <Route
            path="/admin/dashboard"
            element={(
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/courses"
            element={(
              <AdminRoute>
                <CourseList />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/courses/new"
            element={(
              <AdminRoute>
                <CourseForm />
              </AdminRoute>
            )}
          />
          <Route
            path="/admin/courses/:courseId/edit"
            element={(
              <AdminRoute>
                <CourseForm />
              </AdminRoute>
            )}
          />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <small>© {new Date().getFullYear()} MiniCourse</small>
        </div>
      </footer>
    </>
  );
}

export default function App(){
  return (
    <ToastProvider>
      <AuthProvider>
        <EnrollmentProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </EnrollmentProvider>
      </AuthProvider>
      <ToastContainer position="top-right" newestOnTop theme="dark" closeOnClick pauseOnHover={false} />
    </ToastProvider>
  );
}
