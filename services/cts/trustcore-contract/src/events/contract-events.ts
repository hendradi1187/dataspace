import { EventEmitter } from 'events';
import type { Contract } from '../types/contract.js';

export class ContractEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Contract Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onContractCreated(listener: (contract: Contract) => void): void {
    this.on('contract:created', listener);
  }

  onContractUpdated(listener: (contract: Contract) => void): void {
    this.on('contract:updated', listener);
  }

  onContractDeleted(listener: (contractId: string) => void): void {
    this.on('contract:deleted', listener);
  }

  emitContractCreated(contract: Contract): void {
    this.emit('contract:created', contract);
  }

  emitContractUpdated(contract: Contract): void {
    this.emit('contract:updated', contract);
  }

  emitContractDeleted(contractId: string): void {
    this.emit('contract:deleted', contractId);
  }
}

export const contractEventEmitter = new ContractEventEmitter();
