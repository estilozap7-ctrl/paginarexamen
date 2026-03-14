import { ArrowRight, BookOpen, Users, Award, ChevronDown } from 'lucide-react';
import UnicordobaLogo from './UnicordobaLogo';

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden hero-mesh pt-16"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Esferas decorativas */}
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-unicordoba-primary/10 
                        rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-56 h-56 bg-unicordoba-secondary/10 
                        rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-96 h-96 bg-unicordoba-primary/5 rounded-full blur-3xl" />

        {/* Grid decorativo */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#26924C" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

        {/* Contenido izquierdo */}
        <div className="animate-fade-in">
          {/* Título principal */}
          <h1 className="font-display font-black text-white leading-tight mb-6">
            <span className="text-5xl sm:text-6xl lg:text-7xl text-gradient-green block">
              Universidad
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl text-white block">
              de Córdoba
            </span>
            <span className="text-2xl sm:text-3xl text-white/60 font-light block mt-2">
              Colombia 🇨🇴
            </span>
          </h1>

          {/* Descripción */}
          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
            Formando líderes comprometidos con el desarrollo sostenible del Caribe colombiano.
            Más de <span className="text-unicordoba-primary-300 font-semibold">50 años</span> de excelencia académica,
            investigación y extensión universitaria.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a href="#programas" className="btn-primary text-base px-8 py-3.5 animate-pulse-green">
              Explorar Programas
              <ArrowRight size={18} />
            </a>
            <a href="#investigacion" className="btn-outline text-base px-8 py-3.5">
              <BookOpen size={18} />
              Investigación
            </a>
          </div>
        </div>

        {/* Contenido derecho – Tarjeta Blanca */}
        <div className="flex justify-center lg:justify-end animate-slide-in-left">
          <div className="relative">
            {/* Tarjeta principal - AHORA EN BLANCO */}
            <div className="bg-white p-10 w-80 rounded-3xl animate-float shadow-2xl shadow-unicordoba-primary/20">
              {/* Logo grande con fondo blanco circular */}
              <div className="flex justify-center mb-8">
                <div className="relative p-4 bg-white rounded-full shadow-lg border border-gray-50">
                   <UnicordobaLogo size={120} className="relative z-10" />
                </div>
              </div>

              <h2 className="text-center font-display font-black text-unicordoba-dark text-2xl mb-1">
                UniCórdoba
              </h2>
              <p className="text-center text-unicordoba-primary font-bold text-xs 
                            uppercase tracking-widest mb-8">
                NIT 891080031-3
              </p>

              {/* Info rápida */}
              <div className="space-y-4 mb-8">
                {[
                  { label: 'Sede Principal', value: 'Montería, Córdoba' },
                  { label: 'Fundada', value: '1966' },
                  { label: 'Modalidad', value: 'Presencial · Virtual' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center 
                                               py-2 border-b border-gray-100">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</span>
                    <span className="text-unicordoba-dark text-sm font-bold">{value}</span>
                  </div>
                ))}
              </div>

              <a href="#portal" className="btn-primary w-full justify-center shadow-lg">
                Portal Estudiantil
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center 
                      gap-1 text-white/30 animate-bounce">
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
