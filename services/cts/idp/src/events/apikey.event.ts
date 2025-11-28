/**
 * API Key Event Handler
 */

import { ApiKey } from '../types';

export class ApiKeyEventHandler {
  async onApiKeyCreated(apiKey: ApiKey) {
    console.log(`[Event] API Key created: ${apiKey.id} (${apiKey.name})`);
    // TODO: Emit to event bus
  }

  async onApiKeyRevoked(apiKey: ApiKey) {
    console.log(`[Event] API Key revoked: ${apiKey.id} (${apiKey.name})`);
    // TODO: Emit to event bus
  }

  async onApiKeyUsed(apiKey: ApiKey) {
    console.log(`[Event] API Key used: ${apiKey.id} at ${new Date().toISOString()}`);
    // TODO: Emit to event bus (for audit trail)
  }

  async onApiKeyExpired(apiKey: ApiKey) {
    console.log(`[Event] API Key expired: ${apiKey.id} (${apiKey.name})`);
    // TODO: Emit to event bus
  }
}
