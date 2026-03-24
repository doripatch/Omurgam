import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { X, Info } from 'lucide-react';

interface Vertebra {
  id: string;
  name: string;
  position: [number, number, number];
  info: string;
}

const vertebrae: Vertebra[] = [
  // Cervical (Boyun) - C1 to C7
  { id: 'C1', name: 'Atlas (C1)', position: [0, 3.5, 0], info: 'Kafatasını taşıyan ilk boyun omuru. Baş hareketlerini sağlar.' },
  { id: 'C2', name: 'Axis (C2)', position: [0, 3.2, 0], info: 'Başın dönme hareketini sağlar.' },
  { id: 'C3', name: 'C3', position: [0, 2.9, 0], info: '3. boyun omuru' },
  { id: 'C4', name: 'C4', position: [0, 2.6, 0], info: '4. boyun omuru' },
  { id: 'C5', name: 'C5', position: [0, 2.3, 0], info: '5. boyun omuru' },
  { id: 'C6', name: 'C6', position: [0, 2.0, 0], info: '6. boyun omuru' },
  { id: 'C7', name: 'C7 (Prominens)', position: [0, 1.7, 0], info: 'En çıkık boyun omuru, kolayca hissedilebilir.' },
  
  // Thoracic (Göğüs) - T1 to T12
  { id: 'T1', name: 'T1', position: [0, 1.4, 0], info: '1. göğüs omuru' },
  { id: 'T2', name: 'T2', position: [0, 1.1, 0], info: '2. göğüs omuru' },
  { id: 'T3', name: 'T3', position: [0, 0.8, 0], info: '3. göğüs omuru' },
  { id: 'T4', name: 'T4', position: [0, 0.5, 0], info: '4. göğüs omuru' },
  { id: 'T5', name: 'T5', position: [0, 0.2, 0], info: '5. göğüs omuru' },
  { id: 'T6', name: 'T6', position: [0, -0.1, 0], info: '6. göğüs omuru' },
  { id: 'T7', name: 'T7', position: [0, -0.4, 0], info: '7. göğüs omuru' },
  { id: 'T8', name: 'T8', position: [0, -0.7, 0], info: '8. göğüs omuru' },
  { id: 'T9', name: 'T9', position: [0, -1.0, 0], info: '9. göğüs omuru' },
  { id: 'T10', name: 'T10', position: [0, -1.3, 0], info: '10. göğüs omuru' },
  { id: 'T11', name: 'T11', position: [0, -1.6, 0], info: '11. göğüs omuru' },
  { id: 'T12', name: 'T12', position: [0, -1.9, 0], info: '12. göğüs omuru' },
  
  // Lumbar (Bel) - L1 to L5
  { id: 'L1', name: 'L1', position: [0, -2.2, 0], info: '1. bel omuru' },
  { id: 'L2', name: 'L2', position: [0, -2.5, 0], info: '2. bel omuru' },
  { id: 'L3', name: 'L3', position: [0, -2.8, 0], info: '3. bel omuru' },
  { id: 'L4', name: 'L4', position: [0, -3.1, 0], info: '4. bel omuru - Sık ağrı bölgesi' },
  { id: 'L5', name: 'L5', position: [0, -3.4, 0], info: '5. bel omuru - Sık ağrı bölgesi' },
  
  // Sacral (Kuyruk sokumu)
  { id: 'S1', name: 'Sakrum', position: [0, -3.8, 0], info: 'Kaynaşmış kuyruk sokumu omurları' },
];

function VertebraModel({ vertebra, isSelected, onClick }: { vertebra: Vertebra; isSelected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.rotation.y += 0.005;
      
      // Scale on hover/select
      const targetScale = isSelected ? 1.3 : hovered ? 1.15 : 1;
      const currentScale = meshRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.1;
      meshRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  // Determine color based on region
  let color = '#d4a574'; // default beige
  if (vertebra.id.startsWith('C')) color = '#c2956e'; // cervical - lighter brown
  if (vertebra.id.startsWith('T')) color = '#a67c52'; // thoracic - medium brown
  if (vertebra.id.startsWith('L')) color = '#8b6239'; // lumbar - darker brown
  if (vertebra.id.startsWith('S')) color = '#6b4423'; // sacral - darkest brown

  return (
    <group position={vertebra.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.15, 0.18, 0.2, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#f59e0b' : hovered ? '#fb923c' : color}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0.4, 0, 0]}
        fontSize={0.12}
        color={isSelected ? '#f59e0b' : '#4a5568'}
        anchorX="left"
        anchorY="middle"
      >
        {vertebra.name}
      </Text>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" wireframe opacity={0.3} transparent />
        </mesh>
      )}
    </group>
  );
}

function SpineScene({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {vertebrae.map((vertebra) => (
        <VertebraModel
          key={vertebra.id}
          vertebra={vertebra}
          isSelected={selectedId === vertebra.id}
          onClick={() => onSelect(vertebra.id)}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function InteractiveSpine() {
  const [selectedVertebra, setSelectedVertebra] = useState<Vertebra | null>(null);

  const handleSelect = (id: string) => {
    const vertebra = vertebrae.find(v => v.id === id);
    setSelectedVertebra(vertebra || null);
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SpineScene selectedId={selectedVertebra?.id || null} onSelect={handleSelect} />
        </Suspense>
      </Canvas>
      
      {/* Info Panel */}
      {selectedVertebra && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-sm"
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
      
      {/* Instructions */}
      <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3">
        <p className="text-sm text-white font-medium">
          🖱️ Döndürmek için sürükle • 🔍 Zoom için kaydır • 👆 Omura tıkla
        </p>
      </div>
    </div>
  );
}
