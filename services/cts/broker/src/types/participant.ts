/**
 * Participant Type Definitions
 */

export interface Participant {
  id: string;
  did: string;
  name: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipantRequest {
  did: string;
  name: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
}

export interface UpdateParticipantRequest {
  name?: string;
  description?: string;
  endpointUrl?: string;
  publicKey?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ParticipantResponse {
  data: Participant;
  status: number;
}

export interface PaginatedParticipantsResponse {
  data: Participant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
