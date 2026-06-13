# --- Etapa 1: Construcción/Compilación ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los manifiestos de paquetes
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copiamos el código fuente de la interfaz
COPY . .

# Compilamos la aplicación de React + Vite + Tailwind CSS v4
RUN npm run build

# --- Etapa 2: Servidor de Producción ---
FROM nginx:alpine

# Copiamos los archivos compilados desde la etapa anterior al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto estándar web
EXPOSE 80

# Arrancamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]