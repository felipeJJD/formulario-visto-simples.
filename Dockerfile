FROM node:18-alpine

WORKDIR /app

# Instalar dependências primeiro para aproveitar o cache
COPY package*.json ./
RUN npm ci

# Copiar o restante dos arquivos
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]
