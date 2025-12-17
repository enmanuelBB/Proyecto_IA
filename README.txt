================================================================================
PROYECTO IA - ElectrIA DASHBOARD
================================================================================

DESCRIPCIÓN
-----------
Este proyecto es una aplicación web diseñada para el análisis y predicción de datos,
compuesta por un backend en Python (Flask) que sirve un modelo de Machine Learning,
y un frontend moderno en React (Vite) para la visualización de datos.

ESTRUCTURA DEL PROYECTO
-----------------------
El proyecto se organiza en las siguientes carpetas principales:

- /Backend
  Contiene la lógica del servidor, API REST y el modelo de Machine Learning.
  - app.py: Punto de entrada de la aplicación Flask.
  - train_model.py: Script para entrenamiento del modelo.
  - model_electria.pkl: Modelo entrenado serializado.
  - requirements.txt: Dependencias de Python.
  - reporte.py: Script para generar reportes PDF.

- /frontend
  Contiene la interfaz de usuario desarrollada en React con Vite.
  - src/: Código fuente de los componentes y páginas.
  - package.json: Dependencias de Node.js (React, Recharts, Radix UI, etc.).
  - vite.config.ts: Configuración de Vite.

- docker-compose.yml
  Archivo de orquestación para levantar ambos servicios (frontend y backend) conjuntamente.

REQUISITOS PREVIOS
------------------
- Docker Desktop instalado y ejecutándose.
- Git (opcional, para clonar el repositorio).

INSTRUCCIONES DE EJECUCIÓN
--------------------------
Para levantar todo el entorno de desarrollo utilizando Docker Compose, siga estos pasos:

1. Abra una terminal en la carpeta raíz del proyecto (donde está este archivo).

2. Ejecute el siguiente comando para construir y levantar los contenedores:

   docker-compose up --build

   Este comando descargará las imágenes necesarias, instalará las dependencias
   y arrancará los servicios.

3. Una vez que los contenedores estén corriendo, puede acceder a la aplicación:

   - Frontend (Interfaz de Usuario): http://localhost:3000
   - Backend (API): http://localhost:5000

NOTAS ADICIONALES
-----------------
- El frontend está configurado para comunicarse con el backend a través de la variable
  de entorno VITE_API_URL definida en el docker-compose.yml.
- Si necesita detener los servicios, presione Ctrl+C en la terminal.
