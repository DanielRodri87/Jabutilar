# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos necessários
COPY package*.json ./

# Remove o package-lock.json se existir e faz uma instalação limpa
RUN rm -f package-lock.json && npm install

# Copia o restante do código
COPY . .

# Gera o build do Next.js
RUN npm run build

# Etapa de execução
FROM node:20-alpine

WORKDIR /app

# Copia apenas o build final
COPY --from=build /app ./

EXPOSE 3000

# Executa o servidor Next.js
CMD ["npm", "start"]
