# Wähle ein Node.js-Basis-Image
FROM node:18

# Arbeitsverzeichnis im Container erstellen und setzen
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest des Anwendungscodes
COPY . .

# Definiere den Startbefehl für die Anwendung
CMD ["npm", "start"]