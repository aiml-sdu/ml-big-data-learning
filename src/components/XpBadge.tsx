import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';

export default function XpBadge() {
  const { xp } = useGamification();

  return (
    <AnimatePresence>
      {xp > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Badge variant="secondary" className="gap-1 tabular-nums">
            <Flame className="size-3 text-orange-500" />
            <motion.span
              key={xp}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {xp} XP
            </motion.span>
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
