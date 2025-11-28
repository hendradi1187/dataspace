/**
 * Credential Event Handler
 */

import { Credential } from '../types';

export class CredentialEventHandler {
  async onCredentialCreated(credential: Credential) {
    console.log(`[Event] Credential created: ${credential.id} (${credential.clientId})`);
    // TODO: Emit to event bus
  }

  async onCredentialRevoked(credential: Credential) {
    console.log(`[Event] Credential revoked: ${credential.id} (${credential.clientId})`);
    // TODO: Emit to event bus
  }

  async onCredentialExpired(credential: Credential) {
    console.log(`[Event] Credential expired: ${credential.id} (${credential.clientId})`);
    // TODO: Emit to event bus
  }

  async onScopeChanged(credential: Credential, oldScopes: string[], newScopes: string[]) {
    console.log(`[Event] Credential scope changed: ${credential.id}`);
    // TODO: Emit to event bus
  }
}
