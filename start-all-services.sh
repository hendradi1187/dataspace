#!/bin/bash

echo "🚀 Starting all Dataspace services..."
echo ""

# Base directory
BASE_DIR="D:/BMAD-METHOD/dataspace/services/cts"

# Function to start a service
start_service() {
    local name=$1
    local port=$2
    local dir=$3

    echo "📦 Starting $name (port $port)..."
    cd "$BASE_DIR/$dir"
    npm run dev > "../../logs/${name}.log" 2>&1 &
    local pid=$!
    echo "  ✅ $name PID: $pid"
    echo "$pid" >> "../../logs/pids.txt"
    sleep 1
}

# Create logs directory if it doesn't exist
mkdir -p "D:/BMAD-METHOD/dataspace/logs"
> "D:/BMAD-METHOD/dataspace/logs/pids.txt"

# Start all services
start_service "IDP" 3000 "idp"
start_service "Broker" 3001 "broker"
start_service "Hub" 3002 "hub"
start_service "Policy" 3003 "trustcore-policy"
start_service "Contract" 3004 "trustcore-contract"
start_service "Compliance" 3005 "trustcore-compliance"
start_service "Ledger" 3006 "trustcore-ledger"
start_service "Clearing" 3007 "clearing"
start_service "AppStore" 3008 "appstore"

# Start connector service
echo "📦 Starting Connector (port 3009)..."
cd "D:/BMAD-METHOD/dataspace/services/connector"
npm run dev > "../logs/Connector.log" 2>&1 &
CONNECTOR_PID=$!
echo "  ✅ Connector PID: $CONNECTOR_PID"
echo "$CONNECTOR_PID" >> "D:/BMAD-METHOD/dataspace/logs/pids.txt"

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "🔍 Checking service health..."
echo ""

# Check health of all services
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
    echo -n "Port $port: "
    if timeout 2 curl -s http://localhost:$port/health >/dev/null 2>&1; then
        echo "✅ Healthy"
    else
        echo "⚠️  Not responding (may still be starting)"
    fi
done

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Service Information:"
echo "  IDP (Identity Provider):  http://localhost:3000"
echo "  Broker:                   http://localhost:3001"
echo "  Hub:                      http://localhost:3002"
echo "  Policy:                   http://localhost:3003"
echo "  Contract:                 http://localhost:3004"
echo "  Compliance:               http://localhost:3005"
echo "  Ledger:                   http://localhost:3006"
echo "  Clearing:                 http://localhost:3007"
echo "  AppStore:                 http://localhost:3008"
echo "  Connector:                http://localhost:3009"
echo ""
echo "📝 Logs directory: D:/BMAD-METHOD/dataspace/logs/"
echo "🔴 To stop all services: bash stop-all-services.sh"
