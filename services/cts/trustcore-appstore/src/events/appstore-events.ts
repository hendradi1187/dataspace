import { EventEmitter } from 'events';
import type { Appstore } from '../types/appstore.js';

export class AppstoreEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Appstore Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onAppstoreCreated(listener: (appstore: Appstore) => void): void {
    this.on('appstore:created', listener);
  }

  onAppstoreUpdated(listener: (appstore: Appstore) => void): void {
    this.on('appstore:updated', listener);
  }

  onAppstoreDeleted(listener: (appstoreId: string) => void): void {
    this.on('appstore:deleted', listener);
  }

  emitAppstoreCreated(appstore: Appstore): void {
    this.emit('appstore:created', appstore);
  }

  emitAppstoreUpdated(appstore: Appstore): void {
    this.emit('appstore:updated', appstore);
  }

  emitAppstoreDeleted(appstoreId: string): void {
    this.emit('appstore:deleted', appstoreId);
  }
}

export const appstoreEventEmitter = new AppstoreEventEmitter();
