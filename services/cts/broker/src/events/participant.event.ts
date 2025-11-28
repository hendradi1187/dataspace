/**
 * Participant Event Handler
 * Emits events when participant actions occur
 */

import { Participant } from '../types/participant';

export class ParticipantEventHandler {
  /**
   * Emitted when a participant is created
   */
  async onParticipantCreated(participant: Participant) {
    console.log(`[Event] Participant created: ${participant.id} (${participant.name})`);
    // TODO: Emit to event bus/message queue
    // eventBus.emit('participant.created', { participant });
  }

  /**
   * Emitted when a participant is updated
   */
  async onParticipantUpdated(oldParticipant: Participant, newParticipant: Participant) {
    console.log(`[Event] Participant updated: ${newParticipant.id} (${newParticipant.name})`);
    // TODO: Emit to event bus/message queue
    // eventBus.emit('participant.updated', { oldParticipant, newParticipant });
  }

  /**
   * Emitted when a participant is deleted
   */
  async onParticipantDeleted(participant: Participant) {
    console.log(`[Event] Participant deleted: ${participant.id} (${participant.name})`);
    // TODO: Emit to event bus/message queue
    // eventBus.emit('participant.deleted', { participant });
  }

  /**
   * Emitted when a participant status changes
   */
  async onParticipantStatusChanged(
    participant: Participant,
    oldStatus: string,
    newStatus: string
  ) {
    console.log(
      `[Event] Participant status changed: ${participant.id} from ${oldStatus} to ${newStatus}`
    );
    // TODO: Emit to event bus/message queue
    // eventBus.emit('participant.status.changed', { participant, oldStatus, newStatus });
  }
}
