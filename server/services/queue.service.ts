/**
 * Asynchronous In-Memory Queue Service
 * Handles non-blocking background jobs (Nodemailer emails, WhatsApp alerts, webhook fanout)
 * with exponential backoff and error resiliency, allowing HTTP endpoints to return immediately (< 20ms).
 */

export interface QueueJob<T = any> {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  maxRetries: number;
  createdAt: number;
}

type JobHandler<T = any> = (payload: T) => Promise<any>;

class QueueService {
  private queue: QueueJob[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private processing = false;
  private concurrency = 3;
  private activeWorkers = 0;
  private stats = {
    processed: 0,
    failed: 0,
    retried: 0,
  };

  constructor() {
    // Process loop ticker
    setInterval(() => this.processNext(), 200).unref();
  }

  /**
   * Register a job handler for a specific job type.
   */
  public registerHandler<T = any>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue a job to be processed asynchronously.
   */
  public enqueue<T = any>(type: string, payload: T, maxRetries = 3): string {
    const id = 'job_' + Math.random().toString(36).substring(2, 10);
    this.queue.push({
      id,
      type,
      payload,
      attempts: 0,
      maxRetries,
      createdAt: Date.now(),
    });
    // Kick off worker immediately
    setImmediate(() => this.processNext());
    return id;
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0 || this.activeWorkers >= this.concurrency) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      console.warn(`[QueueService] No handler registered for job type "${job.type}". Dropping.`);
      this.stats.failed++;
      return;
    }

    this.activeWorkers++;

    (async () => {
      try {
        job.attempts++;
        await handler(job.payload);
        this.stats.processed++;
      } catch (err: any) {
        console.error(`[QueueService] Error executing job "${job.type}" (attempt ${job.attempts}/${job.maxRetries}):`, err?.message || err);
        if (job.attempts < job.maxRetries) {
          this.stats.retried++;
          // Exponential backoff before re-queueing
          setTimeout(() => {
            this.queue.push(job);
          }, Math.pow(2, job.attempts) * 1000);
        } else {
          this.stats.failed++;
          console.error(`[QueueService] Job "${job.type}" failed permanently after ${job.maxRetries} attempts.`);
        }
      } finally {
        this.activeWorkers--;
        this.processNext();
      }
    })();
  }

  public getStats() {
    return {
      pending: this.queue.length,
      activeWorkers: this.activeWorkers,
      processed: this.stats.processed,
      failed: this.stats.failed,
      retried: this.stats.retried,
    };
  }
}

export const queueService = new QueueService();
