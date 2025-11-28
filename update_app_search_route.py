#!/usr/bin/env python3

app_content = '''import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { HealthDashboard } from '@/pages/HealthDashboard';
import { Participants } from '@/pages/Participants';
import { ParticipantDetail } from '@/pages/ParticipantDetail';
import { Datasets } from '@/pages/Datasets';
import { DatasetDetail } from '@/pages/DatasetDetail';
import { Schemas } from '@/pages/Schemas';
import { SchemaDetail } from '@/pages/SchemaDetail';
import { Vocabularies } from '@/pages/Vocabularies';
import { VocabularyDetail } from '@/pages/VocabularyDetail';
import { Policies } from '@/pages/Policies';
import { PolicyDetail } from '@/pages/PolicyDetail';
import { Contracts } from '@/pages/Contracts';
import { ContractDetail } from '@/pages/ContractDetail';
import { ComplianceRecords } from '@/pages/ComplianceRecords';
import { ComplianceRecordDetail } from '@/pages/ComplianceRecordDetail';
import { Transactions } from '@/pages/Transactions';
import { TransactionDetail } from '@/pages/TransactionDetail';
import { ClearingRecords } from '@/pages/ClearingRecords';
import { ClearingRecordDetail } from '@/pages/ClearingRecordDetail';
import { Apps } from '@/pages/Apps';
import { AppDetail } from '@/pages/AppDetail';
import { Connectors } from '@/pages/Connectors';
import { ConnectorDetail } from '@/pages/ConnectorDetail';
import { SearchResults } from '@/pages/SearchResults';

export const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<HealthDashboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/participants/:id" element={<ParticipantDetail />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/schemas" element={<Schemas />} />
          <Route path="/schemas/:id" element={<SchemaDetail />} />
          <Route path="/vocabularies" element={<Vocabularies />} />
          <Route path="/vocabularies/:id" element={<VocabularyDetail />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/policies/:id" element={<PolicyDetail />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/compliance-records" element={<ComplianceRecords />} />
          <Route path="/compliance-records/:id" element={<ComplianceRecordDetail />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/clearing-records" element={<ClearingRecords />} />
          <Route path="/clearing-records/:id" element={<ClearingRecordDetail />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:id" element={<AppDetail />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/connectors/:id" element={<ConnectorDetail />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
'''

filepath = 'D:/BMAD-METHOD/dataspace/apps/frontend/src/App.tsx'
with open(filepath, 'w') as f:
    f.write(app_content)

print("Updated App.tsx with SearchResults route")
print("New route: /search -> SearchResults")
