import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
  trigger: boolean;
  intensity?: 'small' | 'big';
}

export default function CelebrationOverlay({ trigger, intensity = 'small' }: CelebrationOverlayProps) {
  // If trigger is already true on mount, skip — don't replay confetti for
  // previously completed state restored from localStorage.
  const firedRef = useRef(trigger);

  useEffect(() => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      if (intensity === 'big') {
        const duration = 1500;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } else {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
        });
      }
    }

    if (!trigger) {
      firedRef.current = false;
    }
  }, [trigger, intensity]);

  return null;
}
