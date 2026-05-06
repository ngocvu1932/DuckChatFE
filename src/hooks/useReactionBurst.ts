import {useCallback, useEffect, useRef, useState} from 'react';

interface IReactionBurstParticle {
  id: string;
  burstId: number;
  icon: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

const BURST_DURATION = 680;
const BURST_PARTICLE_COUNT = 8;

const createReactionBurst = (icon: string, burstId: number): IReactionBurstParticle[] => {
  const baseRotation = Math.random() * 360;

  return Array.from({length: BURST_PARTICLE_COUNT}, (_, index) => {
    const angle = ((360 / BURST_PARTICLE_COUNT) * index + baseRotation + (Math.random() * 34 - 17)) * (Math.PI / 180);
    const distance = 22 + Math.random() * 22;

    return {
      id: `${burstId}-${index}-${Date.now()}`,
      burstId,
      icon,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 10 + Math.random() * 7,
      rotation: Math.random() * 140 - 70,
      delay: Math.random() * 45,
    };
  });
};

export const useReactionBurst = () => {
  const [particles, setParticles] = useState<IReactionBurstParticle[]>([]);
  const [popKey, setPopKey] = useState(0);
  const burstIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const triggerBurst = useCallback((icon: string) => {
    const burstId = burstIdRef.current + 1;
    burstIdRef.current = burstId;

    setPopKey((current) => current + 1);
    setParticles((current) => [...current, ...createReactionBurst(icon, burstId)]);

    const timer = setTimeout(() => {
      setParticles((current) => current.filter((particle) => particle.burstId !== burstId));
    }, BURST_DURATION + 120);

    timersRef.current.push(timer);
  }, []);

  return {particles, popKey, triggerBurst};
};
