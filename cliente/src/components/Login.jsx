import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ChevronRight, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetError } from '../redux/slices/authSlice';
import UnicordobaLogo from './UnicordobaLogo';

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Limpiar errores al desmontar o cambiar datos
  useEffect(() => {
    return () => dispatch(resetError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden hero-mesh">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-unicordoba-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-unicordoba-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative group">
        {/* Glow decorativo detrás de la tarjeta */}
        <div className="absolute -inset-1 bg-gradient-to-r from-unicordoba-primary/20 to-unicordoba-secondary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Tarjeta de Login (Blanca) */}
        <div className="relative bg-white pt-10 pb-12 px-8 sm:px-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          
          {/* Header del Login (Ahora basado en la nueva imagen) */}
            <div className="flex justify-center mb-8">
               <UnicordobaLogo size={160} showText={true} />
            </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-fade-in">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          {/* Mensaje de Éxito Simulado */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wide">¡Sesión iniciada con éxito!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Usuario/Email */}
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
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  autoComplete="email"
                  placeholder="ejemplo@correo.unicordoba.edu.co"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl 
                           focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary focus:bg-white 
                           transition-all outline-none disabled:opacity-50"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Campo de Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1" htmlFor="password">
                  Contraseña
                </label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-unicordoba-primary hover:text-unicordoba-primary-dark transition-colors uppercase tracking-wider">
                  ¿La olvidaste?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-unicordoba-primary transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl 
                           focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary focus:bg-white 
                           transition-all outline-none disabled:opacity-50"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Checkbox Recuérdame */}
            <div className="flex items-center ml-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                disabled={loading}
                className="h-4 w-4 text-unicordoba-primary focus:ring-unicordoba-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500 cursor-pointer select-none">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent 
                       text-sm font-bold rounded-2xl text-white bg-unicordoba-primary hover:bg-unicordoba-primary-dark 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-unicordoba-primary 
                       transition-all active:scale-95 shadow-xl shadow-unicordoba-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 text-white/50 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" aria-hidden="true" />
                )}
              </span>
              {loading ? 'CONECTANDO...' : 'INGRESAR AL PORTAL'}
              {!loading && <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Soporte/Footer de la tarjeta */}
          <div className="mt-10 pt-8 border-t border-gray-50 text-center space-y-4">
            <p className="text-xs text-gray-400">
              ¿No tienes una cuenta? <br />
              <a href="#" className="text-unicordoba-primary font-bold hover:underline">
                Contacta con el administrador
              </a>
            </p>
            <div className="flex justify-center gap-4 text-gray-300">
              <a href="#" className="hover:text-unicordoba-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                <HelpCircle size={14} /> Soporte TIC
              </a>
            </div>
          </div>
        </div>
        
        {/* NIT bajo la tarjeta */}
        <p className="mt-6 text-center text-white/20 text-[10px] uppercase tracking-[0.4em] font-medium">
          Universidad de Córdoba · Colombia
        </p>
      </div>
    </section>
  );
}
