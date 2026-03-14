/**
 * Icono de la Universidad de Córdoba
 */
export default function UnicordobaLogo({ size = 40, className = '', showText = false, color = 'blue' }) {
  const mainColor = color === 'white' ? '#FFFFFF' : '#1e40af';
  const secondaryColor = '#f97316';
  const accentColor = '#3b82f6';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo decorativo exterior con puntitos */}
        <circle cx="100" cy="90" r="75" stroke={mainColor} strokeWidth="8" />
        <circle cx="178" cy="90" r="4" fill={secondaryColor} />
        <circle cx="22" cy="90" r="4" fill={accentColor} opacity="0.6" />
        <circle cx="160" cy="140" r="3" fill={secondaryColor} opacity="0.4" />
        <circle cx="40" cy="140" r="3" fill={accentColor} />
        
        {/* Estela/Brillo circular */}
        <path d="M175,90 A75,75 0 0,1 100,165" stroke={secondaryColor} strokeWidth="2" strokeDasharray="4 8" />
        <path d="M25,90 A75,75 0 0,1 100,15" stroke={accentColor} strokeWidth="2" strokeDasharray="4 8" />

        {/* Avatar - Fondo del cuerpo */}
        <clipPath id="avatarClip">
          <circle cx="100" cy="90" r="67" />
        </clipPath>
        
        <g clipPath="url(#avatarClip)">
          {/* Cuerpo (Hombros) - Mitad azul, mitad naranja */}
          <path d="M40,160 Q40,110 100,110 L100,160 Z" fill={accentColor} />
          <path d="M160,160 Q160,110 100,110 L100,160 Z" fill={secondaryColor} />
          
          {/* Cabeza / Cara */}
          <circle cx="100" cy="85" r="35" fill="#ffedd5" /> {/* Piel */}
          <path d="M100,50 Q135,50 135,85 Q135,100 100,100 Q65,100 65,85 Q65,50 100,50" fill={mainColor} /> {/* Cabello */}
          <circle cx="100" cy="85" r="30" fill="#ffedd5" /> {/* Cara interna */}
          
          {/* Ojos y Sonrisa */}
          <circle cx="88" cy="88" r="3" fill={mainColor} />
          <circle cx="112" cy="88" r="3" fill={mainColor} />
          <path d="M90,100 Q100,108 110,100" stroke={mainColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Candado Frontal */}
        <g id="padlock" transform="translate(65, 120)">
          {/* Grillete (Arco) */}
          <path d="M15,15 V5 A20,20 0 0,1 55,5 V15" stroke={mainColor} strokeWidth="6" fill="none" />
          {/* Cuerpo del candado */}
          <rect x="0" y="15" width="70" height="55" rx="10" fill={secondaryColor} />
          <rect x="5" y="20" width="60" height="45" rx="8" fill="#fbbf24" opacity="0.3" />
          {/* Ojal de la llave */}
          <circle cx="35" cy="42" r="6" fill={mainColor} />
          <path d="M35,48 L35,58" stroke={mainColor} strokeWidth="4" />
        </g>
      </svg>

      {/* Textos del Logo (Opcional) */}
      {showText && (
        <div className="mt-4 text-center">
          <h1 className={`text-2xl font-black ${color === 'white' ? 'text-white' : 'text-blue-900'} tracking-tight leading-none uppercase`}>
            Universidad de Córdoba
          </h1>
          <p className={`text-sm font-bold ${color === 'white' ? 'text-white/60' : 'text-blue-800/60'} uppercase tracking-widest mt-1`}>
            Portal Académico
          </p>
        </div>
      )}
    </div>
  );
}

export function UnicordobaLogoFull(props) {
  return <UnicordobaLogo {...props} showText={true} />;
}
