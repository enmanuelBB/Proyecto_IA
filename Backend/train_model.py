import pandas as pd
import numpy as np
from ucimlrepo import fetch_ucirepo
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

# Definir nombres de archivo para guardado
MODEL_FILE = 'model_electria.pkl'
SCALER_X_FILE = 'scaler_x.pkl'
SCALER_Y_FILE = 'scaler_y.pkl'

def train():
    print("🔌 Iniciando entrenamiento de ElectrIA...")

    # 1. Cargar Dataset UCI (Consumo Eléctrico)
    print("⬇️  Descargando datos (esto puede tardar unos minutos)...")
    try:
        dataset = fetch_ucirepo(id=235)
        X = dataset.data.features
    except Exception as e:
        print(f"❌ Error descargando dataset: {e}")
        return

    # 2. Preprocesamiento
    print("🧹 Limpiando y procesando datos...")
    df = X.copy()
    
    # Unir fecha y hora para el índice
    # (Esto es vital para que pandas sepa el orden temporal)
    df['Datetime'] = pd.to_datetime(df['Date'] + ' ' + df['Time'], dayfirst=True)
    df.set_index('Datetime', inplace=True)

    # Convertir a numérico las columnas que importan
    cols = ['Global_active_power', 'Global_reactive_power', 'Voltage', 'Global_intensity']
    for col in cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    df.dropna(inplace=True)

    # RESAMPLE: Agrupamos por HORA
    # CORRECCIÓN AQUÍ: Agregamos numeric_only=True para evitar que intente promediar texto
    print("⏳ Re-muestreando datos por hora...")
    df_hourly = df.resample('h').mean(numeric_only=True).dropna()

    # Feature Engineering
    df_hourly['hour'] = df_hourly.index.hour
    df_hourly['month'] = df_hourly.index.month
    df_hourly['weekday'] = df_hourly.index.dayofweek
    
    # Simulación de temperatura
    np.random.seed(42)
    df_hourly['temperature'] = 20 + 5 * np.sin((df_hourly['hour'] - 6) * np.pi / 12) + np.random.normal(0, 2, len(df_hourly))

    # Variables
    features = ['hour', 'month', 'weekday', 'temperature', 'Voltage', 'Global_intensity']
    target = 'Global_active_power'

    # Verificar que existen las columnas antes de seguir
    missing_cols = [col for col in features if col not in df_hourly.columns]
    if missing_cols:
        print(f"❌ Error: Faltan columnas tras el procesamiento: {missing_cols}")
        return

    X_final = df_hourly[features]
    y_final = df_hourly[target]

    # 3. Escalar datos
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()

    X_scaled = scaler_X.fit_transform(X_final)
    y_scaled = scaler_y.fit_transform(y_final.values.reshape(-1, 1))

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_scaled, test_size=0.2, random_state=42)

    # 4. Entrenamiento MLP
    print("🧠 Entrenando Red Neuronal (MLP)...")
    mlp = MLPRegressor(
        hidden_layer_sizes=(100, 50),
        activation='relu',
        solver='adam',
        max_iter=500,
        random_state=42
    )

    mlp.fit(X_train, y_train.ravel())

    # 5. Evaluación rápida
    pred = mlp.predict(X_test)
    r2 = r2_score(y_test, pred)
    print(f"✅ Entrenamiento finalizado. R2 Score: {r2:.4f}")

    # 6. Guardar
    joblib.dump(mlp, MODEL_FILE)
    joblib.dump(scaler_X, SCALER_X_FILE)
    joblib.dump(scaler_y, SCALER_Y_FILE)
    print("💾 Modelo guardado exitosamente.")

if __name__ == "__main__":
    # Forzamos el entrenamiento siempre para asegurar que funcione esta vez
    if os.path.exists(MODEL_FILE):
        os.remove(MODEL_FILE) 
    train()