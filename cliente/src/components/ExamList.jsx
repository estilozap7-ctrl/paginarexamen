import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  ChevronLeft, Timer, FileText, CheckCircle2, 
  AlertCircle, PlayCircle, Lock, Award,
  Clock, Calendar, RotateCcw, Shuffle
} from 'lucide-react';
import UnicordobaLogo from './UnicordobaLogo';

export default function ExamList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/student/courses/${courseId}/exams`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      setExams(response.data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los exámenes de esta asignatura.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchExams();
  }, [courseId, user, API_URL]);

  const handleManualRefresh = () => {
    fetchExams();
  };

  const getStatusBadge = (exam) => {
    const attempt = exam.StudentExamAttempts?.[0];
    if (attempt?.status === 'COMPLETED') {
      return (
        <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 flex items-center gap-1.5 ml-auto">
          <CheckCircle2 size={12} /> Completado
        </span>
      );
    }
    if (attempt?.status === 'IN_PROGRESS') {
      return (
        <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 flex items-center gap-1.5 ml-auto">
          <Clock size={12} className="animate-pulse" /> En curso
        </span>
      );
    }
    if (attempt?.status === 'EXPIRED' || (!attempt && new Date() > new Date(exam.activity_date))) {
      return (
        <span className="badge bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 flex items-center gap-1.5 ml-auto">
          <AlertCircle size={12} /> Expirado
        </span>
      );
    }
    return (
      <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 flex items-center gap-1.5 ml-auto">
        <PlayCircle size={12} /> Disponible
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-unicordoba-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unicordoba-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white hero-mesh">
      <main className="max-w-4xl mx-auto pt-16 pb-20 px-6">
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 text-unicordoba-primary mb-3">
             <FileText size={22} sx={{ mb: 1 }} />
             <span className="text-xs font-bold uppercase tracking-[0.4em]">Evaluaciones</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-white">
                Banco de <span className="text-gradient-green">Exámenes</span>
              </h1>
              <p className="mt-4 text-white/40 max-w-xl text-lg">
                Aquí encontrarás todas las actividades evaluativas, exámenes parciales y retos de lógica programados para esta asignatura.
              </p>
            </div>
            <button 
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all self-start md:self-auto"
            >
              <RotateCcw size={14} /> Actualizar Estado
            </button>
          </div>
        </header>

        {error && (
             <div className="glass border-red-500/20 p-6 flex items-center gap-4 text-red-400 mb-8 animate-shake">
                <AlertCircle size={24} />
                <p className="font-medium text-sm tracking-wide">{error}</p>
             </div>
        )}

        <div className="space-y-6">
          {exams.length > 0 ? (
            exams.map((exam, index) => {
               // Ordenar intentos para priorizar el completado y con mejor nota
               const sortedAttempts = [...(exam.StudentExamAttempts || [])].sort((a, b) => {
                 if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
                 if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
                 return parseFloat(b.final_score) - parseFloat(a.final_score);
               });
               const attempt = sortedAttempts[0];
               const isCompleted = attempt?.status === 'COMPLETED';
               const isExpired = attempt?.status === 'EXPIRED' || (!attempt && new Date() > new Date(exam.activity_date));

               return (
                 <div 
                   key={exam.id} 
                   className={`glass p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group hover:border-unicordoba-primary/30 transition-all duration-300 animate-fade-in`}
                   style={{ animationDelay: `${index * 100}ms` }}
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 
                                  ${isCompleted ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/20 group-hover:bg-unicordoba-primary/10 group-hover:text-unicordoba-primary'}`}>
                        {isCompleted ? <Award size={32} /> : <FileText size={32} />}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-unicordoba-primary transition-colors">
                                {exam.title}
                            </h3>
                            {getStatusBadge(exam)}
                        </div>
                        <p className="text-white/40 text-sm mb-4 leading-relaxed max-w-lg">
                            {exam.description || 'Sin descripción adicional para esta evaluación.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                <Timer size={14} />
                                <span>{exam.duration_minutes} Minutos</span>
                            </div>
                            <div className="h-1 w-1 bg-white/10 rounded-full"></div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                <Calendar size={14} />
                                <span>{new Date(exam.activity_date).toLocaleDateString()}</span>
                            </div>
                            {exam.questions_limit > 0 && (
                              <>
                                <div className="h-1 w-1 bg-white/10 rounded-full"></div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-unicordoba-primary/10 text-unicordoba-primary border border-unicordoba-primary/20">
                                  <Shuffle size={12} />
                                  {exam.questions_limit} preguntas aleatorias
                                </div>
                              </>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                        {isCompleted && (
                          <div className="text-center md:text-right mb-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Nota Final</span>
                            <span className="text-2xl font-black text-unicordoba-primary">
                              {parseFloat(attempt?.final_score || 0).toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        <button 
                            disabled={!isCompleted && isExpired}
                            onClick={() => navigate(`/exam/${exam.id}/resolve`)}
                            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300
                                       ${(!isCompleted && isExpired)
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                                            : isCompleted
                                              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                              : 'btn-primary shadow-lg shadow-unicordoba-primary/20'}`}
                        >
                            {isCompleted ? 'Ver Revisión' : isExpired ? 'Expirado' : 'Empezar Examen'}
                        </button>
                    </div>
                 </div>
               );
            })
          ) : (
            <div className="py-20 glass flex flex-col items-center justify-center text-center px-6 border-dashed opacity-50">
                <FileText size={48} className="text-white/10 mb-4" />
                <p className="text-sm font-medium">No se han publicado exámenes para esta materia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
