/**
 * Step-based animation controller for algorithm visualizations.
 */

export interface AnimationControllerOptions {
  onStepChange?: (step: number, total: number) => void;
  onComplete?: () => void;
}

export class AnimationController {
  private steps: (() => void)[] = [];
  private currentStep = 0;
  private playing = false;
  private speed = 1;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onStepChange?: (step: number, total: number) => void;
  private onComplete?: () => void;

  constructor(options: AnimationControllerOptions = {}) {
    this.onStepChange = options.onStepChange;
    this.onComplete = options.onComplete;
  }

  setSteps(steps: (() => void)[]): void {
    this.pause();
    this.steps = steps;
    this.currentStep = 0;
    this.notifyStepChange();
  }

  play(): void {
    if (this.playing) return;
    if (this.currentStep >= this.steps.length) return;

    this.playing = true;
    this.startInterval();
  }

  pause(): void {
    this.playing = false;
    this.clearInterval();
  }

  step(): void {
    if (this.currentStep >= this.steps.length) return;

    this.steps[this.currentStep]();
    this.currentStep++;
    this.notifyStepChange();

    if (this.currentStep >= this.steps.length) {
      this.playing = false;
      this.clearInterval();
      this.onComplete?.();
    }
  }

  stepBack(): void {
    if (this.currentStep <= 0) return;

    this.currentStep--;
    // Re-execute all steps from 0 to currentStep to reconstruct state
    // The caller is responsible for resetting visual state and replaying.
    // We just decrement and notify — the step functions should be idempotent
    // or the caller should handle re-rendering from scratch.
    this.notifyStepChange();
  }

  reset(): void {
    this.pause();
    this.currentStep = 0;
    this.notifyStepChange();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    if (this.playing) {
      this.clearInterval();
      this.startInterval();
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getTotalSteps(): number {
    return this.steps.length;
  }

  destroy(): void {
    this.pause();
    this.steps = [];
    this.onStepChange = undefined;
    this.onComplete = undefined;
  }

  private startInterval(): void {
    this.clearInterval();
    const ms = 1000 / this.speed;
    this.intervalId = setInterval(() => {
      this.step();
      if (!this.playing) {
        this.clearInterval();
      }
    }, ms);
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private notifyStepChange(): void {
    this.onStepChange?.(this.currentStep, this.steps.length);
  }
}
