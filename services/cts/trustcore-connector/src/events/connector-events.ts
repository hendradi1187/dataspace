import { EventEmitter } from 'events';
import type { Connector } from '../types/connector.js';

export class ConnectorEventEmitter extends EventEmitter {
  emit(event: string, ...args: unknown[]): boolean {
    console.log(`[Connector Event] ${event}`, args[0]);
    return super.emit(event, ...args);
  }

  onConnectorCreated(listener: (connector: Connector) => void): void {
    this.on('connector:created', listener);
  }

  onConnectorUpdated(listener: (connector: Connector) => void): void {
    this.on('connector:updated', listener);
  }

  onConnectorDeleted(listener: (connectorId: string) => void): void {
    this.on('connector:deleted', listener);
  }

  emitConnectorCreated(connector: Connector): void {
    this.emit('connector:created', connector);
  }

  emitConnectorUpdated(connector: Connector): void {
    this.emit('connector:updated', connector);
  }

  emitConnectorDeleted(connectorId: string): void {
    this.emit('connector:deleted', connectorId);
  }
}

export const connectorEventEmitter = new ConnectorEventEmitter();
