/**
 * Hub (Schema Registry) Type Definitions
 */

export interface Schema {
  id: string;
  name: string;
  namespace: string;
  version: string;
  format: 'json-schema' | 'shacl' | 'jsonld';
  content: Record<string, unknown>;
  status: 'draft' | 'published' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface Vocabulary {
  id: string;
  name: string;
  namespace: string;
  version: string;
  terms: Record<string, string>; // term -> definition
  status: 'draft' | 'published' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchemaRequest {
  name: string;
  namespace: string;
  version: string;
  format: 'json-schema' | 'shacl' | 'jsonld';
  content: Record<string, unknown>;
}

export interface UpdateSchemaRequest {
  status?: 'draft' | 'published' | 'deprecated';
  content?: Record<string, unknown>;
}

export interface CreateVocabularyRequest {
  name: string;
  namespace: string;
  version: string;
  terms: Record<string, string>;
}

export interface UpdateVocabularyRequest {
  terms?: Record<string, string>;
  status?: 'draft' | 'published' | 'deprecated';
}
