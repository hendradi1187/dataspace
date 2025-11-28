#!/bin/bash

# Comprehensive Database Seeding Script for Dataspace Platform
# Seeds all 10 backend services with realistic test data

echo "🌱 Starting Database Seeding for Dataspace Platform..."
echo "=========================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for tracking successful operations
TOTAL_SEEDED=0

# Function to make API calls and track results
seed_endpoint() {
  local port=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -ne "${BLUE}→${NC} Seeding: $description... "

  response=$(curl -s -X POST "http://localhost:$port$endpoint" \
    -H "Content-Type: application/json" \
    -d "$data" 2>/dev/null)

  if echo "$response" | grep -q "id\|did\|name"; then
    echo -e "${GREEN}✓${NC}"
    ((TOTAL_SEEDED++))
    return 0
  else
    echo -e "${YELLOW}⚠${NC}"
    return 1
  fi
}

# ============================================
# BROKER SERVICE (Port 3001)
# Participants and Datasets
# ============================================
echo -e "${YELLOW}[BROKER SERVICE - Port 3001]${NC}"
echo "Seeding participants and datasets..."
echo ""

# Participants
seed_endpoint 3001 "/participants" '{"did":"did:example:participant1","name":"Government Agency","description":"Public sector data provider","endpointUrl":"https://gov.example.com","publicKey":"-----BEGIN PUBLIC KEY-----"}' "Participant 1: Government Agency"

seed_endpoint 3001 "/participants" '{"did":"did:example:participant2","name":"Healthcare Provider","description":"Medical data organization","endpointUrl":"https://health.example.com","publicKey":"-----BEGIN PUBLIC KEY-----"}' "Participant 2: Healthcare Provider"

seed_endpoint 3001 "/participants" '{"did":"did:example:participant3","name":"Financial Institution","description":"Banking and financial services","endpointUrl":"https://finance.example.com","publicKey":"-----BEGIN PUBLIC KEY-----"}' "Participant 3: Financial Institution"

seed_endpoint 3001 "/participants" '{"did":"did:example:participant4","name":"Data Analytics Firm","description":"Business intelligence and analytics","endpointUrl":"https://analytics.example.com","publicKey":"-----BEGIN PUBLIC KEY-----"}' "Participant 4: Analytics Firm"

seed_endpoint 3001 "/participants" '{"did":"did:example:participant5","name":"Technology Company","description":"Software and technology services","endpointUrl":"https://tech.example.com","publicKey":"-----BEGIN PUBLIC KEY-----"}' "Participant 5: Tech Company"

# Datasets
seed_endpoint 3001 "/datasets" '{"participantId":"1","name":"Public Healthcare Statistics","description":"Aggregate healthcare data","format":"csv","status":"active","recordCount":50000}' "Dataset 1: Healthcare Statistics"

seed_endpoint 3001 "/datasets" '{"participantId":"2","name":"COVID-19 Epidemiological Data","description":"Disease tracking information","format":"json","status":"active","recordCount":150000}' "Dataset 2: COVID-19 Data"

seed_endpoint 3001 "/datasets" '{"participantId":"3","name":"Financial Transactions Log","description":"Transaction records for analysis","format":"parquet","status":"active","recordCount":500000}' "Dataset 3: Financial Transactions"

seed_endpoint 3001 "/datasets" '{"participantId":"4","name":"Population Demographics","description":"Census and demographic data","format":"csv","status":"active","recordCount":80000}' "Dataset 4: Demographics"

seed_endpoint 3001 "/datasets" '{"participantId":"5","name":"Traffic and Mobility Data","description":"Transportation and movement patterns","format":"json","status":"active","recordCount":200000}' "Dataset 5: Traffic Data"

echo ""

# ============================================
# HUB SERVICE (Port 3002)
# Schemas and Vocabularies
# ============================================
echo -e "${YELLOW}[HUB SERVICE - Port 3002]${NC}"
echo "Seeding schemas and vocabularies..."
echo ""

# Schemas
seed_endpoint 3002 "/schemas" '{"name":"Patient Record Schema","version":"1.0","description":"Standard schema for patient health records","fields":"[{\"name\":\"patient_id\",\"type\":\"string\"},{\"name\":\"age\",\"type\":\"integer\"},{\"name\":\"diagnosis\",\"type\":\"string\"}]"}' "Schema 1: Patient Records"

seed_endpoint 3002 "/schemas" '{"name":"Transaction Schema","version":"1.0","description":"Financial transaction data structure","fields":"[{\"name\":\"transaction_id\",\"type\":\"string\"},{\"name\":\"amount\",\"type\":\"decimal\"},{\"name\":\"timestamp\",\"type\":\"datetime\"}]"}' "Schema 2: Transactions"

seed_endpoint 3002 "/schemas" '{"name":"Location Schema","version":"1.0","description":"Geographic location and address data","fields":"[{\"name\":\"latitude\",\"type\":\"float\"},{\"name\":\"longitude\",\"type\":\"float\"},{\"name\":\"address\",\"type\":\"string\"}]"}' "Schema 3: Locations"

# Vocabularies
seed_endpoint 3002 "/vocabularies" '{"name":"Medical Conditions","description":"Standard medical condition codes","terms":"[\"Hypertension\",\"Diabetes\",\"Asthma\",\"COVID-19\"]"}' "Vocabulary 1: Medical Conditions"

seed_endpoint 3002 "/vocabularies" '{"name":"Data Categories","description":"Classification of data types","terms":"[\"Personal\",\"Health\",\"Financial\",\"Location\",\"Behavioral\"]"}' "Vocabulary 2: Data Categories"

seed_endpoint 3002 "/vocabularies" '{"name":"File Formats","description":"Supported data formats","terms":"[\"CSV\",\"JSON\",\"XML\",\"Parquet\",\"AVRO\"]"}' "Vocabulary 3: File Formats"

echo ""

# ============================================
# POLICY SERVICE (Port 3003)
# Policies
# ============================================
echo -e "${YELLOW}[POLICY SERVICE - Port 3003]${NC}"
echo "Seeding data access policies..."
echo ""

seed_endpoint 3003 "/policies" '{"name":"Public Health Data Policy","description":"Governance for public health data sharing","status":"active","rules":"[{\"action\":\"read\",\"resource\":\"health_data\",\"condition\":\"non-identifying\"}]"}' "Policy 1: Public Health"

seed_endpoint 3003 "/policies" '{"name":"Financial Data Protection Policy","description":"Regulations for financial information","status":"active","rules":"[{\"action\":\"read\",\"resource\":\"financial_data\",\"condition\":\"authenticated\"}]"}' "Policy 2: Financial Protection"

seed_endpoint 3003 "/policies" '{"name":"Research Data Access Policy","description":"Policy for research institutions","status":"active","rules":"[{\"action\":\"read\",\"resource\":\"anonymized_data\",\"condition\":\"research_approved\"}]"}' "Policy 3: Research Access"

seed_endpoint 3003 "/policies" '{"name":"Personal Data Minimization Policy","description":"Minimize personal data exposure","status":"active","rules":"[{\"action\":\"read\",\"resource\":\"personal_data\",\"condition\":\"minimal_required\"}]"}' "Policy 4: Data Minimization"

echo ""

# ============================================
# CONTRACT SERVICE (Port 3004)
# Contracts
# ============================================
echo -e "${YELLOW}[CONTRACT SERVICE - Port 3004]${NC}"
echo "Seeding data sharing contracts..."
echo ""

seed_endpoint 3004 "/contracts" '{"participantId1":"1","participantId2":"2","name":"Health Data Sharing Agreement","description":"Contract for health data exchange","status":"active","startDate":"2025-01-01","endDate":"2026-12-31"}' "Contract 1: Health Data"

seed_endpoint 3004 "/contracts" '{"participantId1":"3","participantId2":"4","name":"Financial Analytics Agreement","description":"Contract for financial data analysis","status":"active","startDate":"2025-01-01","endDate":"2026-12-31"}' "Contract 2: Financial Analytics"

seed_endpoint 3004 "/contracts" '{"participantId1":"2","participantId2":"5","name":"Technical Integration Contract","description":"Contract for system integration","status":"active","startDate":"2025-01-01","endDate":"2026-12-31"}' "Contract 3: Integration"

seed_endpoint 3004 "/contracts" '{"participantId1":"4","participantId2":"1","name":"Public Data Utilization Agreement","description":"Contract for public data use","status":"active","startDate":"2025-01-01","endDate":"2026-12-31"}' "Contract 4: Public Data"

echo ""

# ============================================
# COMPLIANCE SERVICE (Port 3005)
# Compliance Records
# ============================================
echo -e "${YELLOW}[COMPLIANCE SERVICE - Port 3005]${NC}"
echo "Seeding compliance records..."
echo ""

seed_endpoint 3005 "/compliance-records" '{"contractId":"1","auditDate":"2025-11-15","status":"compliant","findings":"All requirements met","notes":"Passed full audit"}' "Compliance 1: Health Data Contract"

seed_endpoint 3005 "/compliance-records" '{"contractId":"2","auditDate":"2025-11-15","status":"compliant","findings":"No issues detected","notes":"Passed routine check"}' "Compliance 2: Financial Analytics"

seed_endpoint 3005 "/compliance-records" '{"contractId":"3","auditDate":"2025-11-14","status":"compliant","findings":"Documentation complete","notes":"Quarterly review passed"}' "Compliance 3: Integration"

seed_endpoint 3005 "/compliance-records" '{"contractId":"4","auditDate":"2025-11-15","status":"compliant","findings":"Full compliance verified","notes":"Annual certification"}' "Compliance 4: Public Data"

echo ""

# ============================================
# LEDGER SERVICE (Port 3006)
# Transactions
# ============================================
echo -e "${YELLOW}[LEDGER SERVICE - Port 3006]${NC}"
echo "Seeding transaction records..."
echo ""

seed_endpoint 3006 "/transactions" '{"transactionId":"TXN001","datasetId":"1","participantId":"1","action":"read","timestamp":"2025-11-15T10:30:00Z","status":"completed","recordCount":1000}' "Transaction 1: Dataset 1 Read"

seed_endpoint 3006 "/transactions" '{"transactionId":"TXN002","datasetId":"2","participantId":"2","action":"write","timestamp":"2025-11-15T11:15:00Z","status":"completed","recordCount":500}' "Transaction 2: Dataset 2 Write"

seed_endpoint 3006 "/transactions" '{"transactionId":"TXN003","datasetId":"3","participantId":"3","action":"read","timestamp":"2025-11-15T12:00:00Z","status":"completed","recordCount":2000}' "Transaction 3: Dataset 3 Read"

seed_endpoint 3006 "/transactions" '{"transactionId":"TXN004","datasetId":"4","participantId":"4","action":"read","timestamp":"2025-11-15T13:45:00Z","status":"completed","recordCount":1500}' "Transaction 4: Dataset 4 Read"

seed_endpoint 3006 "/transactions" '{"transactionId":"TXN005","datasetId":"5","participantId":"5","action":"write","timestamp":"2025-11-15T14:20:00Z","status":"completed","recordCount":3000}' "Transaction 5: Dataset 5 Write"

echo ""

# ============================================
# CLEARING SERVICE (Port 3007)
# Clearing Records
# ============================================
echo -e "${YELLOW}[CLEARING SERVICE - Port 3007]${NC}"
echo "Seeding clearing records..."
echo ""

seed_endpoint 3007 "/clearing-records" '{"clearingId":"CLR001","contractId":"1","amount":50000,"currency":"USD","status":"settled","settlementDate":"2025-11-15"}' "Clearing 1: Contract 1 Settlement"

seed_endpoint 3007 "/clearing-records" '{"clearingId":"CLR002","contractId":"2","amount":75000,"currency":"USD","status":"settled","settlementDate":"2025-11-15"}' "Clearing 2: Contract 2 Settlement"

seed_endpoint 3007 "/clearing-records" '{"clearingId":"CLR003","contractId":"3","amount":30000,"currency":"USD","status":"settled","settlementDate":"2025-11-15"}' "Clearing 3: Contract 3 Settlement"

seed_endpoint 3007 "/clearing-records" '{"clearingId":"CLR004","contractId":"4","amount":40000,"currency":"USD","status":"pending","settlementDate":"2025-11-16"}' "Clearing 4: Contract 4 Settlement"

echo ""

# ============================================
# APPSTORE SERVICE (Port 3008)
# Applications
# ============================================
echo -e "${YELLOW}[APPSTORE SERVICE - Port 3008]${NC}"
echo "Seeding applications..."
echo ""

seed_endpoint 3008 "/apps" '{"name":"Data Analytics Dashboard","description":"Comprehensive data analysis tool","version":"1.0.0","author":"Tech Company","status":"published","category":"Analytics"}' "App 1: Analytics Dashboard"

seed_endpoint 3008 "/apps" '{"name":"Health Records Viewer","description":"Secure health data visualization","version":"1.0.0","author":"Healthcare Provider","status":"published","category":"Healthcare"}' "App 2: Health Viewer"

seed_endpoint 3008 "/apps" '{"name":"Compliance Checker","description":"Automated compliance verification","version":"2.1.0","author":"Government Agency","status":"published","category":"Compliance"}' "App 3: Compliance Checker"

seed_endpoint 3008 "/apps" '{"name":"Data Marketplace","description":"Buy and sell data assets","version":"1.2.0","author":"Data Analytics Firm","status":"published","category":"Commerce"}' "App 4: Marketplace"

seed_endpoint 3008 "/apps" '{"name":"Privacy Shield","description":"Data privacy and protection tool","version":"1.0.0","author":"Financial Institution","status":"published","category":"Security"}' "App 5: Privacy Shield"

echo ""

# ============================================
# CONNECTOR SERVICE (Port 3009)
# Connectors
# ============================================
echo -e "${YELLOW}[CONNECTOR SERVICE - Port 3009]${NC}"
echo "Seeding connectors..."
echo ""

seed_endpoint 3009 "/connectors" '{"name":"REST API Connector","type":"rest","protocol":"HTTP/HTTPS","status":"active","description":"Standard REST API integration"}' "Connector 1: REST API"

seed_endpoint 3009 "/connectors" '{"name":"Database Connector","type":"database","protocol":"SQL","status":"active","description":"Direct database integration"}' "Connector 2: Database"

seed_endpoint 3009 "/connectors" '{"name":"Message Queue Connector","type":"messaging","protocol":"AMQP","status":"active","description":"Asynchronous message integration"}' "Connector 3: Message Queue"

seed_endpoint 3009 "/connectors" '{"name":"File Transfer Connector","type":"file","protocol":"SFTP","status":"active","description":"Secure file transfer protocol"}' "Connector 4: File Transfer"

echo ""

# ============================================
# Summary
# ============================================
echo "=========================================================="
echo -e "${GREEN}✓ Database seeding complete!${NC}"
echo "=========================================================="
echo ""
echo "📊 Total records seeded: $TOTAL_SEEDED"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:5173"
echo "   Admin DB: http://localhost:8080"
echo ""
echo "📋 Data distribution:"
echo "   • Participants: 5 (Broker)"
echo "   • Datasets: 5 (Broker)"
echo "   • Schemas: 3 (Hub)"
echo "   • Vocabularies: 3 (Hub)"
echo "   • Policies: 4 (Policy)"
echo "   • Contracts: 4 (Contract)"
echo "   • Compliance Records: 4 (Compliance)"
echo "   • Transactions: 5 (Ledger)"
echo "   • Clearing Records: 4 (Clearing)"
echo "   • Applications: 5 (AppStore)"
echo "   • Connectors: 4 (Connector)"
echo ""
echo "✅ All services should now display data in the UI!"
echo ""
