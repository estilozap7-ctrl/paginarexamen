import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnicordobaLogo from './UnicordobaLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar recuperación de contraseña');
      }

      if (data.dev_reset_link) {
        setDevLink(data.dev_reset_link);
      }
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden hero-mesh">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-unicordoba-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-unicordoba-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-unicordoba-primary/20 to-unicordoba-secondary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-white pt-10 pb-12 px-8 sm:px-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="flex justify-center mb-6">
            <UnicordobaLogo size={120} showText={true} />
          </div>
          
          <h2 className="text-center text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider">Recuperar Contraseña</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-fade-in">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          {message ? (
             <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center gap-3 text-green-600 animate-fade-in text-center break-words">
               <CheckCircle size={40} className="shrink-0 text-green-500 mb-2" />
               <p className="text-sm font-bold tracking-wide">{message}</p>
               {devLink && (
                  <div className="mt-2 w-full max-w-sm">
                    <p className="text-xs text-gray-500 mb-1">Para pruebas de desarrollo, haz clic aquí:</p>
                    <a href={devLink} className="text-xs text-blue-500 underline break-all">{devLink}</a>
                  </div>
               )}
               <Link to="/login" className="mt-4 text-xs font-bold text-unicordoba-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                 <ArrowLeft size={16} /> Volver al Login
               </Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-gray-500 text-center mb-4">
                Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1" htmlFor="email">
                  Correo Institucional
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-unicordoba-primary transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={loading}
                    placeholder="ejemplo@correo.unicordoba.edu.co"
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary focus:bg-white transition-all outline-none disabled:opacity-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-unicordoba-primary hover:bg-unicordoba-primary-dark transition-all active:scale-95 shadow-xl shadow-unicordoba-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 text-white/50 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 text-white/50 group-hover:text-white transition-colors mr-2" />
                )}
                {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
              </button>

              <div className="text-center mt-6">
                 <Link to="/login" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-unicordoba-primary transition-colors flex items-center justify-center gap-1">
                   <ArrowLeft size={14} /> Volver al logIn
                 </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
