import { RotateCcw, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

interface AlgoControlsProps {
  playing: boolean;
  canStepForward?: boolean;
  canStepBack?: boolean;
  speed?: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function AlgoControls({
  playing,
  canStepForward = true,
  canStepBack = false,
  speed = 1,
  onPlay,
  onPause,
  onStep,
  onStepBack,
  onReset,
  onSpeedChange,
}: AlgoControlsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap my-3">
      <Button variant="outline" size="icon" className="size-9" title="Reset" onClick={onReset}>
        <RotateCcw className="size-4" />
      </Button>
      <Button variant="outline" size="icon" className="size-9" title="Step back" disabled={!canStepBack} onClick={onStepBack}>
        <SkipBack className="size-4" />
      </Button>
      <Button variant="outline" size="icon" className="size-9" title={playing ? 'Pause' : 'Play'} onClick={playing ? onPause : onPlay}>
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <Button variant="outline" size="icon" className="size-9" title="Step forward" disabled={!canStepForward} onClick={onStep}>
        <SkipForward className="size-4" />
      </Button>
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-muted-foreground">Speed</span>
        <Select value={String(speed)} onValueChange={(v) => onSpeedChange(Number(v))}>
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPEED_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
