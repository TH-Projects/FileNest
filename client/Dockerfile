# Verwende das offizielle Node.js-Image als Basisimage
FROM node:16-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die package.json und package-lock.json ins Arbeitsverzeichnis
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung ins Arbeitsverzeichnis
COPY . .

# Baue die Anwendung für die Produktion
RUN npm run build

# Installiere ein einfaches HTTP-Server-Tool, um die statischen Dateien zu bedienen
RUN npm install -g serve

# Exponiere den Port, auf dem die Anwendung laufen wird
EXPOSE 3000

# Starte die Anwendung
CMD ["serve", "-s", "dist", "-l", "3000"]
