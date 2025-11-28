/**
 * Event types and schemas for dataspace domain events
 */

export enum EventType {
  // Participant Events
  PARTICIPANT_CREATED = 'participant.created',
  PARTICIPANT_UPDATED = 'participant.updated',
  PARTICIPANT_DELETED = 'participant.deleted',

  // Dataset Events
  DATASET_CREATED = 'dataset.created',
  DATASET_UPDATED = 'dataset.updated',
  DATASET_PUBLISHED = 'dataset.published',

  // Policy Events
  POLICY_CREATED = 'policy.created',
  POLICY_UPDATED = 'policy.updated',
  POLICY_ACTIVATED = 'policy.activated',
  POLICY_REVOKED = 'policy.revoked',

  // Contract Events
  CONTRACT_PROPOSED = 'contract.proposed',
  CONTRACT_ACCEPTED = 'contract.accepted',
  CONTRACT_REJECTED = 'contract.rejected',
  CONTRACT_TERMINATED = 'contract.terminated',

  // Compliance Events
  COMPLIANCE_AUDIT_STARTED = 'compliance.audit.started',
  COMPLIANCE_AUDIT_COMPLETED = 'compliance.audit.completed',
  COMPLIANCE_VIOLATION_DETECTED = 'compliance.violation.detected',

  // Transaction Events
  TRANSACTION_INITIATED = 'transaction.initiated',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',

  // Data Exchange Events
  DATA_REQUESTED = 'data.requested',
  DATA_PROVIDED = 'data.provided',
  DATA_RECEIVED = 'data.received',

  // Clearing Events
  CLEARING_INITIATED = 'clearing.initiated',
  CLEARING_COMPLETED = 'clearing.completed',

  // Service Events
  SERVICE_HEALTH_CHANGED = 'service.health.changed',
  SERVICE_ERROR_OCCURRED = 'service.error.occurred',
}

export interface DomainEvent {
  eventId: string;
  eventType: EventType;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  version: number;
  userId?: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ParticipantCreatedEvent extends DomainEvent {
  data: {
    participantId: string;
    did: string;
    name: string;
    description?: string;
    sector?: string;
  };
}

export interface DatasetCreatedEvent extends DomainEvent {
  data: {
    datasetId: string;
    participantId: string;
    name: string;
    schema: string;
    category: string;
  };
}

export interface PolicyCreatedEvent extends DomainEvent {
  data: {
    policyId: string;
    name: string;
    rules: Record<string, unknown>;
  };
}

export interface ContractProposedEvent extends DomainEvent {
  data: {
    contractId: string;
    proposer: string;
    respondent: string;
    terms: Record<string, unknown>;
  };
}

export interface TransactionInitiatedEvent extends DomainEvent {
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    parties: string[];
  };
}

export interface ClearingCompletedEvent extends DomainEvent {
  data: {
    clearingId: string;
    totalAmount: number;
    settledTransactions: number;
    date: Date;
  };
}

export const EventTopics = {
  PARTICIPANTS: 'dataspace.participants',
  DATASETS: 'dataspace.datasets',
  POLICIES: 'dataspace.policies',
  CONTRACTS: 'dataspace.contracts',
  COMPLIANCE: 'dataspace.compliance',
  TRANSACTIONS: 'dataspace.transactions',
  DATA_EXCHANGE: 'dataspace.data-exchange',
  CLEARING: 'dataspace.clearing',
  SYSTEM: 'dataspace.system',
};

export const TopicConfigs = [
  { name: EventTopics.PARTICIPANTS, partitions: 3, replicationFactor: 1 },
  { name: EventTopics.DATASETS, partitions: 3, replicationFactor: 1 },
  { name: EventTopics.POLICIES, partitions: 1, replicationFactor: 1 },
  { name: EventTopics.CONTRACTS, partitions: 2, replicationFactor: 1 },
  { name: EventTopics.COMPLIANCE, partitions: 1, replicationFactor: 1 },
  { name: EventTopics.TRANSACTIONS, partitions: 3, replicationFactor: 1 },
  { name: EventTopics.DATA_EXCHANGE, partitions: 5, replicationFactor: 1 },
  { name: EventTopics.CLEARING, partitions: 1, replicationFactor: 1 },
  { name: EventTopics.SYSTEM, partitions: 1, replicationFactor: 1 },
];
