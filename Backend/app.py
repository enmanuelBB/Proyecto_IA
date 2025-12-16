from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from datetime import datetime
import os
import sys

app = Flask(__name__)
CORS(app)

# archivos
MODEL_FILE = 'model_electria.pkl'
SCALER_X_FILE = 'scaler_x.pkl'
SCALER_Y_FILE = 'scaler_y.pkl'

# Cargar modelos globalmente
model = None
scaler_x = None
scaler_y = None

def load_models():
    global model, scaler_x, scaler_y
    try:
        if os.path.exists(MODEL_FILE):
            print("Cargando modelo desde archivo......")
            model = joblib.load(MODEL_FILE)
            scaler_x = joblib.load(SCALER_X_FILE)
            scaler_y = joblib.load(SCALER_Y_FILE)
            print("Modelos cargados correctamente.")
        else:
            print("ADVERTENCIA: No se encontro el modelo .pkl. Ejecuta train_model.py primero.")
    except Exception as e:
        print(f"Error cargando modelos: {e}")

# Cargar al iniciar
load_models()

@app.route('/')
def home():
    status = "Online" if model else "Modelo no cargado"
    return jsonify({"status": status, "message": "Backend de ElectrIA funcionando"})

@app.route('/predict', methods=['POST'])
def predict():
    global model
    if not model:
        return jsonify({'error': 'El modelo no esta listo. Revisa los logs del servidor.'}), 503

    try:
        data = request.json
        
        # Obtener datos o usar defaults
        current_time = datetime.now()
        hour = data.get('hour', current_time.hour)
        month = data.get('month', current_time.month)
        weekday = data.get('weekday', current_time.weekday())
        temperature = data.get('temperature', 20.0)
        voltage = data.get('voltage', 230.0)
        intensity = data.get('intensity', 4.0)

        # Array de entrada
        features = np.array([[hour, month, weekday, temperature, voltage, intensity]])
        
        # Predicción
        features_scaled = scaler_x.transform(features)
        prediction_scaled = model.predict(features_scaled)
        prediction_kw = scaler_y.inverse_transform(prediction_scaled.reshape(-1, 1))[0][0]
        
        # Evitar valores negativos absurdos
        prediction_kw = max(0.0, prediction_kw)

        return jsonify({
            'predicted_load_kw': round(float(prediction_kw), 2),
            'inputs': {
                'hour': hour,
                'temperature': temperature
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/appliance-breakdown', methods=['GET', 'POST'])
def appliance_breakdown():
    try:
        # Generar datos aleatorios pero realistas
        import random
        # Variacion pequeña
        kitchen = round(2.5 + random.uniform(-0.5, 0.8), 2)
        laundry = round(1.2 + random.uniform(-0.3, 0.5), 2)
        ac = round(3.0 + random.uniform(-0.5, 1.0), 2)
        lighting = round(0.7 + random.uniform(-0.1, 0.2), 2)
        entertainment = round(1.0 + random.uniform(-0.2, 0.4), 2)

        data = [
            { "name": 'Kitchen', "consumption": kitchen, "color": '#29B5E8' },
            { "name": 'Laundry', "consumption": laundry, "color": '#00CC96' },
            { "name": 'AC', "consumption": ac, "color": '#FF4B4B' },
            { "name": 'Lighting', "consumption": lighting, "color": '#9D4EDD' },
            { "name": 'Entertainment', "consumption": entertainment, "color": '#FFA500' }
        ]
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # host=0000 para Docker 
    app.run(debug=True, host='0.0.0.0', port=5000)