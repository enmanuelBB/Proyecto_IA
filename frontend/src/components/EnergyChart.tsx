import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from 'axios';

interface DataPoint {
  time: string;
  historical: number | null;
  prediction: number | null;
  threshold: number;
}

export function EnergyChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [error, setError] = useState(false);

  const fetchPrediction = async () => {
    try {
      // 1. Datos para la IA dependiendo de la hora actual ( quitar comentarios para uso real)
      /*
      const payload = {
        hour: new Date().getHours(),
        temperature: 20, 
        voltage: 230
      };
      */

      // 1. Datos para la IA (Con pequeña variación para que la gráfica baile)
      const payload = {
        hour: new Date().getHours(),
        // Variamos la temperatura entre 19°C y 21°C aleatoriamente
        temperature: 20 + (Math.random() * 2 - 1), 
        // Variamos el voltaje entre 225V y 235V
        voltage: 230 + (Math.random() * 10 - 5)
      };

      // 2. Petición al servidor
      console.log("📡 Solicitando predicción...");
      const response = await axios.post('http://localhost:5000/predict', payload);
      console.log("✅ Dato recibido:", response.data);
      
      const predictionValue = response.data.predicted_load_kw;
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newDataPoint: DataPoint = {
        time: currentTime,
        // Esto genera variaciones grandes (+/- 0.5 kW)
        //historical: parseFloat((predictionValue + (Math.random() * 1 - 0.5)).toFixed(2)), 
        // Variación más pequeña (+/- 0.2 kW)
        historical: parseFloat((predictionValue + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        
        prediction: predictionValue,
        threshold: 5.5
      };

      setData(prevData => {
        const newArray = [...prevData, newDataPoint];
        if (newArray.length > 20) newArray.shift(); 
        return newArray;
      });
      setError(false);

    } catch (err) {
      console.error("❌ Error conectando con ElectrIA:", err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchPrediction(); 
    const interval = setInterval(fetchPrediction, 3000);
    return () => clearInterval(interval);
  }, []);

  // Tooltip simple
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#1A1D24', border: '1px solid #333', padding: '10px', borderRadius: '5px' }}>
          <p style={{ color: '#ccc', marginBottom: '5px' }}>{payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, fontSize: '14px' }}>
              {entry.name}: {entry.value} kW
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    // ⚠️ CAMBIO CLAVE: Usamos style={{ height: '400px' }} para forzar la altura
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {error && (
        <div style={{ position: 'absolute', top: 0, right: 0, color: 'red', background: 'rgba(50,0,0,0.5)', padding: '5px' }}>
          ⚠ Error de conexión
        </div>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 12 }} />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={5.5} stroke="red" strokeDasharray="3 3" />
          
          {/* CAMBIO CLAVE: dot={true} permite ver puntos individuales antes de que se forme la línea */}
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#29B5E8"
            strokeWidth={3}
            dot={{ r: 4 }} 
            name="Consumo Real"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="prediction"
            stroke="#FF4B4B"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Predicción IA"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}