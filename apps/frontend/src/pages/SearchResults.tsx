import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Clock, Trash2 } from 'lucide-react';
import { useSearchStore } from '@stores/search-store';
import { useAdvancedSearch } from '@hooks/useAdvancedSearch';
import { AdvancedFilters, FilterField } from '@components/AdvancedFilters';

// Mock search data across all services
const SEARCHABLE_ITEMS = [
  // Participants
  { id: 'p1', title: 'Global Data Partners Inc', description: 'Healthcare data partner', type: 'participant', category: 'Organization' },
  { id: 'p2', title: 'Research Institute EU', description: 'Research data provider', type: 'participant', category: 'Organization' },
  { id: 'p3', title: 'FinanceData Solutions', description: 'Financial data aggregator', type: 'participant', category: 'Organization' },

  // Datasets
  { id: 'd1', title: 'Patient Records 2024', description: 'Anonymized healthcare records', type: 'dataset', category: 'Healthcare' },
  { id: 'd2', title: 'Market Analysis Data', description: 'Quarterly market insights', type: 'dataset', category: 'Finance' },
  { id: 'd3', title: 'Climate Observations', description: 'Global climate measurement data', type: 'dataset', category: 'Environment' },

  // Schemas
  { id: 's1', title: 'HL7 FHIR Schema', description: 'Healthcare interoperability standard', type: 'schema', category: 'Healthcare' },
  { id: 's2', title: 'Financial Transaction Schema', description: 'Transaction data structure', type: 'schema', category: 'Finance' },

  // Policies
  { id: 'pol1', title: 'Data Access Control Policy', description: 'Access rules for datasets', type: 'policy', category: 'Governance' },
  { id: 'pol2', title: 'Retention Policy', description: 'Data retention guidelines', type: 'policy', category: 'Governance' },

  // Contracts
  { id: 'c1', title: 'Data Sharing Agreement 2024', description: 'Bilateral data sharing terms', type: 'contract', category: 'Legal' },
  { id: 'c2', title: 'Service Level Agreement', description: 'Service availability terms', type: 'contract', category: 'Legal' },

  // Vocabularies
  { id: 'v1', title: 'Medical Terminology', description: 'ICD-10 medical codes', type: 'vocabulary', category: 'Healthcare' },
  { id: 'v2', title: 'Industry Classifications', description: 'NAICS industry codes', type: 'vocabulary', category: 'Business' },

  // Apps
  { id: 'a1', title: 'Data Analysis Dashboard', description: 'Real-time analytics application', type: 'app', category: 'Analytics' },
  { id: 'a2', title: 'Report Generator', description: 'Automated report creation tool', type: 'app', category: 'Reporting' },

  // Connectors
  { id: 'con1', title: 'PostgreSQL Connector', description: 'PostgreSQL database integration', type: 'connector', category: 'Database' },
  { id: 'con2', title: 'REST API Connector', description: 'REST endpoint integration', type: 'connector', category: 'API' },
];

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'participant', label: 'Participant' },
      { value: 'dataset', label: 'Dataset' },
      { value: 'schema', label: 'Schema' },
      { value: 'policy', label: 'Policy' },
      { value: 'contract', label: 'Contract' },
      { value: 'vocabulary', label: 'Vocabulary' },
      { value: 'app', label: 'App' },
      { value: 'connector', label: 'Connector' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'Organization', label: 'Organization' },
      { value: 'Healthcare', label: 'Healthcare' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Environment', label: 'Environment' },
      { value: 'Governance', label: 'Governance' },
      { value: 'Legal', label: 'Legal' },
      { value: 'Business', label: 'Business' },
      { value: 'Analytics', label: 'Analytics' },
      { value: 'Reporting', label: 'Reporting' },
      { value: 'Database', label: 'Database' },
      { value: 'API', label: 'API' },
    ],
  },
];

type ItemType = (typeof SEARCHABLE_ITEMS)[0];

export const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { getHistory, clearHistory } = useSearchStore();
  const searchHistory = getHistory();

  const { results } = useAdvancedSearch(SEARCHABLE_ITEMS as ItemType[], searchQuery, filters, {
    searchFields: ['title', 'description', 'category'],
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      participant: 'bg-blue-100 text-blue-900 border-blue-300',
      dataset: 'bg-purple-100 text-purple-900 border-purple-300',
      schema: 'bg-green-100 text-green-900 border-green-300',
      vocabulary: 'bg-orange-100 text-orange-900 border-orange-300',
      policy: 'bg-red-100 text-red-900 border-red-300',
      contract: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      compliance: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      transaction: 'bg-pink-100 text-pink-900 border-pink-300',
      clearing: 'bg-teal-100 text-teal-900 border-teal-300',
      app: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      connector: 'bg-lime-100 text-lime-900 border-lime-300',
    };
    return colors[type] || 'bg-neutral-100 text-neutral-900 border-neutral-300';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Organization: '🏢',
      Healthcare: '🏥',
      Finance: '💰',
      Environment: '🌍',
      Governance: '⚖️',
      Legal: '📋',
      Business: '📊',
      Analytics: '📈',
      Reporting: '📑',
      Database: '🗄️',
      API: '🔌',
    };
    return icons[category] || '📄';
  };

  const handleItemClick = (item: ItemType) => {
    // Navigate to detail page based on type
    const routes: Record<string, string> = {
      participant: '/participants',
      dataset: '/datasets',
      schema: '/schemas',
      vocabulary: '/vocabularies',
      policy: '/policies',
      contract: '/contracts',
      app: '/apps',
      connector: '/connectors',
    };
    const basePath = routes[item.type] || '/';
    navigate(`${basePath}/${item.id}`);
  };

  const groupedResults = useMemo(() => {
    return results.reduce(
      (acc, item) => {
        const type = item.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      },
      {} as Record<string, ItemType[]>
    );
  }, [results]);

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Search Results</h1>
        <p className="text-neutral-600">
          {results.length} result{results.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Search Controls */}
      <div className="flex gap-4 items-start flex-wrap">
        <div className="flex-1 min-w-80">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Refine your search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <AdvancedFilters
          fields={FILTER_FIELDS}
          onApply={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters({})}
        />
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="px-3 py-1 bg-primary-100 text-primary-900 rounded-full text-sm flex items-center gap-2">
              <span>
                {key}: {value}
              </span>
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  setFilters(newFilters);
                }}
                className="hover:text-primary-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([type, items]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3 capitalize">
                {type}s ({items.length})
              </h2>
              <div className="grid gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        {item.category && (
                          <span className="text-sm text-neutral-500 flex items-center gap-1">
                            {getCategoryIcon(item.category)} {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-neutral-50 rounded-lg border border-neutral-200">
          <Search size={32} className="mx-auto text-neutral-400 mb-3" />
          <p className="text-neutral-600 mb-1">No results found</p>
          <p className="text-sm text-neutral-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Recent Searches */}
      {searchHistory.length > 0 && results.length === 0 && !searchQuery && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Clock size={16} />
              Recent Searches
            </h3>
            <button
              onClick={() => clearHistory()}
              className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <Trash2 size={14} />
              Clear history
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 10).map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(item.query)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-sm hover:border-primary-300 transition-colors"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
