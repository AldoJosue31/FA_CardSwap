import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; 
  vx: number;
  vy: number;
  vz: number; 
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  isGrounded: boolean;
  groundTimer: number;
  opacity: number;
}

// Colores separados: Predomina Azul (con acentos institucionales) abajo, Rojo arriba
const USER_COLORS = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#f97316', '#ffffff', '#e2e8f0'];
const RIVAL_COLORS = ['#ef4444', '#ef4444', '#ef4444', '#ef4444', '#f97316', '#ffffff', '#e2e8f0'];

interface StadiumConfettiProps {
  isGoal: boolean;
  isDefense: boolean; // NUEVO: Saber si hubo defensa exitosa
  activeSide: 'top' | 'bottom' | null; // Lado desde donde saldrá la explosión
}

export default function StadiumConfetti({ isGoal, isDefense, activeSide }: StadiumConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  
  // Refs para evitar re-renderizados del DOM en el loop de requestAnimationFrame
  const isGoalRef = useRef(isGoal);
  const isDefenseRef = useRef(isDefense);
  const activeSideRef = useRef(activeSide);
  const prevEventRef = useRef(false);

  useEffect(() => {
    isGoalRef.current = isGoal;
    isDefenseRef.current = isDefense;
    activeSideRef.current = activeSide;
  }, [isGoal, isDefense, activeSide]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const spawnParticle = (isBurst: boolean, side: 'top' | 'bottom') => {
      const isTop = side === 'top';
      const colorPool = isTop ? RIVAL_COLORS : USER_COLORS;

      particlesRef.current.push({
        x: Math.random() * width,
        y: isTop ? -20 : height + 20,
        z: isBurst ? Math.random() * 80 + 40 : Math.random() * 30 + 30, // Altura inicial
        vx: (Math.random() - 0.5) * (isBurst ? 14 : 3),
        vy: isTop 
            ? (Math.random() * (isBurst ? 20 : 2.5) + 1) 
            : -(Math.random() * (isBurst ? 20 : 2.5) + 1),
        vz: isBurst ? Math.random() * 5 + 2 : Math.random() * 2, // Salto hacia arriba
        w: Math.random() * 7 + 4,
        h: Math.random() * 10 + 5,
        color: colorPool[Math.floor(Math.random() * colorPool.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        isGrounded: false,
        groundTimer: Math.random() * 300 + 150, // Tiempo anclado al pasto
        opacity: 1
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Detección de Evento (Gol o Defensa exitosa)
      if ((isGoalRef.current || isDefenseRef.current) && !prevEventRef.current) {
        prevEventRef.current = true;
        const side = activeSideRef.current;
        
        if (side) {
          // Si es Gol salen 150, si es Defensa salen 50
          const particleCount = isGoalRef.current ? 150 : 50;
          for (let i = 0; i < particleCount; i++) spawnParticle(true, side);
        }
      } else if (!isGoalRef.current && !isDefenseRef.current) {
        prevEventRef.current = false;
      }

      // 2. Caída ambiental normal lenta
      if (Math.random() < 0.03) spawnParticle(false, 'top');
      if (Math.random() < 0.03) spawnParticle(false, 'bottom');

      // 3. Físicas y Renderizado
      particlesRef.current.forEach((p) => {
        if (!p.isGrounded) {
          p.x += p.vx + (Math.sin(p.y * 0.02) * 0.5); 
          p.y += p.vy;
          p.z += p.vz;
          p.vz -= 0.15; // Gravedad

          p.vx *= 0.98; // Fricción
          p.vy *= 0.98;

          p.rotation += p.rotationSpeed;

          if (p.z <= 0) {
            p.z = 0;
            p.isGrounded = true;
          }
        } else {
          p.groundTimer--;
          if (p.groundTimer <= 0) {
            p.opacity -= 0.02; 
          }
        }

        // ==========================================
        // OPTIMIZACIÓN CRÍTICA: SOMBRAS FALSAS
        // ==========================================
        ctx.save();
        ctx.globalAlpha = p.opacity;
        
        ctx.translate(p.x, p.y);
        
        const flip = Math.cos(p.rotation);
        ctx.scale(1, flip);
        ctx.rotate(p.rotation * 0.5);

        // A) Dibujamos la sombra falsa (Un cuadro negro desplazado)
        const shadowOffset = p.isGrounded ? 1 : p.z / 3;
        ctx.fillStyle = p.isGrounded ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect((-p.w / 2) + shadowOffset, (-p.h / 2) + shadowOffset, p.w, p.h);

        // B) Dibujamos el papel de color encima de la sombra
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        
        ctx.restore();
      });

      // Limpieza de memoria
      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[2] pointer-events-none"
    />
  );
}