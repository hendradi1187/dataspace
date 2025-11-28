import { EventEmitter } from 'events';
import type { Clearing } from '../types/clearing.js';

export class ClearingEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Clearing Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onClearingCreated(listener: (clearing: Clearing) => void): void {
    this.on('clearing:created', listener);
  }

  onClearingUpdated(listener: (clearing: Clearing) => void): void {
    this.on('clearing:updated', listener);
  }

  onClearingDeleted(listener: (clearingId: string) => void): void {
    this.on('clearing:deleted', listener);
  }

  emitClearingCreated(clearing: Clearing): void {
    this.emit('clearing:created', clearing);
  }

  emitClearingUpdated(clearing: Clearing): void {
    this.emit('clearing:updated', clearing);
  }

  emitClearingDeleted(clearingId: string): void {
    this.emit('clearing:deleted', clearingId);
  }
}

export const clearingEventEmitter = new ClearingEventEmitter();
