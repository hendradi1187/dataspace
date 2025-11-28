import { EventEmitter } from 'events';
import type { Policy } from '../types/policy.js';

export class PolicyEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Policy Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onPolicyCreated(listener: (policy: Policy) => void): void {
    this.on('policy:created', listener);
  }

  onPolicyUpdated(listener: (policy: Policy) => void): void {
    this.on('policy:updated', listener);
  }

  onPolicyDeleted(listener: (policyId: string) => void): void {
    this.on('policy:deleted', listener);
  }

  emitPolicyCreated(policy: Policy): void {
    this.emit('policy:created', policy);
  }

  emitPolicyUpdated(policy: Policy): void {
    this.emit('policy:updated', policy);
  }

  emitPolicyDeleted(policyId: string): void {
    this.emit('policy:deleted', policyId);
  }
}

export const policyEventEmitter = new PolicyEventEmitter();
