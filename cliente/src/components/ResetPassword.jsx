import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import UnicordobaLogo from './UnicordobaLogo';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          
          <h2 className="text-center text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider">Restablecer Contraseña</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-fade-in">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          {message ? (
             <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center gap-3 text-green-600 animate-fade-in text-center">
               <CheckCircle size={40} className="shrink-0 text-green-500 mb-2" />
               <p className="text-sm font-bold tracking-wide">{message}</p>
               <p className="text-xs mt-2 text-gray-500">Redirigiendo al login...</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-unicordoba-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary focus:bg-white transition-all outline-none disabled:opacity-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-unicordoba-primary transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary focus:bg-white transition-all outline-none disabled:opacity-50"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
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
                  <Save className="h-5 w-5 text-white/50 group-hover:text-white transition-colors mr-2" />
                )}
                {loading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
