import { useEffect, useRef } from 'react';
import styles from './Confetti.module.css';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 颜色方案 - 职业蓝调主题
    const colors = [
      '#3b82f6', // primary
      '#06b6d4', // info
      '#10b981', // success
      '#f59e0b', // warning
      '#8b5cf6', // purple
    ];

    // 创建粒子
    const particleCount = 150;
    const particles: Particle[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 5 + Math.random() * 10;

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
      });
    }

    particlesRef.current = particles;

    let frame = 0;
    const maxFrames = 200;

    const animate = () => {
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // 重力
        particle.vx *= 0.99; // 空气阻力
        particle.rotation += particle.rotationSpeed;

        // 绘制粒子
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);

        // 绘制方块
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);

        ctx.restore();
      });

      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.confetti}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    />
  );
}
