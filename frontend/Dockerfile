# frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copiamos los package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código fuente
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Iniciamos Vite permitiendo host externo
CMD ["npm", "run", "dev", "--", "--host"]