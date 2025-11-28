import { useState } from 'react';
import { Copy, Code2, Terminal, Check } from 'lucide-react';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    description: string;
    example: Record<string, any>;
  };
  responseExample: Record<string, any>;
  statusCodes: Array<{
    code: number;
    description: string;
  }>;
  tags?: string[];
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'participants-list',
    method: 'GET',
    path: '/api/participants',
    title: 'List Participants',
    description: 'Retrieve a list of all data participants',
    parameters: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page (default: 20)' },
      { name: 'search', type: 'string', required: false, description: 'Search by name or DID' },
    ],
    responseExample: {
      data: [
        { id: 'p1', name: 'Global Partners', did: 'did:example:1234', status: 'active' },
      ],
      pagination: { page: 1, limit: 20, total: 42 },
    },
    statusCodes: [
      { code: 200, description: 'Success' },
      { code: 401, description: 'Unauthorized' },
      { code: 500, description: 'Internal Server Error' },
    ],
    tags: ['Participants'],
  },
  {
    id: 'participants-create',
    method: 'POST',
    path: '/api/participants',
    title: 'Create Participant',
    description: 'Register a new data participant',
    requestBody: {
      description: 'Participant data',
      example: {
        name: 'New Partner',
        description: 'A new data partner',
        did: 'did:example:new',
        email: 'contact@newpartner.com',
      },
    },
    responseExample: {
      id: 'p-new',
      name: 'New Partner',
      createdAt: '2024-01-15T10:30:00Z',
    },
    statusCodes: [
      { code: 201, description: 'Created' },
      { code: 400, description: 'Bad Request' },
      { code: 401, description: 'Unauthorized' },
    ],
    tags: ['Participants'],
  },
  {
    id: 'datasets-query',
    method: 'GET',
    path: '/api/datasets/{id}',
    title: 'Get Dataset',
    description: 'Retrieve details of a specific dataset',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Dataset ID' },
    ],
    responseExample: {
      id: 'd1',
      name: 'Sales Data 2024',
      description: 'Annual sales records',
      schema: { type: 'object', properties: {} },
      owner: 'Global Partners',
      created: '2024-01-01T00:00:00Z',
    },
    statusCodes: [
      { code: 200, description: 'Success' },
      { code: 404, description: 'Not Found' },
      { code: 401, description: 'Unauthorized' },
    ],
    tags: ['Datasets'],
  },
  {
    id: 'policies-enforce',
    method: 'POST',
    path: '/api/policies/enforce',
    title: 'Enforce Policy',
    description: 'Evaluate access against a specific policy',
    requestBody: {
      description: 'Policy enforcement request',
      example: {
        policyId: 'policy-1',
        subject: { type: 'user', id: 'user-123' },
        resource: { type: 'dataset', id: 'dataset-456' },
        action: 'read',
      },
    },
    responseExample: {
      allowed: true,
      reason: 'User has read permission',
      policyId: 'policy-1',
    },
    statusCodes: [
      { code: 200, description: 'Success' },
      { code: 400, description: 'Bad Request' },
      { code: 403, description: 'Forbidden' },
    ],
    tags: ['Policies'],
  },
  {
    id: 'ledger-transaction',
    method: 'POST',
    path: '/api/ledger/transactions',
    title: 'Record Transaction',
    description: 'Record a data transaction on the ledger',
    requestBody: {
      description: 'Transaction details',
      example: {
        from: 'participant-1',
        to: 'participant-2',
        dataset: 'dataset-1',
        type: 'data-access',
        timestamp: '2024-01-15T10:30:00Z',
      },
    },
    responseExample: {
      transactionId: 'txn-abc123',
      hash: '0x1234567890abcdef',
      confirmed: true,
    },
    statusCodes: [
      { code: 201, description: 'Created' },
      { code: 400, description: 'Bad Request' },
      { code: 409, description: 'Conflict' },
    ],
    tags: ['Ledger'],
  },
];

export const APIDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(API_ENDPOINTS[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-900';
      case 'POST':
        return 'bg-green-100 text-green-900';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-900';
      case 'DELETE':
        return 'bg-red-100 text-red-900';
      case 'PATCH':
        return 'bg-purple-100 text-purple-900';
      default:
        return 'bg-neutral-100 text-neutral-900';
    }
  };

  const generateCurl = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} \\
  'http://api.dataspace.local${endpoint.path}' \\
  -H 'Authorization: Bearer YOUR_API_TOKEN' \\
  -H 'Content-Type: application/json'`;

    if (endpoint.requestBody) {
      curl += ` \\
  -d '${JSON.stringify(endpoint.requestBody.example)}'`;
    }

    return curl;
  };

  const generateJS = (endpoint: APIEndpoint) => {
    let js = `fetch('http://api.dataspace.local${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }`;

    if (endpoint.requestBody) {
      js += `,
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody.example, null, 2)})`;
    }

    js += `
})
  .then(response => response.json())
  .then(data => console.log(data));`;

    return js;
  };

  const generatePython = (endpoint: APIEndpoint) => {
    let python = `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}`;

    if (endpoint.requestBody) {
      python += `

data = ${JSON.stringify(endpoint.requestBody.example, null, 2)}

response = requests.${endpoint.method.toLowerCase()}(
    'http://api.dataspace.local${endpoint.path}',
    headers=headers,
    json=data
)`;
    } else {
      python += `

response = requests.${endpoint.method.toLowerCase()}(
    'http://api.dataspace.local${endpoint.path}',
    headers=headers
)`;
    }

    python += `

print(response.json())`;

    return python;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="bg-neutral-900 rounded-lg p-4 relative">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-4 right-4 p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
        title="Copy code"
      >
        {copiedCode === id ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-neutral-300" />}
      </button>
      <pre className="text-neutral-100 text-sm overflow-x-auto font-mono pr-12">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">API Documentation</h1>
        <p className="text-neutral-600 mt-2">Interactive Swagger-like API documentation and SDK examples</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
        <p className="text-sm text-blue-800 mb-3">
          All API requests require authentication using a valid Bearer token. Include the token in the Authorization header:
        </p>
        <code className="bg-blue-100 px-3 py-1.5 rounded text-sm text-blue-900 font-mono block">
          Authorization: Bearer YOUR_API_TOKEN
        </code>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 sticky top-24">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Endpoints</h3>
            </div>
            <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto">
              {API_ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full text-left p-3 transition-colors hover:bg-neutral-50 ${
                    selectedEndpoint?.id === endpoint.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 truncate">{endpoint.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{endpoint.path}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Endpoint Details */}
        {selectedEndpoint && (
          <div className="lg:col-span-2 space-y-6">
            {/* Endpoint Header */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className={`px-3 py-1 rounded text-sm font-bold ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-neutral-900">{selectedEndpoint.title}</h2>
                  <code className="text-sm text-neutral-600 font-mono bg-neutral-100 px-2 py-1 rounded mt-2 block w-fit">
                    {selectedEndpoint.path}
                  </code>
                </div>
              </div>
              <p className="text-neutral-700">{selectedEndpoint.description}</p>

              {selectedEndpoint.tags && selectedEndpoint.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {selectedEndpoint.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Parameters */}
            {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Parameters</h3>
                <div className="space-y-3">
                  {selectedEndpoint.parameters.map((param) => (
                    <div key={param.name} className="border-l-4 border-neutral-200 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-neutral-900">{param.name}</code>
                        <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded font-mono">
                          {param.type}
                        </span>
                        {param.required && <span className="px-1.5 py-0.5 bg-red-100 text-red-900 text-xs rounded font-semibold">
                          required
                        </span>}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body */}
            {selectedEndpoint.requestBody && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Request Body</h3>
                <p className="text-sm text-neutral-600 mb-4">{selectedEndpoint.requestBody.description}</p>
                <CodeBlock code={JSON.stringify(selectedEndpoint.requestBody.example, null, 2)} language="json" id={`req-${selectedEndpoint.id}`} />
              </div>
            )}

            {/* Response Example */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Response Example</h3>
              <CodeBlock code={JSON.stringify(selectedEndpoint.responseExample, null, 2)} language="json" id={`res-${selectedEndpoint.id}`} />
            </div>

            {/* Status Codes */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Status Codes</h3>
              <div className="space-y-2">
                {selectedEndpoint.statusCodes.map((sc) => (
                  <div key={sc.code} className="flex items-start gap-4">
                    <code className="font-mono font-bold text-lg text-neutral-900 w-12">{sc.code}</code>
                    <p className="text-neutral-700 flex-1">{sc.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Examples */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Code2 size={20} />
                Code Examples
              </h3>

              <div className="space-y-6">
                {/* cURL */}
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2 text-orange-600">
                    <Terminal size={16} />
                    cURL
                  </h4>
                  <CodeBlock code={generateCurl(selectedEndpoint)} language="bash" id={`curl-${selectedEndpoint.id}`} />
                </div>

                {/* JavaScript */}
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2 text-yellow-600">JavaScript</h4>
                  <CodeBlock code={generateJS(selectedEndpoint)} language="javascript" id={`js-${selectedEndpoint.id}`} />
                </div>

                {/* Python */}
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2 text-blue-600">Python</h4>
                  <CodeBlock code={generatePython(selectedEndpoint)} language="python" id={`py-${selectedEndpoint.id}`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limiting Info */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-3">Rate Limiting</h3>
        <p className="text-sm text-amber-800 mb-3">
          API requests are rate-limited to protect service stability:
        </p>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>• <strong>Standard:</strong> 1,000 requests per hour</li>
          <li>• <strong>Premium:</strong> 10,000 requests per hour</li>
          <li>• <strong>Enterprise:</strong> Unlimited (contact support)</li>
        </ul>
        <p className="text-xs text-amber-700 mt-3">
          Rate limit information is included in response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
        </p>
      </div>
    </div>
  );
};
