import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap,
  Bell,
  ChevronDown
} from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import UnicordobaLogo from './UnicordobaLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push(
      { name: 'Cursos', path: '/admin/courses', icon: BookOpen },
      { name: 'Usuarios', path: '/admin/users', icon: Users }
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-unicordoba-dark/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <UnicordobaLogo size={36} color="white" />
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <h1 className="text-lg font-display font-bold hidden sm:block tracking-tight text-white group-hover:text-unicordoba-primary transition-colors">
            Portal <span className="text-unicordoba-primary">Académico</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive(link.path)
                  ? 'bg-unicordoba-primary text-white shadow-lg shadow-unicordoba-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-white uppercase tracking-wider">{user?.full_name}</span>
            <span className="text-[9px] text-unicordoba-primary font-bold uppercase tracking-[0.2em]">{user?.role === 'COURSE_ADMIN' ? 'DOCENTE' : user?.role}</span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-1 sm:gap-3">
            <button 
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
              title="Notificaciones"
            >
              <Bell size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-1"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-unicordoba-dark border-b border-white/10 p-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  isActive(link.path)
                    ? 'bg-unicordoba-primary text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon size={20} />
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase">{user?.full_name}</span>
                <span className="text-[10px] text-unicordoba-primary font-bold uppercase tracking-widest">{user?.role === 'COURSE_ADMIN' ? 'DOCENTE' : user?.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500/80 text-xs font-bold uppercase"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
