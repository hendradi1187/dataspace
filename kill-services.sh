#!/bin/bash

echo "🛑 Stopping all services..."

# Kill processes by PID
for pid in 29476 52836 33308 56976 56864 58044 58236; do
    echo "Killing PID $pid..."
    kill -9 $pid 2>/dev/null || echo "  Could not kill $pid (may already be stopped)"
done

sleep 2

echo "✅ Verifying services stopped..."
netstat -ano 2>&1 | grep -E ":(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009)" | wc -l

echo "Done!"
