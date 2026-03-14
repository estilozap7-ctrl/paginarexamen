import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, Edit, Trash2, Search, BookOpen, User, 
  Calendar, Layers, MoreVertical, X, Check,
  AlertCircle, Loader2
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CourseManagement() {
  const { user, token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject_code: '',
    semester_type: '1', // '1' or '2'
    year: new Date().getFullYear().toString(),
    course_admin_id: ''
  });

  useEffect(() => {
    fetchSemesters();
    fetchInstructors();
    fetchCourses();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/semesters`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      if (response.data) {
        setSemesters(response.data);
      }
    } catch (err) {
      console.error("Error al cargar semestres:", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/instructors`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      setInstructors(response.data);
    } catch (err) {
      console.error("Error al cargar instructores", err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/courses`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los cursos. Verifica tus privilegios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      // Intentar extraer semestre y año del código o nombre del semestre
      const semName = course.Semester?.code || "";
      const [yearPart, semPart] = semName.split('-');
      
      setEditingCourse(course);
      setFormData({
        name: course.name,
        subject_code: course.subject_code,
        semester_type: semPart || '1',
        year: yearPart || new Date().getFullYear().toString(),
        course_admin_id: course.course_admin_id
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        subject_code: '',
        semester_type: '1',
        year: new Date().getFullYear().toString(),
        course_admin_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar año pertinente (ej: entre 2020 y 2100)
    const yearNum = parseInt(formData.year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      alert("Por favor ingresa un año válido (ej: 2026)");
      return;
    }

    try {
      const headers = { 
        'x-user-id': user.id,
        'x-user-role': user.role
      };

      // Enviar semestre y año al backend para que el servidor lo asocie o cree
      const payload = {
        ...formData,
        semester_code: `${formData.year}-${formData.semester_type}`
      };

      if (editingCourse) {
        await axios.put(`${API_URL}/admin/courses/${editingCourse.id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/admin/courses`, payload, { headers });
      }
      setIsModalOpen(false);
      fetchCourses();
      fetchSemesters();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al guardar el curso';
      alert(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`${API_URL}/admin/courses/${id}`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      fetchCourses();
    } catch (err) {
      alert('Error al eliminar el curso');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subject_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-unicordoba-dark flex items-center justify-center p-6">
        <div className="glass p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-white/60">No tienes permisos de Super Administrador para ver esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white p-6 md:p-10 pt-12 md:pt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
              Gestión de <span className="text-unicordoba-primary">Cursos</span>
            </h1>
            <p className="text-white/40 text-sm">Administración central de la oferta académica institucional.</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-unicordoba-primary hover:bg-unicordoba-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-unicordoba-primary/20"
          >
            <Plus size={20} />
            NUEVO CURSO
          </button>
        </div>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-unicordoba-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o código de asignatura..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="glass p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Total Cursos</p>
              <p className="text-2xl font-black">{courses.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        {/* Table/Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-unicordoba-primary animate-spin mb-4" />
            <p className="text-white/40 animate-pulse">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="glass p-6 group hover:border-unicordoba-primary/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-unicordoba-primary/10 text-unicordoba-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {course.subject_code}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(course)}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-4 line-clamp-1">{course.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <User size={16} className="text-unicordoba-primary" />
                    <span>{course.Admin?.full_name || 'Sin asignar'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Calendar size={16} className="text-unicordoba-primary" />
                    <span>Semestre: {course.Semester?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                   <span className="text-[10px] text-white/20 font-mono tracking-tighter">{course.id}</span>
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-unicordoba-dark flex items-center justify-center text-[8px] font-bold">A</div>
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-unicordoba-dark flex items-center justify-center text-[8px] font-bold">U</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-unicordoba-dark/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative glass w-full max-w-lg overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingCourse ? 'Editar' : 'Nuevo'} <span className="text-unicordoba-primary">Curso</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Nombre de la Asignatura</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Código</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: 215064"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all font-mono"
                      value={formData.subject_code}
                      onChange={(e) => setFormData({...formData, subject_code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                      <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Semestre</label>
                      <select 
                        required
                        className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all cursor-pointer text-white appearance-none"
                        value={formData.semester_type}
                        onChange={(e) => setFormData({...formData, semester_type: e.target.value})}
                      >
                        <option value="1">I</option>
                        <option value="2">II</option>
                      </select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Año</label>
                      <input 
                        type="number" 
                        required
                        min="2020"
                        max="2100"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Administrador del Curso (Docente)</label>
                  <select 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-unicordoba-primary transition-all appearance-none cursor-pointer"
                    value={formData.course_admin_id}
                    onChange={(e) => setFormData({...formData, course_admin_id: e.target.value})}
                  >
                    <option value="" disabled className="bg-unicordoba-dark">Selecciona un docente</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id} className="bg-unicordoba-dark">
                        {inst.full_name} ({inst.email})
                      </option>
                    ))}
                  </select>
                  {instructors.length === 0 && (
                    <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold italic">No se encontraron docentes disponibles.</p>
                  )}
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-unicordoba-primary hover:bg-unicordoba-primary-dark rounded-xl font-bold transition-all shadow-lg shadow-unicordoba-primary/20"
                  >
                    {editingCourse ? 'GUARDAR CAMBIOS' : 'CREAR CURSO'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
