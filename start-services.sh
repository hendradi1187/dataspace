#!/bin/bash

echo "🚀 Starting all services..."
echo ""

# Start broker service in background
echo "📦 Starting Broker Service (port 3001)..."
cd "D:/BMAD-METHOD/dataspace/services/cts/broker"
npm run dev > "../../broker.log" 2>&1 &
BROKER_PID=$!
echo "  ✅ Broker PID: $BROKER_PID"

sleep 3

# Check if service is running
echo ""
echo "🔍 Checking service health..."

for i in {1..10}; do
    if timeout 1 curl -s http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Broker Service is healthy!"
        break
    else
        echo "  Waiting for service to start... ($i/10)"
        sleep 1
    fi
done

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Service Information:"
echo "  Broker Service:   http://localhost:3001"
echo "  Health Check:     http://localhost:3001/health"
echo "  Participants API: http://localhost:3001/participants"
echo ""
echo "📝 Logs at: ../../broker.log"
echo "🔴 To stop: kill $BROKER_PID"
