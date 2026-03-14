import { TrendingUp, Users, BookOpen, Award, MapPin, Globe2 } from 'lucide-react';

const stats = [
  { icon: Users, value: '30,000+', label: 'Estudiantes Activos', color: 'text-green-400' },
  { icon: BookOpen, value: '70+', label: 'Programas Académicos', color: 'text-teal-400' },
  { icon: Award, value: '1966', label: 'Año de Fundación', color: 'text-amber-400' },
  { icon: TrendingUp, value: '95%', label: 'Empleabilidad Egresados', color: 'text-emerald-400' },
  { icon: MapPin, value: '8', label: 'Sedes Departamentales', color: 'text-cyan-400' },
  { icon: Globe2, value: '50+', label: 'Convenios Internacionales', color: 'text-blue-400' },
];

export default function Stats() {
  return (
    <section id="estadisticas" className="py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Fondo gradiente */}
      <div className="absolute inset-0 bg-unicordoba-gradient opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Titulo */}
        <div className="text-center mb-14">
          <span className="badge-green mb-4 inline-flex">
            <TrendingUp size={13} />
            En Números
          </span>
          <h2 className="section-title">
            UniCórdoba en <span className="text-gradient-green">Cifras</span>
          </h2>
          <div className="divider-green mx-auto" />
        </div>

        {/* Grid stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{ animationDelay: `${i * 0.1}s` }}
                className="card group text-center animate-fade-in"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 
                                rounded-2xl bg-white/5 mb-4 mx-auto
                                group-hover:scale-110 group-hover:bg-unicordoba-primary/20 
                                transition-all duration-300">
                  <Icon size={28} className={stat.color} />
                </div>
                <p className={`text-3xl md:text-4xl font-display font-black mb-1 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Banner inferior */}
        <div className="mt-12 card-gradient p-8 rounded-3xl text-center">
          <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-3">
            ¿Listo para ser parte de la familia UniCórdoba?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Inscríbete a nuestros programas de pregrado y posgrado. 
            Transformamos vidas y construimos el futuro del Caribe colombiano.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#inscripcion"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-unicordoba-primary 
                         font-bold rounded-xl hover:bg-unicordoba-primary-50 
                         transition-all duration-200 hover:-translate-y-0.5 shadow-xl"
            >
              Inscribirme Ahora →
            </a>
            <a
              href="#info"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white 
                         font-semibold rounded-xl border border-white/20
                         hover:bg-white/20 transition-all duration-200"
            >
              Más Información
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
