import { EventEmitter } from 'events';
import type { Compliance } from '../types/compliance.js';

export class ComplianceEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Compliance Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onComplianceCreated(listener: (compliance: Compliance) => void): void {
    this.on('compliance:created', listener);
  }

  onComplianceUpdated(listener: (compliance: Compliance) => void): void {
    this.on('compliance:updated', listener);
  }

  onComplianceDeleted(listener: (complianceId: string) => void): void {
    this.on('compliance:deleted', listener);
  }

  emitComplianceCreated(compliance: Compliance): void {
    this.emit('compliance:created', compliance);
  }

  emitComplianceUpdated(compliance: Compliance): void {
    this.emit('compliance:updated', compliance);
  }

  emitComplianceDeleted(complianceId: string): void {
    this.emit('compliance:deleted', complianceId);
  }
}

export const complianceEventEmitter = new ComplianceEventEmitter();
