/**
 * Dataset Type Definitions
 */

export interface Dataset {
  id: string;
  participantId: string;
  name: string;
  description?: string;
  schemaRef?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDatasetRequest {
  participantId: string;
  name: string;
  description?: string;
  schemaRef?: string;
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
  schemaRef?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface DatasetResponse {
  data: Dataset;
  status: number;
}

export interface PaginatedDatasetsResponse {
  data: Dataset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
