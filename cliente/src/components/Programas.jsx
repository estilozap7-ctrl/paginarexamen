import {
  FlaskConical, Leaf, Cpu, HeartPulse, Scale, Building2,
  BookOpen, Lightbulb, Globe, ArrowRight
} from 'lucide-react';

const facultades = [
  {
    icon: FlaskConical,
    nombre: 'Ciencias Básicas',
    color: 'from-emerald-500/20 to-green-600/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    programas: ['Biología', 'Química', 'Matemáticas', 'Física'],
    descripcion: 'Formación rigurosa en ciencias fundamentales para el desarrollo científico.',
  },
  {
    icon: Leaf,
    nombre: 'Ciencias Agrop. y Acuic.',
    color: 'from-green-500/20 to-teal-600/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    programas: ['Zootecnia', 'Agronomía', 'Ingeniería Agronómica'],
    descripcion: 'Líderes en producción agropecuaria sostenible del Caribe colombiano.',
  },
  {
    icon: Cpu,
    nombre: 'Ing. y Tecnologías',
    color: 'from-teal-500/20 to-cyan-600/10',
    border: 'border-teal-500/30',
    iconColor: 'text-teal-400',
    programas: ['Sistemas', 'Industrial', 'Civil', 'Ambiental'],
    descripcion: 'Ingeniería orientada a la innovación y la transformación digital.',
  },
  {
    icon: HeartPulse,
    nombre: 'Ciencias de la Salud',
    color: 'from-rose-500/20 to-pink-600/10',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    programas: ['Enfermería', 'Medicina Veterinaria', 'Nutrición'],
    descripcion: 'Comprometidos con la salud humana y animal de la región.',
  },
  {
    icon: Scale,
    nombre: 'Derecho y C. Políticas',
    color: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    programas: ['Derecho', 'Ciencia Política'],
    descripcion: 'Formando abogados con sentido social y vocación de justicia.',
  },
  {
    icon: Building2,
    nombre: 'Educación y C. Humanas',
    color: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400',
    programas: ['Lic. Matemáticas', 'Lic. Inglés', 'Lic. Literatura'],
    descripcion: 'Educadores de calidad que transforman la sociedad costeña.',
  },
];

export default function Programas() {
  return (
    <section id="programas" className="py-20 px-4 sm:px-6 bg-black/20">
      <div className="max-w-7xl mx-auto">

        {/* Header sección */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 badge-green mb-4">
            <BookOpen size={14} />
            Oferta Académica
          </div>
          <h2 className="section-title">Nuestras Facultades</h2>
          <div className="divider-green mx-auto" />
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Más de <span className="text-unicordoba-primary-300 font-semibold">70 programas académicos</span> de
            pregrado, especialización, maestría y doctorado a tu disposición.
          </p>
        </div>

        {/* Grid de facultades */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facultades.map((fac, i) => {
            const Icon = fac.icon;
            return (
              <article
                key={fac.nombre}
                style={{ animationDelay: `${i * 0.1}s` }}
                className={`relative group border ${fac.border} rounded-2xl p-6 
                            bg-gradient-to-br ${fac.color} backdrop-blur-sm
                            hover:-translate-y-2 hover:shadow-green-glow 
                            transition-all duration-300 cursor-pointer animate-slide-up`}
              >
                {/* Icono */}
                <div className={`inline-flex items-center justify-center w-12 h-12 
                                  rounded-xl bg-white/10 mb-4 group-hover:scale-110 
                                  transition-transform duration-300`}>
                  <Icon size={24} className={fac.iconColor} />
                </div>

                <h3 className="font-display font-bold text-white text-lg mb-2">
                  {fac.nombre}
                </h3>

                <p className="text-white/60 text-sm mb-4 leading-relaxed">
                  {fac.descripcion}
                </p>

                {/* Tags de programas */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {fac.programas.map(prog => (
                    <span key={prog} className="px-2 py-0.5 bg-white/10 rounded-md text-xs text-white/70">
                      {prog}
                    </span>
                  ))}
                </div>

                {/* Link ver más */}
                <button className="flex items-center gap-1 text-sm font-semibold 
                                   text-unicordoba-primary-300 hover:text-white 
                                   group-hover:gap-2 transition-all duration-200">
                  Ver programas <ArrowRight size={14} />
                </button>

                {/* Número decorativo */}
                <span className="absolute top-4 right-4 text-5xl font-black text-white/5 
                                  font-display select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#catalogo" className="btn-outline">
            <Lightbulb size={18} />
            Ver catálogo completo
            <Globe size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
