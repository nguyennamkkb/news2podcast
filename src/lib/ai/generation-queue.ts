import { generateScript, type GenerationEvent } from "./script-generator";

const MAX_CONCURRENT = 5;

type QueueItem = {
  projectId: string;
  promptInput: string;
  options: Record<string, unknown>;
};

class GenerationQueue {
  private active = new Map<string, AbortController>();
  private queue: QueueItem[] = [];
  private listeners = new Map<string, Set<(event: GenerationEvent) => void>>();

  subscribe(projectId: string, callback: (event: GenerationEvent) => void) {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }
    this.listeners.get(projectId)!.add(callback);
    return () => this.listeners.get(projectId)?.delete(callback);
  }

  private emit(projectId: string, event: GenerationEvent) {
    this.listeners.get(projectId)?.forEach((cb) => cb(event));
  }

  get activeCount() { return this.active.size; }
  get queueLength() { return this.queue.length; }

  get status() {
    return {
      activeCount: this.active.size,
      queueLength: this.queue.length,
      maxConcurrent: MAX_CONCURRENT,
      slotAvailable: this.active.size < MAX_CONCURRENT,
    };
  }

  async enqueue(
    projectId: string,
    promptInput: string,
    options: Record<string, unknown>
  ) {
    if (this.active.size >= MAX_CONCURRENT) {
      this.queue.push({ projectId, promptInput, options });
      this.emit(projectId, { type: "queued" });
      return;
    }
    await this.dispatch(projectId, promptInput, options);
  }

  private async dispatch(
    projectId: string,
    promptInput: string,
    options: Record<string, unknown>
  ) {
    const controller = new AbortController();
    this.active.set(projectId, controller);

    try {
      await generateScript(
        projectId,
        promptInput,
        options as Parameters<typeof generateScript>[2],
        (event) => this.emit(projectId, event)
      );
    } catch {
      // error đã emit trong generateScript
    } finally {
      this.active.delete(projectId);
      this.dispatchNext();
    }
  }

  private async dispatchNext() {
    if (this.queue.length === 0) return;
    const next = this.queue.shift()!;
    await this.dispatch(next.projectId, next.promptInput, next.options);
  }
}

export const generationQueue = new GenerationQueue();
