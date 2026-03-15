import { useState } from 'react';
import { Type, Hash, Cpu, Smile, X } from 'lucide-react';

const SYMBOLS = {
  logic: {
    name: 'Lógica',
    icon: <Type size={14} />,
    chars: ['∧', '∨', '¬', '→', '↔', '⊕', '≡', '∴', '∵', '⊤', '⊥']
  },
  inference: {
    name: 'Inferencia',
    icon: <Hash size={14} />,
    chars: ['⊢', '⊨', '∀', '∃', '∈', '∉', '⊂', '⊃', '∩', '∪', '⊆', '⊇']
  },
  electronics: {
    name: 'Electrónica',
    icon: <Cpu size={14} />,
    chars: ['Ω', 'µ', 'π', '∆', '∑', '∞', '√', '∠', '∥', '∫', '≈', '≠']
  },
  emojis: {
    name: 'Emojis',
    icon: <Smile size={14} />,
    chars: ['😀', '🚀', '✅', '❌', '📝', '💡', '🤔', '👍', '🔥', '✨', '🎓', '📚']
  }
};

export default function SymbolPicker({ onSelect, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logic');

  const handleSelect = (char) => {
    onSelect(char);
    // Keep open for multiple selections if needed, current implementation: close after select
    // setIsOpen(false); 
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all flex items-center justify-center text-white/60 hover:text-white"
        title="Insertar símbolo"
      >
        <div className="flex -space-x-1">
          <span className="text-[10px] font-bold">∑</span>
          <Smile size={12} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 glass rounded-2xl border border-white/10 shadow-2xl z-[100] animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Símbolos y Emojis</span>
             <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
               <X size={14} />
             </button>
          </div>

          <div className="flex p-1 bg-black/20">
            {Object.keys(SYMBOLS).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
                  activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'
                }`}
                title={SYMBOLS[tab].name}
              >
                {SYMBOLS[tab].icon}
              </button>
            ))}
          </div>

          <div className="p-3 grid grid-cols-6 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
            {SYMBOLS[activeTab].chars.map((char, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(char)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-unicordoba-primary hover:text-white transition-all text-lg"
              >
                {char}
              </button>
            ))}
          </div>
          
          <div className="p-2 bg-white/5 border-t border-white/5 text-[8px] text-center text-white/20 uppercase font-bold tracking-tighter">
            Haz clic para insertar
          </div>
        </div>
      )}
    </div>
  );
}
