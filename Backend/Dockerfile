# backend/Dockerfile

# 1. Usamos Python, NO Node
FROM python:3.9-slim

WORKDIR /app

# 2. Copiamos requirements e instalamos con PIP (no npm)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copiamos el código Python
COPY . .

# 4. Exponemos el puerto 5000
EXPOSE 5000

# 5. Comandos de Python
CMD python train_model.py && python app.py