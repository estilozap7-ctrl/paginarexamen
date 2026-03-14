import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, User, Calendar, ChevronRight, GraduationCap, Clock, Settings, ShieldCheck, Users, Edit3, X, Save } from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import UnicordobaLogo from './UnicordobaLogo';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for course editing modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseDescInput, setCourseDescInput] = useState('');

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const roleName = user.role ? String(user.role).toUpperCase() : '';
      let endpoint = '';
      
      if (roleName === 'COURSE_ADMIN') {
        endpoint = `${API_URL}/teacher/courses`;
      } else if (roleName === 'STUDENT') {
        endpoint = `${API_URL}/student/courses`;
      } else if (roleName === 'ADMIN') {
        setCourses([]);
        setLoading(false);
        return;
      } else {
        setCourses([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(endpoint, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role 
        }
      });
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleOpenEdit = (course) => {
    setCourseToEdit(course);
    setCourseDescInput(course.description || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateDesc = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/teacher/courses/${courseToEdit.id}`, 
      { description: courseDescInput }, 
      {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      // Update local state
      setCourses(courses.map(c => c.id === courseToEdit.id ? { ...c, description: courseDescInput } : c));
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Error actualizando la descripción del curso");
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-unicordoba-dark flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-unicordoba-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white font-sans selection:bg-unicordoba-primary/30">
      <main className="max-w-7xl mx-auto pt-12 pb-20 px-6">
        {/* Header Section */}
        <section className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-unicordoba-primary mb-3">
                <GraduationCap size={20} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Bienvenido de nuevo</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
                Tus <span className="text-gradient-green">Asignaturas</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm">
              <Calendar className="text-unicordoba-primary" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Periodo Actual</span>
                <span className="text-sm font-bold">Semestre {new Date().getFullYear()}-{new Date().getMonth() < 6 ? '1' : '2'}</span>
              </div>
            </div>
          </div>
          <div className="h-1 w-24 bg-unicordoba-primary rounded-full mt-8 opacity-50"></div>
        </section>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map((course, index) => {
              const hasActiveExams = course.Exams?.some(exam => {
                if (!exam.is_published) return false;
                const examStart = new Date(exam.activity_date);
                const examEnd = new Date(examStart.getTime() + (exam.duration_minutes || 60) * 60000);
                const now = new Date();
                return now >= examStart && now <= examEnd;
              });

              return (
              <div 
                key={course.id} 
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-unicordoba-primary/50 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                
                <div className="relative card h-full flex flex-col justify-between overflow-hidden">
                  {/* Pattern Decoration */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity z-0">
                    <BookOpen size={80} strokeWidth={1} />
                  </div>

                  {/* Active Exams Indicator */}
                  {hasActiveExams && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10 flex items-center gap-1.5 border border-red-400">
                      <Clock size={12} /> EXAMEN EN CURSO
                    </div>
                  )}

                  <div className="z-10 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary border border-unicordoba-primary/20 group-hover:bg-unicordoba-primary group-hover:text-white transition-all duration-300">
                        <BookOpen size={24} />
                      </div>
                      <span className="badge-green">{course.subject_code || course.code}</span>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-unicordoba-primary transition-colors">
                      {course.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-unicordoba-primary/60 text-[10px] uppercase font-bold tracking-widest mb-4">
                      <User size={12} strokeWidth={3} />
                      <span>Prof: {course.instructor || user.full_name}</span>
                    </div>

                    <div className="relative group/desc mb-6">
                      <p className="text-white/40 text-sm line-clamp-2 pr-6">
                         {course.description || "Desarrollo de competencias lógicas y pensamiento analítico aplicado a problemas reales."}
                      </p>
                      {user.role === 'COURSE_ADMIN' && (
                        <button 
                          onClick={() => handleOpenEdit(course)}
                          className="absolute right-0 top-0 opacity-0 group-hover/desc:opacity-100 transition-opacity text-unicordoba-primary hover:text-white"
                          title="Personalizar descripción"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar Section - Only for students */}
                    {user.role === 'STUDENT' && (
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                              <span>Progreso Académico</span>
                              <span>{course.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                  className="h-full bg-gradient-to-r from-unicordoba-primary to-green-300 transition-all duration-1000 ease-out"
                                  style={{ width: `${course.progress || 0}%` }}
                              ></div>
                          </div>
                      </div>
                    )}

                    {/* Teacher specific stats */}
                    {user.role === 'COURSE_ADMIN' && (
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Estudiantes</span>
                          <span className="text-lg font-bold">--</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Exámenes</span>
                          <span className="text-lg font-bold">--</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                          <Calendar size={14} className="text-unicordoba-primary/50 shrink-0" />
                          <span className="truncate">{course.Semester?.name || course.semester || `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}`}</span>
                        </div>
                      {user.role === 'STUDENT' ? (
                        <button 
                          onClick={() => navigate(`/course/${course.id}/exams`)}
                          className="flex items-center gap-1.5 text-xs font-bold text-unicordoba-primary hover:text-white transition-all group/btn uppercase tracking-wider shrink-0"
                        >
                          Ver Exámenes <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="flex gap-3 shrink-0">
                          <button 
                            onClick={() => navigate(`/teacher/course/${course.id}/exams`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-unicordoba-primary hover:text-white transition-all group/btn uppercase tracking-wider"
                          >
                            Exámenes <BookOpen size={14} className="ml-1" />
                          </button>
                          <button 
                            onClick={() => navigate(`/teacher/course/${course.id}/students`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-unicordoba-primary hover:text-white transition-all group/btn uppercase tracking-wider border-l border-white/20 pl-3"
                          >
                            Alumnos <Users size={14} className="ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})
          ) : (
            <div className="col-span-full py-20 glass flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6 border border-white/10">
                <BookOpen size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No tienes asignaturas matriculadas</h3>
              <p className="text-white/40 max-w-sm">Si crees que esto es un error, por favor ponte en contacto con tu coordinador de programa.</p>
              <button className="mt-8 btn-outline">Solicitar Soporte</button>
            </div>
          )}
        </div>

        {/* Action Quick Bar */}
        <section className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
           <div className="glass p-5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <User size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">Mi Perfil</span>
           </div>
            {user.role === 'ADMIN' && (
              <>
                <div 
                  onClick={() => navigate('/admin/courses')}
                  className="glass p-5 flex items-center gap-4 hover:bg-unicordoba-primary/10 border-unicordoba-primary/20 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary border border-unicordoba-primary/20 group-hover:bg-unicordoba-primary group-hover:text-white transition-all">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-unicordoba-primary">Gestión Cursos</span>
                </div>
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="glass p-5 flex items-center gap-4 hover:bg-blue-500/10 border-blue-500/20 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Users size={18} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-400">Gestión Usuarios</span>
                </div>
              </>
            )}
           <div className="glass p-5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary border border-unicordoba-primary/20 group-hover:bg-unicordoba-primary group-hover:text-white transition-all">
                <Calendar size={18} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">Calendario</span>
           </div>
        </section>
      </main>

      {/* Edit Course Description Modal */}
      {isEditModalOpen && courseToEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="glass w-full max-w-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-unicordoba-primary to-green-500"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Personalizar Curso</h2>
                  <p className="text-white/40 text-sm">Añade o modifica el mensaje descriptivo para {courseToEdit.name}</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateDesc} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Mensaje o Descripción</label>
                  <textarea 
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all text-white/90 resize-none leading-relaxed"
                    placeholder="Escribe aquí un mensaje de bienvenida o la descripción de tu curso..."
                    value={courseDescInput}
                    onChange={(e) => setCourseDescInput(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-sm bg-white/5 hover:bg-white/10 text-white transition-all text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-sm bg-unicordoba-primary hover:bg-green-600 text-white transition-all flex items-center justify-center gap-2"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
