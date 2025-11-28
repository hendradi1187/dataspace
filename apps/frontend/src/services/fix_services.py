import re

# Fix compliance-service.ts
compliance_file = 'compliance-service.ts'
with open(compliance_file, 'r', encoding='utf-8') as f:
    compliance_content = f.read()

# Remove the broken get method pagination handling
old_pattern = r'  async get\(id: string\): Promise<ComplianceRecord> \{[\s\S]*?// Handle both array and PaginatedResponse formats[\s\S]*?return response;'
new_text = '''  async get(id: string): Promise<ComplianceRecord> {
    try {
      const response = await complianceClient.get<ComplianceRecord>(
        `/compliance-records/${id}`
      );
      return response;'''

compliance_content = re.sub(old_pattern, new_text, compliance_content)

with open(compliance_file, 'w', encoding='utf-8') as f:
    f.write(compliance_content)
print("Fixed compliance-service.ts")

# Fix policies-service.ts - add pagination wrapper
policies_file = 'policies-service.ts'
with open(policies_file, 'r', encoding='utf-8') as f:
    policies_content = f.read()

if 'if (Array.isArray(response))' not in policies_content:
    policies_content = policies_content.replace(
        """      const response = await policyClient.get<PaginatedResponse<Policy>>(
        '/policies',
        queryParams
      );

      return response;""",
        """      const response = await policyClient.get<PaginatedResponse<Policy>>(
        '/policies',
        queryParams
      );

      // Handle both array and PaginatedResponse formats
      if (Array.isArray(response)) {
        const pageSize = queryParams.pageSize || 10;
        const page = queryParams.page || 1;
        return {
          data: response,
          total: response.length,
          page,
          pageSize,
          totalPages: Math.ceil(response.length / pageSize),
        };
      }
      return response;"""
    )
    
    with open(policies_file, 'w', encoding='utf-8') as f:
        f.write(policies_content)
    print("Fixed policies-service.ts")
else:
    print("policies-service.ts already has pagination wrapper")

# Fix transactions-service.ts - add pagination wrapper
transactions_file = 'transactions-service.ts'
with open(transactions_file, 'r', encoding='utf-8') as f:
    transactions_content = f.read()

if 'if (Array.isArray(response))' not in transactions_content:
    transactions_content = transactions_content.replace(
        """      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        queryParams
      );

      return response;""",
        """      const response = await ledgerClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        queryParams
      );

      // Handle both array and PaginatedResponse formats
      if (Array.isArray(response)) {
        const pageSize = queryParams.pageSize || 10;
        const page = queryParams.page || 1;
        return {
          data: response,
          total: response.length,
          page,
          pageSize,
          totalPages: Math.ceil(response.length / pageSize),
        };
      }
      return response;"""
    )
    
    with open(transactions_file, 'w', encoding='utf-8') as f:
        f.write(transactions_content)
    print("Fixed transactions-service.ts")
else:
    print("transactions-service.ts already has pagination wrapper")

print("All service files fixed!")
