#!/bin/bash

docker-compose -p filenest up -d

echo "Warte 20 Sekunden, bis der MinIO Server gestartet ist..."
sleep 20

docker rm filenest-createuser-1