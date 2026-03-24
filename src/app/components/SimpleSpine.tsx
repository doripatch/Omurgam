import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';

interface Vertebra {
  id: string;
  name: string;
  position: number;
  info: string;
  region: 'cervical' | 'thoracic' | 'lumbar' | 'sacral';
}

const vertebrae: Vertebra[] = [
  // Cervical (Boyun) - C1 to C7
  { id: 'C1', name: 'Atlas (C1)', position: 0, info: 'Kafatasını taşıyan ilk boyun omuru. Baş hareketlerini sağlar.', region: 'cervical' },
  { id: 'C2', name: 'Axis (C2)', position: 1, info: 'Başın dönme hareketini sağlar.', region: 'cervical' },
  { id: 'C3', name: 'C3', position: 2, info: '3. boyun omuru', region: 'cervical' },
  { id: 'C4', name: 'C4', position: 3, info: '4. boyun omuru', region: 'cervical' },
  { id: 'C5', name: 'C5', position: 4, info: '5. boyun omuru', region: 'cervical' },
  { id: 'C6', name: 'C6', position: 5, info: '6. boyun omuru', region: 'cervical' },
  { id: 'C7', name: 'C7 (Prominens)', position: 6, info: 'En çıkık boyun omuru, kolayca hissedilebilir.', region: 'cervical' },
  
  // Thoracic (Göğüs) - T1 to T12
  { id: 'T1', name: 'T1', position: 7, info: '1. göğüs omuru', region: 'thoracic' },
  { id: 'T2', name: 'T2', position: 8, info: '2. göğüs omuru', region: 'thoracic' },
  { id: 'T3', name: 'T3', position: 9, info: '3. göğüs omuru', region: 'thoracic' },
  { id: 'T4', name: 'T4', position: 10, info: '4. göğüs omuru', region: 'thoracic' },
  { id: 'T5', name: 'T5', position: 11, info: '5. göğüs omuru', region: 'thoracic' },
  { id: 'T6', name: 'T6', position: 12, info: '6. göğüs omuru', region: 'thoracic' },
  { id: 'T7', name: 'T7', position: 13, info: '7. göğüs omuru', region: 'thoracic' },
  { id: 'T8', name: 'T8', position: 14, info: '8. göğüs omuru', region: 'thoracic' },
  { id: 'T9', name: 'T9', position: 15, info: '9. göğüs omuru', region: 'thoracic' },
  { id: 'T10', name: 'T10', position: 16, info: '10. göğüs omuru', region: 'thoracic' },
  { id: 'T11', name: 'T11', position: 17, info: '11. göğüs omuru', region: 'thoracic' },
  { id: 'T12', name: 'T12', position: 18, info: '12. göğüs omuru', region: 'thoracic' },
  
  // Lumbar (Bel) - L1 to L5
  { id: 'L1', name: 'L1', position: 19, info: '1. bel omuru', region: 'lumbar' },
  { id: 'L2', name: 'L2', position: 20, info: '2. bel omuru', region: 'lumbar' },
  { id: 'L3', name: 'L3', position: 21, info: '3. bel omuru', region: 'lumbar' },
  { id: 'L4', name: 'L4', position: 22, info: '4. bel omuru - Sık ağrı bölgesi', region: 'lumbar' },
  { id: 'L5', name: 'L5', position: 23, info: '5. bel omuru - Sık ağrı bölgesi', region: 'lumbar' },
  
  // Sacral (Kuyruk sokumu)
  { id: 'S1', name: 'Sakrum', position: 24, info: 'Kaynaşmış kuyruk sokumu omurları', region: 'sacral' },
];

const regionColors = {
  cervical: { bg: 'bg-amber-200', hover: 'hover:bg-amber-400', text: 'text-amber-900', selected: 'bg-amber-500' },
  thoracic: { bg: 'bg-orange-200', hover: 'hover:bg-orange-400', text: 'text-orange-900', selected: 'bg-orange-500' },
  lumbar: { bg: 'bg-red-200', hover: 'hover:bg-red-400', text: 'text-red-900', selected: 'bg-red-500' },
  sacral: { bg: 'bg-stone-300', hover: 'hover:bg-stone-500', text: 'text-stone-900', selected: 'bg-stone-600' },
};

export default function SimpleSpine() {
  const [selectedVertebra, setSelectedVertebra] = useState<Vertebra | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl overflow-hidden p-8">
      <div className="flex items-center justify-center h-full gap-8">
        {/* Spine Visualization */}
        <div className="relative">
          <div className="flex flex-col gap-1">
            {vertebrae.map((vertebra) => {
              const colors = regionColors[vertebra.region];
              const isSelected = selectedVertebra?.id === vertebra.id;
              const isHovered = hoveredId === vertebra.id;
              
              return (
                <motion.button
                  key={vertebra.id}
                  onClick={() => setSelectedVertebra(vertebra)}
                  onMouseEnter={() => setHoveredId(vertebra.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ scale: 1.1, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300
                    ${isSelected ? colors.selected + ' text-white shadow-lg' : colors.bg + ' ' + colors.text}
                    ${!isSelected && colors.hover}
                  `}
                >
                  <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-current'}`} />
                  <span className="font-bold text-sm whitespace-nowrap">{vertebra.name}</span>
                  
                  {(isSelected || isHovered) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 w-2 h-2 bg-amber-500 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {selectedVertebra && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedVertebra.name}</h3>
                    <p className="text-sm text-slate-600 font-medium">{selectedVertebra.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVertebra(null)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedVertebra.info}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3">
        <p className="text-sm text-white font-medium">
          👆 Omura tıklayarak bilgi alın
        </p>
      </div>

      {/* Region Legend */}
      <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-xs text-white font-medium">Boyun (Cervical)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-xs text-white font-medium">Göğüs (Thoracic)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-white font-medium">Bel (Lumbar)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-400" />
            <span className="text-xs text-white font-medium">Sakrum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
