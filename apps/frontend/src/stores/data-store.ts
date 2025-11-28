import { create } from 'zustand';
import {
  Participant,
  Dataset,
  Policy,
  Contract,
  ConnectorMetadata,
  Schema,
  Vocabulary,
  ComplianceRecord,
  Transaction,
  ClearingRecord,
  App,
} from '@types';

interface DataStore {
  // Data collections
  participants: Participant[];
  datasets: Dataset[];
  policies: Policy[];
  contracts: Contract[];
  connectors: ConnectorMetadata[];
  schemas: Schema[];
  vocabularies: Vocabulary[];
  complianceRecords: ComplianceRecord[];
  transactions: Transaction[];
  clearingRecords: ClearingRecord[];
  apps: App[];

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Participants
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, participant: Partial<Participant>) => void;

  // Datasets
  setDatasets: (datasets: Dataset[]) => void;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (id: string, dataset: Partial<Dataset>) => void;

  // Policies
  setPolicies: (policies: Policy[]) => void;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, policy: Partial<Policy>) => void;

  // Contracts
  setContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;

  // Connectors
  setConnectors: (connectors: ConnectorMetadata[]) => void;
  updateConnector: (id: string, connector: Partial<ConnectorMetadata>) => void;

  // Schemas
  setSchemas: (schemas: Schema[]) => void;
  addSchema: (schema: Schema) => void;
  updateSchema: (id: string, schema: Partial<Schema>) => void;

  // Vocabularies
  setVocabularies: (vocabularies: Vocabulary[]) => void;
  addVocabulary: (vocabulary: Vocabulary) => void;
  updateVocabulary: (id: string, vocabulary: Partial<Vocabulary>) => void;

  // Compliance Records
  setComplianceRecords: (records: ComplianceRecord[]) => void;
  addComplianceRecord: (record: ComplianceRecord) => void;
  updateComplianceRecord: (id: string, record: Partial<ComplianceRecord>) => void;

  // Transactions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;

  // Clearing Records
  setClearingRecords: (records: ClearingRecord[]) => void;
  addClearingRecord: (record: ClearingRecord) => void;
  updateClearingRecord: (id: string, record: Partial<ClearingRecord>) => void;

  // Apps
  setApps: (apps: App[]) => void;
  addApp: (app: App) => void;
  updateApp: (id: string, app: Partial<App>) => void;

  // Loading and error management
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  // Initial state
  participants: [],
  datasets: [],
  policies: [],
  contracts: [],
  connectors: [],
  schemas: [],
  vocabularies: [],
  complianceRecords: [],
  transactions: [],
  clearingRecords: [],
  apps: [],
  isLoading: false,
  error: null,

  // Participants
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),
  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // Datasets
  setDatasets: (datasets) => set({ datasets }),
  addDataset: (dataset) =>
    set((state) => ({
      datasets: [...state.datasets, dataset],
    })),
  updateDataset: (id, updates) =>
    set((state) => ({
      datasets: state.datasets.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  // Policies
  setPolicies: (policies) => set({ policies }),
  addPolicy: (policy) =>
    set((state) => ({
      policies: [...state.policies, policy],
    })),
  updatePolicy: (id, updates) =>
    set((state) => ({
      policies: state.policies.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  // Contracts
  setContracts: (contracts) => set({ contracts }),
  addContract: (contract) =>
    set((state) => ({
      contracts: [...state.contracts, contract],
    })),
  updateContract: (id, updates) =>
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  // Connectors
  setConnectors: (connectors) => set({ connectors }),
  updateConnector: (id, updates) =>
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  // Schemas
  setSchemas: (schemas) => set({ schemas }),
  addSchema: (schema) =>
    set((state) => ({
      schemas: [...state.schemas, schema],
    })),
  updateSchema: (id, updates) =>
    set((state) => ({
      schemas: state.schemas.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  // Vocabularies
  setVocabularies: (vocabularies) => set({ vocabularies }),
  addVocabulary: (vocabulary) =>
    set((state) => ({
      vocabularies: [...state.vocabularies, vocabulary],
    })),
  updateVocabulary: (id, updates) =>
    set((state) => ({
      vocabularies: state.vocabularies.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),

  // Compliance Records
  setComplianceRecords: (complianceRecords) => set({ complianceRecords }),
  addComplianceRecord: (record) =>
    set((state) => ({
      complianceRecords: [...state.complianceRecords, record],
    })),
  updateComplianceRecord: (id, updates) =>
    set((state) => ({
      complianceRecords: state.complianceRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  // Transactions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  // Clearing Records
  setClearingRecords: (clearingRecords) => set({ clearingRecords }),
  addClearingRecord: (record) =>
    set((state) => ({
      clearingRecords: [...state.clearingRecords, record],
    })),
  updateClearingRecord: (id, updates) =>
    set((state) => ({
      clearingRecords: state.clearingRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  // Apps
  setApps: (apps) => set({ apps }),
  addApp: (app) =>
    set((state) => ({
      apps: [...state.apps, app],
    })),
  updateApp: (id, updates) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  // Loading and error management
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
