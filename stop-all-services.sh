#!/bin/bash

echo "🛑 Stopping all Dataspace services..."
echo ""

# Read PIDs from file
if [ -f "D:/BMAD-METHOD/dataspace/logs/pids.txt" ]; then
    while read pid; do
        if [ -n "$pid" ]; then
            echo "Stopping process $pid..."
            kill $pid 2>/dev/null || echo "  Process $pid already stopped"
        fi
    done < "D:/BMAD-METHOD/dataspace/logs/pids.txt"
    rm "D:/BMAD-METHOD/dataspace/logs/pids.txt"
else
    echo "⚠️  No PID file found. Trying to stop by port..."
    # Alternative: kill by port (Windows-specific)
    for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
        echo "Checking port $port..."
        netstat -ano | grep ":$port " | awk '{print $5}' | while read pid; do
            if [ -n "$pid" ] && [ "$pid" != "0" ]; then
                taskkill //PID $pid //F 2>/dev/null
            fi
        done
    done
fi

echo ""
echo "✅ All services stopped!"
