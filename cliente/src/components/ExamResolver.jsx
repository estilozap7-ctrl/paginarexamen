import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Timer, ChevronLeft, ChevronRight, Save, 
  Send, AlertCircle, CheckCircle2, List, 
  Clock, Award, Info, BookOpen
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ExamResolver() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: data }
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    startOrResumeExam();
    return () => clearInterval(timerRef.current);
  }, [examId]);

  const startOrResumeExam = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/student/exams/${examId}/start`, {}, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });

      const { exam, attempt, savedAnswers } = res.data;
      setExam(exam);
      setAttempt(attempt);
      setQuestions(exam.Questions.sort((a,b) => a.order_position - b.order_position));
      
      // Load saved answers
      const ansMap = {};
      savedAnswers.forEach(a => {
        ansMap[a.question_id] = a.answer_data;
      });
      setAnswers(ansMap);

      // Start Timer
      const startedAt = new Date(attempt.started_at);
      const durationMs = exam.duration_minutes * 60000;
      const now = new Date();
      const remainingMs = Math.max(0, durationMs - (now - startedAt));
      
      if (remainingMs <= 0 && attempt.status === 'IN_PROGRESS') {
        finishExam();
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000));
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              finishExam();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

    } catch (err) {
      if (err.response?.status === 403) {
          // Already finished or expired - Fetch full review
          try {
            const reviewRes = await axios.get(`${API_URL}/student/exams/${examId}/review`, {
              headers: { 'x-user-id': user.id, 'x-user-role': user.role }
            });
            setResultsData(reviewRes.data);
            setShowResults(true);
          } catch (reviewErr) {
            console.error("Error fetching review", reviewErr);
            setError("No se pudo cargar la revisión del examen.");
          }
      } else {
          console.error(err);
          setError("Ocurrió un error al iniciar el examen. Por favor intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (qId, data) => {
    setAnswers(prev => ({ ...prev, [qId]: data }));
    try {
      await axios.post(`${API_URL}/student/exams/${examId}/save`, {
        questionId: qId,
        answerData: data
      }, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
    } catch (err) {
      console.error("Error saving answer", err);
    }
  };

  const finishExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/student/exams/${examId}/finish`, {}, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      
      // Fetch full review to show correct answers
      const reviewRes = await axios.get(`${API_URL}/student/exams/${examId}/review`, {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      });
      
      setResultsData(reviewRes.data);
      setShowResults(true);
      clearInterval(timerRef.current);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-unicordoba-dark flex items-center justify-center p-6 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unicordoba-primary"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-unicordoba-dark flex flex-col items-center justify-center p-6 text-white text-center hero-mesh">
       <div className="glass p-10 rounded-3xl border border-red-500/20 max-w-md w-full animate-fade-in">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Oops! Algo salió mal</h2>
          <p className="text-white/40 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
          >
            Volver al Inicio
          </button>
       </div>
    </div>
  );

  if (showResults) return (
    <div className="min-h-screen bg-unicordoba-dark p-6 text-white hero-mesh">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-10">
        
        <div className="glass p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-unicordoba-primary to-green-300"></div>
             <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
               <Award size={48} />
             </div>
             <h2 className="text-3xl font-display font-black mb-2 uppercase tracking-tighter">Resultados de Evaluación</h2>
             <p className="text-white/40 mb-8 font-medium">Revisa tu desempeño y las respuestas correctas a continuación.</p>
             
             <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-1">Nota Definitiva</span>
                    <div className="text-5xl font-black text-unicordoba-primary">
                        {parseFloat(resultsData?.final_score || resultsData?.attempt?.final_score || 0.0).toFixed(1)}
                    </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-1">Estado</span>
                    <div className="text-xl font-black text-white uppercase tracking-wider mt-2">
                        {resultsData?.status || resultsData?.attempt?.status || 'COMPLETED'}
                    </div>
                </div>
             </div>

             <button 
               onClick={() => navigate('/dashboard')}
               className="px-8 py-3 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
             >
               Volver al Dashboard
             </button>
        </div>

        {/* Review Section */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold border-l-4 border-unicordoba-primary pl-4 uppercase tracking-tighter">Revisión de Intentos</h3>
           
           {(resultsData?.exam?.Questions || questions).map((q, idx) => {
              const studentAnswers = resultsData?.answers || [];
              const studentAns = studentAnswers.find(a => a.question_id === q.id);
              const isCorrect = studentAns?.is_correct;
              
              return (
                <div key={q.id} className={`glass p-6 rounded-2xl border ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'} relative`}>
                   <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/30 text-xs">
                         {idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                         {isCorrect ? 'Correcta' : 'Incorrecta / Parcial'}
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-white/20">{studentAns?.points_earned || 0} / {q.points} Pts</span>
                   </div>
                   
                   <p className="text-lg font-bold mb-6 text-white/90">{q.body}</p>
                   
                   <div className="space-y-3">
                      {q.options?.map((opt, i) => {
                         const isSelected = q.type === 'MULTIPLE_CHOICE' 
                           ? Array.isArray(studentAns?.answer_data) && studentAns.answer_data.includes(opt.text)
                           : studentAns?.answer_data === opt.text;
                         
                         const isCorrectOpt = opt.isCorrect;

                         return (
                           <div 
                             key={i} 
                             className={`p-4 rounded-xl border flex items-center gap-3 ${
                               isCorrectOpt 
                                 ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                 : isSelected 
                                   ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                   : 'bg-white/5 border-white/5 text-white/30'
                             }`}
                           >
                              {isCorrectOpt ? <CheckCircle2 size={16} /> : <div className="w-4 h-4" />}
                              <span className="text-sm font-medium">{opt.text}</span>
                              {isSelected && <span className="ml-auto text-[10px] font-black uppercase opacity-60">Tu Respuesta</span>}
                           </div>
                         );
                      })}

                      {q.type === 'MATCHING' && (
                         <div className="space-y-2">
                            {q.options?.map((opt, i) => {
                               const studentMatch = studentAns?.answer_data?.[opt.term];
                               const isPairCorrect = studentMatch === opt.match;

                               return (
                                 <div key={i} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center gap-3 ${isPairCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className="flex-1 font-bold text-white/80">{opt.term}</div>
                                    <div className="text-white/20">➡</div>
                                    <div className="flex-1">
                                       <div className="text-[10px] uppercase font-bold text-white/30 mb-1">Tu Selección:</div>
                                       <div className={`text-sm font-medium ${isPairCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                          {studentMatch || 'Sin respuesta'}
                                       </div>
                                       {!isPairCorrect && (
                                         <div className="mt-2 pt-2 border-t border-white/5">
                                            <div className="text-[10px] uppercase font-bold text-green-500/50 mb-1">Correcto:</div>
                                            <div className="text-sm font-medium text-green-400/70">{opt.match}</div>
                                         </div>
                                       )}
                                    </div>
                                 </div>
                               );
                            })}
                         </div>
                      )}

                      {q.type === 'TEXT_DEVELOPMENT' && (
                        <div className="space-y-4">
                           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <span className="text-[10px] font-bold text-white/20 uppercase block mb-2">Tu Respuesta:</span>
                              <p className="text-white/70 text-sm whitespace-pre-wrap">{studentAns?.answer_data || "No respondida."}</p>
                           </div>
                           <div className="p-4 bg-unicordoba-primary/5 rounded-xl border border-unicordoba-primary/20 text-xs italic text-unicordoba-primary/70">
                              Esta respuesta requiere revisión manual del docente para asignar puntaje definitivo.
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 py-8 px-6">
        
        {/* Main Exam Content */}
        <div className="flex-grow space-y-6">
          
          {/* Header */}
          <div className="glass p-6 rounded-2xl flex items-center justify-between border-b-4 border-unicordoba-primary/50">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary">
                  <BookOpen size={20} />
               </div>
               <div>
                  <h1 className="text-xl font-bold">{exam.title}</h1>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Estudiante: {user.full_name}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className={`px-5 py-3 rounded-xl flex items-center gap-3 font-mono font-bold text-lg border ${timeLeft < 120 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-white/5 text-unicordoba-primary border-white/10'}`}>
                  <Clock size={20} className={timeLeft < 120 ? 'animate-pulse' : ''} />
                  {formatTime(timeLeft)}
               </div>
            </div>
          </div>

          {/* Question View */}
          <div className="glass p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col relative animate-fade-in" key={currentQ.id}>
             <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/30 border border-white/10">
                   {currentIdx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-unicordoba-primary">Pregunta {currentIdx + 1} de {questions.length}</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-white/20 bg-white/5 px-3 py-1.5 rounded-lg">{currentQ.points} Puntos</span>
             </div>

             <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-10 text-white/90">
                {currentQ.body}
             </h2>

             {/* Answers Zone */}
             <div className="space-y-4 flex-grow">
                {currentQ.type === 'SINGLE_CHOICE' && (
                  <div className="grid gap-3">
                    {currentQ.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSaveAnswer(currentQ.id, opt.text)}
                        className={`p-5 rounded-2xl text-left border transition-all duration-300 flex items-center gap-4 group ${
                          answers[currentQ.id] === opt.text 
                            ? 'bg-unicordoba-primary/10 border-unicordoba-primary text-white' 
                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                         <div className={`w-5 h-5 rounded-full border-2 shrink-0 group-hover:scale-110 transition-transform flex items-center justify-center ${
                           answers[currentQ.id] === opt.text ? 'border-unicordoba-primary' : 'border-white/20'
                         }`}>
                            {answers[currentQ.id] === opt.text && <div className="w-2.5 h-2.5 bg-unicordoba-primary rounded-full" />}
                         </div>
                         <span className="font-medium">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'MULTIPLE_CHOICE' && (
                   <div className="grid gap-3">
                    {currentQ.options?.map((opt, i) => {
                      const selected = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                      const isSelected = selected.includes(opt.text);
                      
                      return (
                        <button
                          key={i}
                          onClick={() => {
                             const newSelection = isSelected 
                               ? selected.filter(s => s !== opt.text)
                               : [...selected, opt.text];
                             handleSaveAnswer(currentQ.id, newSelection);
                          }}
                          className={`p-5 rounded-2xl text-left border transition-all duration-300 flex items-center gap-4 group ${
                            isSelected 
                              ? 'bg-unicordoba-primary/10 border-unicordoba-primary text-white' 
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                           <div className={`w-5 h-5 rounded-md border-2 shrink-0 transition-all flex items-center justify-center ${
                             isSelected ? 'bg-unicordoba-primary border-unicordoba-primary' : 'border-white/20'
                           }`}>
                              {isSelected && <CheckCircle2 size={14} className="text-white" />}
                           </div>
                           <span className="font-medium">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'TEXT_DEVELOPMENT' && (
                  <textarea 
                    className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 focus:border-unicordoba-primary outline-none text-white leading-relaxed resize-none"
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleSaveAnswer(currentQ.id, e.target.value)}
                  />
                )}

                {currentQ.type === 'MATCHING' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-unicordoba-primary/5 border border-unicordoba-primary/20 rounded-2xl mb-6 flex items-start gap-3">
                      <Info className="text-unicordoba-primary shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-unicordoba-primary/70 italic">Relaciona cada término de la izquierda con su correspondencia correcta en la derecha.</p>
                    </div>
                    
                    <div className="grid gap-4">
                      {currentQ.options?.map((opt, i) => {
                        const currentVal = answers[currentQ.id]?.[opt.term] || '';
                        // Shuffled matches for the dropdown (we do this once or use stable sort)
                        const allMatches = currentQ.options.map(o => o.match).sort();

                        return (
                          <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-4 glass rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                             <div className="flex-1 font-bold text-white/80 pl-2">
                               {opt.term}
                             </div>
                             <div className="hidden md:block text-unicordoba-primary/30">
                               <ChevronRight size={20} />
                             </div>
                             <div className="flex-1 w-full">
                               <select 
                                 value={currentVal}
                                 onChange={(e) => {
                                   const newMatching = { ...(answers[currentQ.id] || {}), [opt.term]: e.target.value };
                                   handleSaveAnswer(currentQ.id, newMatching);
                                 }}
                                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-unicordoba-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                               >
                                 <option value="">Seleccionar correspondencia...</option>
                                 {allMatches.map((m, idx) => (
                                   <option key={idx} value={m} className="bg-unicordoba-dark text-white">{m}</option>
                                 ))}
                                </select>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
             </div>

             {/* Footer Navigation */}
             <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                <button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} /> Anterior
                </button>

                <div className="flex gap-2">
                   {currentIdx === questions.length - 1 ? (
                     <button 
                       onClick={() => {
                          if (confirm("¿Estás seguro de que deseas finalizar el examen?")) {
                            finishExam();
                          }
                       }}
                       disabled={submitting}
                       className="px-8 py-4 bg-unicordoba-primary text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-green-600 transition-all shadow-[0_0_20px_rgba(23,198,83,0.3)]"
                     >
                       {submitting ? 'Enviando...' : 'Entregar Examen'} <Send size={16} />
                     </button>
                   ) : (
                     <button 
                        onClick={() => setCurrentIdx(prev => prev + 1)}
                        className="px-8 py-4 bg-white text-unicordoba-dark rounded-xl font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-unicordoba-primary hover:text-white transition-all shadow-lg"
                      >
                        Siguiente <ChevronRight size={16} />
                      </button>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
           
           {/* Progress Panel */}
           <div className="glass p-6 rounded-3xl sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                 <List className="text-unicordoba-primary" size={20} />
                 <h3 className="font-bold text-sm tracking-tighter uppercase">Navegación</h3>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                 {questions.map((q, i) => {
                    const isAnswered = answers[q.id] && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : String(answers[q.id]).trim().length > 0);
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                          currentIdx === i 
                            ? 'bg-unicordoba-primary text-white border-unicordoba-primary scale-110 z-10 shadow-lg' 
                            : isAnswered 
                              ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                              : 'bg-white/5 text-white/20 border-white/5 hover:border-white/20'
                        }`}
                      >
                         {i + 1}
                      </button>
                    );
                 })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <span>Progreso Guardado</span>
                    <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-unicordoba-primary transition-all duration-500"
                      style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    />
                 </div>
              </div>

              <div className="mt-10 p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex gap-3 items-start">
                 <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-red-500/70 font-medium leading-relaxed">
                    Si cierras la ventana el tiempo seguirá corriendo. Podrás reanudar el examen mientras el tiempo no expire.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
