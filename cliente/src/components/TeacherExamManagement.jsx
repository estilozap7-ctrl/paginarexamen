import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Edit2, Trash2, Save, FileText, Settings, X, CheckSquare, List, AlignLeft, Shuffle, Users, RotateCcw, Eye, CheckCircle2, AlertCircle, Award, Type } from 'lucide-react';
import axios from 'axios';
import SymbolPicker from './SymbolPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QUESTION_TYPES = [
  { id: 'SINGLE_CHOICE', label: 'Única Respuesta', icon: <List size={16} /> },
  { id: 'MULTIPLE_CHOICE', label: 'Selección Múltiple', icon: <CheckSquare size={16} /> },
  { id: 'TEXT_DEVELOPMENT', label: 'Desarrollo Textual', icon: <AlignLeft size={16} /> },
  { id: 'MATCHING', label: 'Relación (Emparejamiento)', icon: <Shuffle size={16} /> }
];

export default function TeacherExamManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states
  const [activeExam, setActiveExam] = useState(null); // If null, show list. If object, show questions/results
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'results'
  
  // Modals state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', description: '', activity_date: '', duration_minutes: 60 });
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qForm, setQForm] = useState({ id: null, body: '', type: 'SINGLE_CHOICE', points: 10, options: [] });

  // Students/Attempts state
  const [isAttemptsModalOpen, setIsAttemptsModalOpen] = useState(false);
  const [examStudents, setExamStudents] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Grading state
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [gradingData, setGradingData] = useState(null); // { attempt, exam, answers }
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [savingGradeId, setSavingGradeId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, [courseId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/teacher/courses/${courseId}/exams`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      if (examForm.id) {
        await axios.put(`${API_URL}/teacher/exams/${examForm.id}`, examForm, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        });
      } else {
        await axios.post(`${API_URL}/teacher/courses/${courseId}/exams`, examForm, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        });
      }
      setIsExamModalOpen(false);
      setExamForm({ id: null, title: '', description: '', activity_date: '', duration_minutes: 60 });
      fetchExams();
    } catch (err) {
      alert("Error guardando examen");
    }
  };

  const openExamModal = (exam = null) => {
    if (exam) {
      // Format date for input type="date" (YYYY-MM-DD)
      const date = exam.activity_date ? new Date(exam.activity_date).toISOString().split('T')[0] : '';
      setExamForm({ 
        id: exam.id, 
        title: exam.title, 
        description: exam.description, 
        activity_date: date, 
        duration_minutes: exam.duration_minutes 
      });
    } else {
      setExamForm({ id: null, title: '', description: '', activity_date: '', duration_minutes: 60 });
    }
    setIsExamModalOpen(true);
  };

  const fetchExamAttempts = async (exam) => {
    try {
      setLoadingAttempts(true);
      setActiveExam(exam);
      setIsAttemptsModalOpen(true);
      
      const [resStudents, resAttempts] = await Promise.all([
        axios.get(`${API_URL}/teacher/courses/${courseId}/students`, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        }),
        axios.get(`${API_URL}/teacher/exams/${exam.id}/attempts`, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        })
      ]);

      const attemptsMap = resAttempts.data.reduce((acc, att) => {
        // Priorizar el intento completado o el que tenga mayor nota si hay duplicados
        if (!acc[att.student_id] || 
            (att.status === 'COMPLETED' && acc[att.student_id].status !== 'COMPLETED') ||
            (att.final_score > acc[att.student_id].final_score)) {
          acc[att.student_id] = att;
        }
        return acc;
      }, {});
      
      setExamStudents(resStudents.data.map(student => ({
          ...student,
          attempt: attemptsMap[student.id] || null
      })));

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchAttemptReview = async (attemptId) => {
    try {
      setLoadingGrading(true);
      setIsGradingModalOpen(true);
      const res = await axios.get(`${API_URL}/teacher/attempts/${attemptId}/review`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      setGradingData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar el detalle del intento");
    } finally {
      setLoadingGrading(false);
    }
  };

  const handleUpdateGrade = async (answerId, points) => {
    try {
      setSavingGradeId(answerId);
      const res = await axios.put(`${API_URL}/teacher/attempts/${gradingData.attempt.id}/answers/${answerId}`, {
        points_earned: points
      }, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });

      // Update local state to reflect changes without full refresh
      const updatedAnswers = gradingData.answers.map(a => a.id === answerId ? res.data.answer : a);
      setGradingData({
        ...gradingData,
        answers: updatedAnswers,
        attempt: { ...gradingData.attempt, final_score: res.data.normalizedScore }
      });

      // Also update the students list in the background
      fetchExamAttempts(activeExam);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la calificación");
    } finally {
      setSavingGradeId(null);
    }
  };

  const handleResetAttempt = async (studentId) => {
    if (!confirm("¿Dar una segunda oportunidad a este estudiante? Se borrará su intento anterior.")) return;
    try {
      await axios.delete(`${API_URL}/teacher/exams/${activeExam.id}/attempts/${studentId}`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      alert("Intento reiniciado con éxito.");
      fetchExamAttempts(activeExam);
    } catch (err) {
      alert("Error al reiniciar intento");
    }
  };

  const openQuestionModal = (q = null) => {
    if (q) {
      setQForm({ ...q });
    } else {
      setQForm({ id: null, body: '', type: 'SINGLE_CHOICE', points: 10, options: [] });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (qForm.id) {
        await axios.put(`${API_URL}/teacher/exams/${activeExam.id}/questions/${qForm.id}`, qForm, {
           headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        });
      } else {
        await axios.post(`${API_URL}/teacher/exams/${activeExam.id}/questions`, qForm, {
           headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        });
      }
      setIsQuestionModalOpen(false);
      fetchExams();
      // Update active exam to reflect new questions (lazy way: refetch)
      const res = await axios.get(`${API_URL}/teacher/courses/${courseId}/exams`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      setExams(res.data);
      setActiveExam(res.data.find(e => e.id === activeExam.id));
    } catch (err) {
      alert("Error guardando pregunta");
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if(!confirm("¿Deseas eliminar esta pregunta?")) return;
    try {
      await axios.delete(`${API_URL}/teacher/exams/${activeExam.id}/questions/${qId}`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      const res = await axios.get(`${API_URL}/teacher/courses/${courseId}/exams`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      setExams(res.data);
      setActiveExam(res.data.find(e => e.id === activeExam.id));
    } catch (err) {
      console.error(err);
    }
  };

  const addOption = () => {
    const newOptions = [...qForm.options];
    if (qForm.type === 'MATCHING') {
      newOptions.push({ term: '', match: '' });
    } else {
      newOptions.push({ text: '', isCorrect: false });
    }
    setQForm({ ...qForm, options: newOptions });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...qForm.options];
    newOptions[index][field] = value;
    setQForm({ ...qForm, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = qForm.options.filter((_, i) => i !== index);
    setQForm({ ...qForm, options: newOptions });
  };

  // Change type handler to reset options if necessary
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQForm({ ...qForm, type: newType, options: [] });
  };

  const insertAtCursor = (symbol, field, isOption = false, optIdx = null, optField = null) => {
    if (isOption) {
      const newOptions = [...qForm.options];
      const currentVal = newOptions[optIdx][optField] || '';
      // Simplified: append if we don't have refs for all dynamic inputs
      newOptions[optIdx][optField] = currentVal + symbol;
      setQForm({ ...qForm, options: newOptions });
    } else {
      const currentVal = qForm[field] || '';
      setQForm({ ...qForm, [field]: currentVal + symbol });
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between glass p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => activeExam ? setActiveExam(null) : navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display">Gestor de Exámenes</h1>
              <p className="text-white/40 text-sm">Configura evaluaciones dinámicas e interactivas</p>
            </div>
          </div>
          {!activeExam && (
            <button 
              onClick={() => openExamModal()}
              className="px-6 py-3 ml-auto bg-unicordoba-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-green-600 transition-all shadow-[0_0_20px_rgba(23,198,83,0.3)]"
            >
              <Plus size={16} /> Crear Examen
            </button>
          )}
        </div>

        {/* Views */}
        {!activeExam ? (
          /* List of Exams */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
               <div className="col-span-full py-20 text-center glass rounded-2xl border border-white/5">
                 <FileText className="block mx-auto text-white/20 mb-4" size={48} />
                 <p className="text-white/60 font-bold">No hay exámenes configurados en este curso.</p>
               </div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="glass p-6 rounded-2xl hover:border-unicordoba-primary/50 transition-all border border-white/5 group cursor-pointer">
                  <div onClick={() => setActiveExam(exam)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-unicordoba-primary/10 rounded-xl flex items-center justify-center text-unicordoba-primary">
                        <FileText size={24} />
                      </div>
                      <span className="badge-green">{exam.Questions ? exam.Questions.length : 0} Preguntas</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-unicordoba-primary transition-colors">{exam.title}</h3>
                    <p className="text-white/40 text-sm line-clamp-2 mb-4">{exam.description}</p>
                    
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/30 pt-4 border-t border-white/5">
                      <span>Duración: {exam.duration_minutes} min</span>
                      <span>{new Date(exam.activity_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openExamModal(exam); }}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-white"
                    >
                      <Edit2 size={12} /> Editar Fecha
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); fetchExamAttempts(exam); setActiveTab('results'); }}
                      className="flex-1 py-2 bg-unicordoba-primary/10 hover:bg-unicordoba-primary/20 text-unicordoba-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors font-bold"
                    >
                      <Users size={12} /> Resultados
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Exam Editor (Questions) */
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-unicordoba-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-unicordoba-primary mb-1">{activeExam.title}</h2>
                <div className="flex gap-4 mt-2">
                   <button 
                     onClick={() => setActiveTab('questions')}
                     className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'questions' ? 'border-unicordoba-primary text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
                   >
                     Preguntas y Configuración
                   </button>
                   <button 
                     onClick={() => { fetchExamAttempts(activeExam); setActiveTab('results'); }}
                     className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'results' ? 'border-unicordoba-primary text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
                   >
                     Resultados de Estudiantes
                   </button>
                </div>
              </div>
              
              {activeTab === 'questions' && (
                <button 
                  onClick={() => openQuestionModal()}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                >
                  <Plus size={16} /> Agregar Pregunta
                </button>
              )}
            </div>

            {activeTab === 'questions' ? (
              <div className="space-y-4 animate-fade-in">
                {activeExam.Questions && activeExam.Questions.length > 0 ? (
                  activeExam.Questions.sort((a,b)=>a.order_position - b.order_position).map((q, idx) => (
                    <div key={q.id} className="glass p-5 rounded-xl border border-white/5 relative group flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-white/40">
                        {idx + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-unicordoba-primary/20 text-unicordoba-primary px-2 py-1 rounded">
                            {QUESTION_TYPES.find(t => t.id === q.type)?.label || 'Pregunta'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            {q.points} Puntos
                          </span>
                        </div>
                        <p className="text-white mb-4 whitespace-pre-wrap">{q.body}</p>
                        
                        {/* Opciones Preview */}
                        {q.type !== 'TEXT_DEVELOPMENT' && q.options && q.options.length > 0 && (
                          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-sm space-y-2">
                            {q.type === 'MATCHING' ? (
                              q.options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                  <span className="font-medium text-white/70">{opt.term}</span>
                                  <span className="text-unicordoba-primary/50">➡</span>
                                  <span className="text-white/50">{opt.match}</span>
                                </div>
                              ))
                            ) : (
                              q.options.map((opt, i) => (
                                <div key={i} className={`flex items-center gap-2 ${opt.isCorrect ? 'text-unicordoba-primary font-medium' : 'text-white/50'}`}>
                                  <div className={`w-3 h-3 rounded-full border ${opt.isCorrect ? 'bg-unicordoba-primary border-unicordoba-primary' : 'border-white/20'}`}></div>
                                  {opt.text}
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        <div className="absolute top-5 right-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openQuestionModal(q)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 glass rounded-xl border border-white/5 text-white/40">
                    <p>Aún no has agregado preguntas a este examen.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Results Dashboard */
              <div className="space-y-4 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass p-4 rounded-xl border border-white/5">
                       <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Participación</span>
                       <div className="text-2xl font-black text-white">
                         {examStudents.filter(s => s.attempt).length} / {examStudents.length}
                       </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/5">
                       <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Promedio General</span>
                       <div className="text-2xl font-black text-unicordoba-primary">
                          {(examStudents.filter(s => s.attempt?.status === 'COMPLETED').reduce((acc, s) => acc + parseFloat(s.attempt.final_score), 0) / (examStudents.filter(s => s.attempt?.status === 'COMPLETED').length || 1)).toFixed(1)}
                       </div>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/10 bg-unicordoba-primary/5">
                       <span className="text-[10px] font-bold text-unicordoba-primary uppercase tracking-widest block mb-1">Pendientes por Calificar</span>
                       <div className="text-2xl font-black text-white">
                          0 {/* Placeholder logic for manual grading pending */}
                       </div>
                    </div>
                 </div>

                 <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                             <th className="p-4">Estudiante</th>
                             <th className="p-4">Estado</th>
                             <th className="p-4">Nota Final</th>
                             <th className="p-4 text-right">Acciones</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {loadingAttempts ? (
                             <tr><td colSpan="4" className="p-10 text-center text-white/20 italic">Cargando datos...</td></tr>
                          ) : examStudents.length === 0 ? (
                             <tr><td colSpan="4" className="p-10 text-center text-white/20 italic">No hay estudiantes inscritos.</td></tr>
                          ) : (
                             examStudents.map(student => (
                                <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                   <td className="p-4">
                                      <div className="font-bold text-sm text-white/80">{student.full_name}</div>
                                      <div className="text-[10px] text-white/20 font-mono">{student.email}</div>
                                   </td>
                                   <td className="p-4">
                                      {student.attempt ? (
                                         <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                                           student.attempt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                         }`}>
                                           {student.attempt.status === 'COMPLETED' ? 'Completado' : 'En Progreso'}
                                         </span>
                                      ) : (
                                         <span className="text-[10px] text-white/20 uppercase font-bold">Sin Iniciar</span>
                                      )}
                                   </td>
                                   <td className="p-4">
                                      {student.attempt ? (
                                         <div className="text-xl font-black text-white group-hover:text-unicordoba-primary transition-colors">
                                            {parseFloat(student.attempt.final_score || 0).toFixed(1)}
                                         </div>
                                      ) : "-"}
                                   </td>
                                   <td className="p-4">
                                      <div className="flex justify-end gap-2">
                                         {student.attempt && (
                                            <>
                                               <button 
                                                 onClick={() => fetchAttemptReview(student.attempt.id)}
                                                 className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                                                 title="Revisar y Calificar"
                                               >
                                                 <Eye size={14} />
                                               </button>
                                               <button 
                                                 onClick={() => handleResetAttempt(student.id)}
                                                 className="p-2 bg-unicordoba-primary/10 text-unicordoba-primary hover:bg-unicordoba-primary hover:text-white rounded-lg transition-all"
                                                 title="Reiniciar Intento"
                                               >
                                                 <RotateCcw size={14} />
                                               </button>
                                            </>
                                         )}
                                      </div>
                                   </td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Creación de Examen Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass w-full max-w-lg rounded-2xl border border-white/10 p-6 relative">
             <button onClick={() => setIsExamModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20}/></button>
             <h2 className="text-2xl font-bold mb-6">{examForm.id ? "Editar Examen" : "Nuevo Examen"}</h2>
             <form onSubmit={handleSaveExam} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-bold uppercase mb-1 block">Título</label>
                  <input required value={examForm.title} onChange={e=>setExamForm({...examForm, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none" placeholder="Ej: Parcial Corte 1" />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-bold uppercase mb-1 block">Descripción / Instrucciones</label>
                  <textarea value={examForm.description} onChange={e=>setExamForm({...examForm, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none resize-none h-24" placeholder="Lee atentamente antes de..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 font-bold uppercase mb-1 block">Fecha de Actividad</label>
                    <input required type="date" value={examForm.activity_date} onChange={e=>setExamForm({...examForm, activity_date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 font-bold uppercase mb-1 block">Duración (min)</label>
                    <input required type="number" value={examForm.duration_minutes} onChange={e=>setExamForm({...examForm, duration_minutes: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 mt-4 bg-unicordoba-primary text-white rounded-xl font-bold uppercase hover:bg-green-600 transition-colors">Guardar Examen</button>
             </form>
          </div>
        </div>
      )}

      {/* Editor de Preguntas Modal (Moodle Style) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex py-10 px-4 justify-center z-50 overflow-y-auto">
          <div className="glass w-full max-w-3xl rounded-2xl border border-white/10 p-8 relative h-fit my-auto">
             <button onClick={() => setIsQuestionModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-xl"><X size={20}/></button>
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <Settings className="text-unicordoba-primary" /> {qForm.id ? "Editar Pregunta" : "Añadir Pregunta"}
             </h2>

             <form onSubmit={handleSaveQuestion} className="space-y-6">
                
                {/* Cabecera Pregunta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block ml-1">Tipo de Pregunta</label>
                    <select value={qForm.type} onChange={handleTypeChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-unicordoba-primary outline-none text-white font-medium appearance-none">
                      {QUESTION_TYPES.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-900">{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block ml-1">Puntuación</label>
                    <input type="number" step="0.1" value={qForm.points} onChange={e=>setQForm({...qForm, points: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-unicordoba-primary outline-none font-bold text-lg" required />
                  </div>
                </div>

                {/* Enunciado */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 block ml-1">Enunciado de la pregunta</label>
                    <SymbolPicker onSelect={(s) => insertAtCursor(s, 'body')} />
                  </div>
                  <textarea required rows="4" value={qForm.body} onChange={e=>setQForm({...qForm, body: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-unicordoba-primary outline-none transition-all resize-none text-lg leading-relaxed" placeholder="Escribe el enunciado aquí... Puedes agregar código, escenarios, etc."></textarea>
                </div>

                {/* Zona de Desarrollo de Respuestas/Opciones */}
                {qForm.type !== 'TEXT_DEVELOPMENT' && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-unicordoba-primary uppercase text-xs tracking-widest">Configuración de Respuestas</h3>
                      <button type="button" onClick={addOption} className="text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Plus size={14}/> Añadir Opción
                      </button>
                    </div>

                    <div className="space-y-3">
                      {qForm.options.length === 0 ? (
                        <p className="text-sm text-white/40 italic">Haz clic en añadir opción para comenzar.</p>
                      ) : (
                        qForm.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-3 items-start animate-fade-in">
                            
                            {qForm.type === 'MATCHING' ? (
                              <>
                                <input placeholder="Término / Concepto" value={opt.term || ''} onChange={(e) => updateOption(idx, 'term', e.target.value)} required className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none text-sm" />
                                <div className="mt-3 text-white/20"><Shuffle size={16}/></div>
                                <input placeholder="Correspondencia / Definición" value={opt.match || ''} onChange={(e) => updateOption(idx, 'match', e.target.value)} required className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none text-sm" />
                              </>
                            ) : (
                              <>
                                {/* Unica resp / Multiple */}
                                <div className="pt-3">
                                  <input 
                                    type={qForm.type === 'SINGLE_CHOICE' ? "radio" : "checkbox"} 
                                    name="correctAnswer"
                                    checked={opt.isCorrect || false}
                                    onChange={(e) => {
                                      if(qForm.type === 'SINGLE_CHOICE') {
                                        const newOpts = qForm.options.map((o, i) => ({...o, isCorrect: i === idx}));
                                        setQForm({...qForm, options: newOpts});
                                      } else {
                                        updateOption(idx, 'isCorrect', e.target.checked);
                                      }
                                    }}
                                    className="w-5 h-5 accent-unicordoba-primary" 
                                  />
                                </div>
                                  <div className="flex-grow">
                                    <div className="flex gap-2">
                                      <input placeholder={`Opción ${idx+1}`} value={opt.text || ''} onChange={(e) => updateOption(idx, 'text', e.target.value)} required className={`w-full bg-black/30 border ${opt.isCorrect ? 'border-unicordoba-primary/50 bg-unicordoba-primary/5' : 'border-white/10'} rounded-xl p-3 focus:border-unicordoba-primary outline-none text-sm transition-all`} />
                                      <SymbolPicker onSelect={(s) => insertAtCursor(s, 'options', true, idx, 'text')} />
                                    </div>
                                    {opt.isCorrect && <span className="text-[10px] uppercase font-bold text-unicordoba-primary ml-1 block mt-1">Respuesta Correcta</span>}
                                  </div>
                              </>
                            )}
                            <button type="button" onClick={() => removeOption(idx)} className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {qForm.type === 'TEXT_DEVELOPMENT' && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-sm text-white/60">
                    <p className="flex items-center gap-2 mb-2 text-unicordoba-primary font-bold"><AlignLeft size={16}/> Desarrollo Textual</p>
                    <p>El estudiante verá un bloque de texto que le permitirá escribir libremente su respuesta. Esta pregunta requerirá calificación manual después del examen.</p>
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-unicordoba-primary text-white rounded-xl font-bold uppercase flex justify-center items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                  <Save size={18}/> {qForm.id ? "Guardar Cambios" : "Guardar Pregunta"}
                </button>
             </form>
          </div>
        </div>
      )}


      {/* Modal de Calificación Manual */}
      {isGradingModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex py-10 px-4 justify-center z-[60] overflow-y-auto">
          <div className="glass w-full max-w-4xl rounded-3xl border border-white/10 p-8 relative h-fit my-auto shadow-2xl">
             <button onClick={() => setIsGradingModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-xl transition-all hover:scale-110"><X size={20}/></button>
             
             {loadingGrading ? (
               <div className="py-20 text-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unicordoba-primary mx-auto"></div>
                 <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Cargando revisión...</p>
               </div>
             ) : gradingData && (
               <div className="space-y-8">
                  {/* Header del Modal */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-unicordoba-primary/10 rounded-2xl flex items-center justify-center text-unicordoba-primary border border-unicordoba-primary/20">
                        <Award size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-display">{gradingData.attempt.User?.full_name}</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{gradingData.exam.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-1">Nota Definitiva</span>
                        <div className="text-4xl font-black text-unicordoba-primary">
                          {parseFloat(gradingData.attempt.final_score || 0).toFixed(1)}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-white/10"></div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-1">Estado</span>
                        <div className="text-xs font-black text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 mt-1">
                          {gradingData.attempt.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Preguntas y Respuestas */}
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {gradingData.exam.Questions.sort((a,b)=>a.order_position - b.order_position).map((q, idx) => {
                      const studentAns = gradingData.answers.find(a => a.question_id === q.id);
                      const isCorrect = studentAns?.is_correct;
                      
                      return (
                        <div key={q.id} className={`p-6 rounded-2xl border transition-all ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/30 text-xs border border-white/10">
                                {idx + 1}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-unicordoba-primary bg-unicordoba-primary/10 px-2 py-1 rounded">
                                {QUESTION_TYPES.find(t => t.id === q.type)?.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-1">Puntos Obtenidos</label>
                                  <div className="flex items-center gap-2">
                                     <input 
                                       type="number" 
                                       step="0.1"
                                       max={q.points}
                                       defaultValue={studentAns?.points_earned || 0}
                                       onBlur={(e) => handleUpdateGrade(studentAns?.id, e.target.value)}
                                       className="w-16 bg-black/40 border border-white/10 rounded-lg p-1.5 text-center font-bold text-unicordoba-primary focus:border-unicordoba-primary outline-none transition-all"
                                     />
                                     <span className="text-white/20 text-[10px] font-bold">/ {q.points}</span>
                                  </div>
                               </div>
                               {savingGradeId === studentAns?.id ? (
                                 <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-unicordoba-primary"></div>
                               ) : isCorrect ? (
                                 <CheckCircle2 className="text-green-500" size={20} />
                               ) : (
                                 <AlertCircle className="text-red-500/50" size={20} />
                               )}
                            </div>
                          </div>

                          <p className="text-white font-bold mb-6 text-lg">{q.body}</p>

                          {/* Student Response Display */}
                          <div className="space-y-4">
                            {q.type === 'TEXT_DEVELOPMENT' ? (
                              <div className="p-5 bg-black/40 rounded-xl border border-white/10 italic text-white/70 leading-relaxed">
                                {studentAns?.answer_data || "No respondida."}
                              </div>
                            ) : q.type === 'MATCHING' ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options?.map((opt, i) => (
                                  <div key={i} className="p-3 bg-black/20 rounded-lg border border-white/5 flex items-center justify-between gap-4">
                                    <span className="text-xs font-bold text-white/60">{opt.term}</span>
                                    <span className="text-unicordoba-primary text-[10px]">➡</span>
                                    <span className={`text-xs font-medium ${studentAns?.answer_data?.[opt.term] === opt.match ? 'text-green-400' : 'text-red-400'}`}>
                                      {studentAns?.answer_data?.[opt.term] || 'Sin unir'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {q.options?.map((opt, i) => {
                                  const isSelected = q.type === 'MULTIPLE_CHOICE' 
                                    ? Array.isArray(studentAns?.answer_data) && studentAns.answer_data.includes(opt.text)
                                    : studentAns?.answer_data === opt.text;
                                  
                                  return (
                                    <div key={i} className={`px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                                      opt.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                                      isSelected ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-white/20'
                                    }`}>
                                      {isSelected && <span className="w-2 h-2 rounded-full bg-current"></span>}
                                      {opt.text}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-end">
                     <button 
                       onClick={() => setIsGradingModalOpen(false)}
                       className="px-8 py-3 bg-unicordoba-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                     >
                       Finalizar Revisión
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
