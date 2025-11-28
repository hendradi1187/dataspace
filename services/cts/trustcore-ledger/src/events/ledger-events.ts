import { EventEmitter } from 'events';
import type { Ledger } from '../types/ledger.js';

export class LedgerEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Ledger Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onLedgerCreated(listener: (ledger: Ledger) => void): void {
    this.on('ledger:created', listener);
  }

  onLedgerUpdated(listener: (ledger: Ledger) => void): void {
    this.on('ledger:updated', listener);
  }

  onLedgerDeleted(listener: (ledgerId: string) => void): void {
    this.on('ledger:deleted', listener);
  }

  emitLedgerCreated(ledger: Ledger): void {
    this.emit('ledger:created', ledger);
  }

  emitLedgerUpdated(ledger: Ledger): void {
    this.emit('ledger:updated', ledger);
  }

  emitLedgerDeleted(ledgerId: string): void {
    this.emit('ledger:deleted', ledgerId);
  }
}

export const ledgerEventEmitter = new LedgerEventEmitter();
