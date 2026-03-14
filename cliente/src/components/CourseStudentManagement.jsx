import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, UserPlus, Trash2, Search, ChevronLeft, 
  Loader2, Check, X, AlertCircle, Info, MoreVertical
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CourseStudentManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [course, setCourse] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-user-id': user.id, 'x-user-role': user.role };
      
      const [enrolledRes, allRes, coursesRes] = await Promise.all([
        axios.get(`${API_URL}/teacher/courses/${courseId}/students`, { headers }),
        axios.get(`${API_URL}/admin/students`, { headers }),
        axios.get(`${API_URL}/teacher/courses`, { headers }) // To get current course details
      ]);

      setEnrolledStudents(enrolledRes.data);
      setAllStudents(allRes.data);
      setCourse(coursesRes.data.find(c => c.id === courseId));
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (studentId = null) => {
    try {
      const headers = { 'x-user-id': user.id, 'x-user-role': user.role };
      const ids = studentId ? [studentId] : selectedStudentIds;
      
      if (ids.length === 0) return;

      await axios.post(`${API_URL}/teacher/courses/${courseId}/students`, 
        { student_ids: ids }, 
        { headers }
      );
      
      fetchData();
      setIsAssignModalOpen(false);
      setSelectedStudentIds([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error al asignar estudiantes");
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const selectAllAvailable = () => {
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map(s => s.id));
    }
  };

  const handleUnassign = async (studentId) => {
    if (!confirm("¿Seguro que deseas retirar a este estudiante del curso?")) return;
    try {
      const headers = { 'x-user-id': user.id, 'x-user-role': user.role };
      await axios.delete(`${API_URL}/teacher/courses/${courseId}/students/${studentId}`, { headers });
      fetchData();
    } catch (err) {
      alert("Error al retirar estudiante");
    }
  };

  const filteredEnrolled = enrolledStudents.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cc.includes(searchTerm)
  );

  const availableStudents = allStudents.filter(s => 
    !enrolledStudents.some(es => es.id === s.id) &&
    (s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || s.cc.includes(studentSearch))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-unicordoba-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-unicordoba-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white p-6 md:p-10 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-unicordoba-primary mb-1">
                <Users size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gestión de Grupo</span>
              </div>
              <h1 className="text-3xl font-display font-black tracking-tight">
                {course?.name} <span className="text-white/20 text-xl font-mono ml-2">[{course?.subject_code}]</span>
              </h1>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 bg-unicordoba-primary hover:bg-unicordoba-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-unicordoba-primary/20"
          >
            <UserPlus size={20} />
            ASIGNAR ESTUDIANTE
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass p-5 border-l-4 border-l-unicordoba-primary">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Total Estudiantes</p>
                <p className="text-3xl font-black">{enrolledStudents.length}</p>
            </div>
            {/* placeholders for future stats */}
            <div className="glass p-5">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Promedio General</p>
                <p className="text-3xl font-black">--</p>
            </div>
            <div className="glass p-5">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Entregas Pendientes</p>
                <p className="text-3xl font-black">0</p>
            </div>
            <div className="glass p-5">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Estado Curso</p>
                <p className="text-sm font-bold text-green-400 uppercase tracking-tighter flex items-center gap-1 mt-2">
                    <Check size={14} /> Activo
                </p>
            </div>
        </div>

        {/* Search and List */}
        <div className="glass overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-grow max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Buscar alumno por nombre o CC..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-unicordoba-primary transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <p className="text-xs text-white/30 font-medium">Mostrando {filteredEnrolled.length} alumnos matriculados</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Identificación</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Progreso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnrolled.length > 0 ? (
                  filteredEnrolled.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary text-xs font-bold border border-unicordoba-primary/10">
                            {student.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white/40">{student.cc}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{student.email}</td>
                      <td className="px-6 py-4">
                         <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-unicordoba-primary w-0"></div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleUnassign(student.id)}
                           className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                           title="Retirar alumno"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center opacity-30">
                          <Users size={48} className="mb-4" />
                          <p className="text-sm font-medium">No hay estudiantes inscritos en este curso.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-unicordoba-dark/80 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}></div>
          <div className="relative glass w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden animate-slide-up">
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Asignar <span className="text-unicordoba-primary">Estudiantes</span></h2>
                  <p className="text-xs text-white/40 mt-1">Selecciona uno o varios alumnos para matricular</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
             </div>
             
             <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Escribe nombre o CC..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-unicordoba-primary transition-all"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {availableStudents.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={selectAllAvailable}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedStudentIds.length === availableStudents.length && availableStudents.length > 0
                          ? 'bg-unicordoba-primary border-unicordoba-primary' 
                          : 'border-white/20 group-hover:border-white/40'
                        }`}
                      >
                        {selectedStudentIds.length === availableStudents.length && availableStudents.length > 0 && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold text-white/60">Seleccionar Todos ({availableStudents.length})</span>
                    </label>
                    <span className="text-[10px] uppercase font-bold text-unicordoba-primary tracking-widest">
                      {selectedStudentIds.length} seleccionados
                    </span>
                  </div>
                )}
             </div>

             <div className="flex-grow overflow-y-auto p-2">
                {availableStudents.length > 0 ? (
                  <div className="space-y-1">
                    {availableStudents.map(student => (
                      <div 
                        key={student.id} 
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer group ${
                          selectedStudentIds.includes(student.id) 
                          ? 'bg-unicordoba-primary/10 border border-unicordoba-primary/20' 
                          : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedStudentIds.includes(student.id)
                            ? 'bg-unicordoba-primary border-unicordoba-primary' 
                            : 'border-white/10 group-hover:border-white/20'
                          }`}>
                            {selectedStudentIds.includes(student.id) && <Check size={14} className="text-white" />}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-bold border border-white/10">
                            {student.full_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{student.full_name}</p>
                            <p className="text-xs text-white/40">CC: {student.cc} · {student.email}</p>
                          </div>
                        </div>
                        <Check size={16} className={`text-unicordoba-primary transition-opacity ${selectedStudentIds.includes(student.id) ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center opacity-40">
                    <Info size={32} className="mx-auto mb-3" />
                    <p className="text-sm">No se encontraron estudiantes disponibles.</p>
                  </div>
                )}
             </div>

             <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4">
                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all text-xs"
                >
                  CANCELAR
                </button>
                <button 
                  disabled={selectedStudentIds.length === 0}
                  onClick={() => handleAssign()}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg text-xs ${
                    selectedStudentIds.length > 0
                    ? 'bg-unicordoba-primary hover:bg-unicordoba-primary-dark text-white shadow-unicordoba-primary/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none'
                  }`}
                >
                  MATRICULAR {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
