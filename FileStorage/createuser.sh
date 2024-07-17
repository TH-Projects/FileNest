#!/bin/bash

# Überprüfen, ob die URL übergeben wurde
if [ -z "$1" ]; then
    echo "MinIO URL nicht übergeben. Bitte die URL als Parameter angeben."
    echo "Benutzung: $0 <minio-url>"
    exit 1
fi

MINIO_URL=$1

# Überprüfen, ob MinIO Client (mc) installiert ist
if ! command -v mc &> /dev/null
then
    echo "MinIO Client (mc) ist nicht installiert oder nicht im PATH."
    exit 1
fi

# .env-Datei laden
if [ ! -f .env ]; then
    echo ".env-Datei nicht gefunden!"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

# Überprüfen, ob notwendige Umgebungsvariablen gesetzt sind
if [ -z "$MINIO_ALIAS" ] || [ -z "$MINIO_ROOT_USER" ] || [ -z "$MINIO_ROOT_PASSWORD" ] || [ -z "$MINIO_USER" ] || [ -z "$MINIO_USER_ACCESS_KEY" ]; then
    echo "Eine oder mehrere notwendige Umgebungsvariablen fehlen."
    exit 1
fi

echo "Sleeping for 10 seconds..."
sleep 10

# MinIO Alias setzen
mc alias set $MINIO_ALIAS $MINIO_URL $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Benutzer erstellen
mc admin user add $MINIO_ALIAS $MINIO_USER $MINIO_USER_ACCESS_KEY

# Dem Benutzer Lese- und Schreibrechte zuweisen
mc admin policy attach $MINIO_ALIAS readwrite --user $MINIO_USER

echo "Benutzer $MINIO_USER wurde mit Lese- und Schreibrechten erstellt."