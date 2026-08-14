import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  decodeState,
  encodeState,
  isValid,
  isGoal,
  INITIAL_STATE,
  ENTITIES,
  ENTITY_LABELS,
  ENTITY_ICONS,
  type Entity,
  type Side,
} from '@/lib/river-crossing';

interface RiverCrossingGameVizProps {
  onComplete: () => void;
}

type GamePhase = 'picking' | 'crossing' | 'invalid' | 'solved';

function getViolationMessage(state: string): string {
  const s = decodeState(state);
  if (s.wolf === s.goat && s.wolf !== s.farmer) return 'The wolf ate the goat!';
  if (s.goat === s.cabbage && s.goat !== s.farmer) return 'The goat ate the cabbage!';
  return '';
}

function otherSide(s: Side): Side {
  return s === 'W' ? 'E' : 'W';
}

const SPRING = { type: 'spring' as const, stiffness: 200, damping: 20 };

export default function RiverCrossingGameViz({ onComplete }: RiverCrossingGameVizProps) {
  const [currentState, setCurrentState] = useState(INITIAL_STATE);
  const [history, setHistory] = useState<string[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedPassenger, setSelectedPassenger] = useState<Entity | null>(null);
  const [phase, setPhase] = useState<GamePhase>('picking');
  const [violationMessage, setViolationMessage] = useState('');
  const [farmerDest, setViolationSide] = useState<Side | null>(null);
  const completedRef = useRef(false);

  const state = decodeState(currentState);
  const farmerSide = state.farmer;

  const handleEntityClick = useCallback(
    (entity: Entity) => {
      if (phase !== 'picking') return;
      const s = decodeState(currentState);
      // Entity must be on farmer's side
      if (s[entity] !== s.farmer) return;

      if (entity === 'farmer') {
        // Clicking farmer = deselect passenger (or just cross alone via the cross button)
        setSelectedPassenger(null);
        return;
      }

      // Toggle selection
      setSelectedPassenger((prev) => (prev === entity ? null : entity));
    },
    [phase, currentState],
  );

  const handleCross = useCallback(() => {
    if (phase !== 'picking') return;

    const s = decodeState(currentState);
    const newState = { ...s, farmer: otherSide(s.farmer) };

    if (selectedPassenger) {
      newState[selectedPassenger] = otherSide(s[selectedPassenger]);
    }

    const encoded = encodeState(newState);

    // Start crossing animation
    setPhase('crossing');

    // After animation settles, check validity
    setTimeout(() => {
      if (!isValid(newState.farmer, newState.wolf, newState.goat, newState.cabbage)) {
        // Invalid state - show violation
        const msg = getViolationMessage(encoded);
        setViolationMessage(msg);
        setViolationSide(newState.farmer); // violation is on the bank farmer just left
        setPhase('invalid');

        // Auto-undo after 1.5s
        setTimeout(() => {
          setViolationMessage('');
          setViolationSide(null);
          setSelectedPassenger(null);
          setPhase('picking');
        }, 1500);
        return;
      }

      // Valid move
      setHistory((prev) => [...prev, currentState]);
      setCurrentState(encoded);
      setMoveCount((c) => c + 1);
      setSelectedPassenger(null);

      if (isGoal(encoded)) {
        setPhase('solved');
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      } else {
        setPhase('picking');
      }
    }, 500);
  }, [phase, currentState, selectedPassenger, onComplete]);

  const handleUndo = useCallback(() => {
    if (phase !== 'picking' || history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentState(prev);
    setMoveCount((c) => c - 1);
    setSelectedPassenger(null);
  }, [phase, history]);

  const handleReset = useCallback(() => {
    setCurrentState(INITIAL_STATE);
    setHistory([]);
    setMoveCount(0);
    setSelectedPassenger(null);
    setPhase('picking');
    setViolationMessage('');
    setViolationSide(null);
    completedRef.current = false;
  }, []);

  // Determine entity positions during crossing animation
  // During crossing/invalid, show the "attempted" positions
  const displayState = (() => {
    if (phase === 'crossing' || phase === 'invalid') {
      const s = decodeState(currentState);
      const newState = { ...s, farmer: otherSide(s.farmer) };
      if (selectedPassenger) {
        newState[selectedPassenger] = otherSide(s[selectedPassenger]);
      }
      return newState;
    }
    return state;
  })();

  // Determine which entities are in the boat (during crossing)
  const boatEntities: Entity[] = [];
  if (phase === 'crossing' || phase === 'invalid') {
    boatEntities.push('farmer');
    if (selectedPassenger) boatEntities.push(selectedPassenger);
  }

  // Determine if an entity is on the boat or loaded
  const isInBoat = (entity: Entity) => {
    if (phase === 'picking' && entity === 'farmer') return false;
    if (phase === 'picking' && selectedPassenger === entity) return true;
    return false;
  };

  const renderEntity = (entity: Entity, side: 'bank' | 'boat') => {
    const icon = ENTITY_ICONS[entity];
    const label = ENTITY_LABELS[entity];
    const s = decodeState(currentState);
    const isOnFarmerSide = s[entity] === s.farmer;
    const isClickable =
      phase === 'picking' &&
      isOnFarmerSide &&
      side === 'bank' &&
      (entity === 'farmer' || !selectedPassenger || selectedPassenger === entity);
    const isSelected = selectedPassenger === entity;

    return (
      <motion.button
        key={entity}
        type="button"
        layout
        onClick={() => side === 'bank' && handleEntityClick(entity)}
        disabled={!isClickable}
        className={`flex flex-col items-center gap-1 transition-opacity ${
          isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
        } ${!isClickable && side === 'bank' ? 'opacity-50' : ''}`}
        whileHover={isClickable ? { scale: 1.1 } : undefined}
        whileTap={isClickable ? { scale: 0.95 } : undefined}
      >
        <div
          className={`size-12 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${
            isSelected
              ? 'border-primary bg-primary/20 ring-2 ring-primary ring-offset-1 ring-offset-background'
              : 'border-border bg-background'
          }`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground leading-none">
          {label}
        </span>
      </motion.button>
    );
  };

  // Collect entities for each bank and boat
  const westBankEntities = ENTITIES.filter((e) => {
    if (isInBoat(e)) return false;
    if (phase === 'crossing' || phase === 'invalid') return false; // use displayState for position
    return state[e] === 'W';
  });

  const eastBankEntities = ENTITIES.filter((e) => {
    if (isInBoat(e)) return false;
    if (phase === 'crossing' || phase === 'invalid') return false;
    return state[e] === 'E';
  });

  // For crossing/invalid animation: entities are at their destination
  const westEntitiesAnimated = ENTITIES.filter((e) => {
    if (boatEntities.includes(e)) return false;
    return displayState[e] === 'W';
  });
  const eastEntitiesAnimated = ENTITIES.filter((e) => {
    if (boatEntities.includes(e)) return false;
    return displayState[e] === 'E';
  });

  const boatLoadedEntities = phase === 'picking'
    ? ENTITIES.filter((e) => isInBoat(e))
    : [];

  // For picking phase, boat shows on farmer's side
  // For crossing, boat animates to other side
  const boatTargetSide: Side =
    phase === 'crossing' || phase === 'invalid'
      ? otherSide(farmerSide)
      : farmerSide;

  // Boat x position: west = 10%, east = 90%, centered on river
  const boatXPercent = boatTargetSide === 'W' ? 33 : 67;

  const showWest = phase === 'crossing' || phase === 'invalid' ? westEntitiesAnimated : westBankEntities;
  const showEast = phase === 'crossing' || phase === 'invalid' ? eastEntitiesAnimated : eastBankEntities;
  const showBoat = phase === 'crossing' || phase === 'invalid' ? boatEntities : boatLoadedEntities;

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleUndo}
            disabled={phase !== 'picking' || history.length === 0}
          >
            <Undo2 className="size-3" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleReset}
            disabled={phase === 'crossing'}
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Moves: {moveCount}
        </div>
      </div>

      {/* Game area */}
      <div className="relative" style={{ minHeight: 300 }}>
        {/* Three columns: west bank, river, east bank */}
        <div className="flex h-full" style={{ minHeight: 300 }}>
          {/* West Bank */}
          <div className="w-[30%] relative bg-amber-100 dark:bg-amber-950/30 flex flex-col items-center justify-center gap-3 p-4">
            <div className="absolute top-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400/70">
              West Bank
            </div>

            {/* Violation flash overlay for west */}
            <AnimatePresence>
              {phase === 'invalid' && farmerDest === 'E' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-500 pointer-events-none z-10"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {showWest.map((entity) => (
                <motion.div
                  key={entity}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={SPRING}
                >
                  {renderEntity(entity, 'bank')}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* River */}
          <div className="w-[40%] relative bg-gradient-to-b from-sky-400 to-blue-500 dark:from-sky-600 dark:to-blue-700 flex flex-col items-center justify-center">
            {/* Boat */}
            <motion.div
              animate={{ x: boatXPercent === 33 ? '-50%' : '50%' }}
              transition={SPRING}
              className="absolute flex flex-col items-center gap-1"
              style={{ top: '35%' }}
            >
              {/* Boat container */}
              <div className="bg-amber-800 dark:bg-amber-900 rounded-b-xl px-4 py-2 min-w-[80px] flex items-center justify-center gap-2 shadow-lg border-2 border-amber-700 dark:border-amber-800">
                {showBoat.length === 0 && (
                  <span className="text-amber-200 text-xs opacity-60">boat</span>
                )}
                <AnimatePresence mode="popLayout">
                  {showBoat.map((entity) => (
                    <motion.div
                      key={entity}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-2xl"
                    >
                      {ENTITY_ICONS[entity]}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Cross button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Button
                size="sm"
                onClick={handleCross}
                disabled={phase !== 'picking'}
                className="text-xs font-semibold shadow-lg"
              >
                {farmerSide === 'W' ? 'Cross River \u2192' : '\u2190 Cross River'}
              </Button>
            </div>

            {/* Water ripple decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
              <svg viewBox="0 0 400 32" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 16 Q50 8 100 16 Q150 24 200 16 Q250 8 300 16 Q350 24 400 16 V32 H0Z" fill="white" />
              </svg>
            </div>
          </div>

          {/* East Bank */}
          <div className="w-[30%] relative bg-amber-100 dark:bg-amber-950/30 flex flex-col items-center justify-center gap-3 p-4">
            <div className="absolute top-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400/70">
              East Bank
            </div>

            {/* Violation flash overlay for east */}
            <AnimatePresence>
              {phase === 'invalid' && farmerDest === 'W' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-500 pointer-events-none z-10"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {showEast.map((entity) => (
                <motion.div
                  key={entity}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={SPRING}
                >
                  {renderEntity(entity, 'bank')}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Violation message overlay */}
        <AnimatePresence>
          {phase === 'invalid' && violationMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-600 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold text-center"
            >
              <motion.div
                animate={{ x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
              >
                {violationMessage}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solved overlay */}
        <AnimatePresence>
          {phase === 'solved' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-green-500/20 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING}
                className="bg-card border-2 border-green-500 rounded-xl px-8 py-6 shadow-2xl text-center"
              >
                <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                  Puzzle Solved!
                </div>
                <div className="text-sm text-muted-foreground">
                  Solved in {moveCount} moves (Optimal: 7)
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions footer */}
      <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        {phase === 'picking' && !selectedPassenger && (
          <span>Click a character on the farmer's side to load them into the boat, then press Cross River.</span>
        )}
        {phase === 'picking' && selectedPassenger && (
          <span>
            {ENTITY_ICONS[selectedPassenger]} {ENTITY_LABELS[selectedPassenger]} is loaded. Press Cross River, or click again to deselect.
          </span>
        )}
        {phase === 'crossing' && <span>Crossing the river...</span>}
        {phase === 'invalid' && <span className="text-red-500 font-medium">{violationMessage}</span>}
        {phase === 'solved' && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            All across! You did it in {moveCount} moves.
          </span>
        )}
      </div>
    </div>
  );
}
