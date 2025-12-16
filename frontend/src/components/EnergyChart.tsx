import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
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

  // Estado para controlar el Brush (zoom/scrolling)
  const [brushState, setBrushState] = useState<{ startIndex: number; endIndex: number } | null>(null);

  // Ref para saber si debemos autoscrollear (sticky scroll)
  // Por defecto true (al inicio estamos al final)
  const isAutoScrollRef = useRef(true);

  const fetchPrediction = async () => {
    try {
      // 1. Datos para la IA (Con pequeña variación para que la gráfica baile)
      const payload = {
        hour: new Date().getHours(),
        temperature: 20 + (Math.random() * 2 - 1),
        voltage: 230 + (Math.random() * 10 - 5)
      };

      // 2. Petición al servidor
      const response = await axios.post('http://localhost:5000/predict', payload);
      const predictionValue = response.data.predicted_load_kw;
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newDataPoint: DataPoint = {
        time: currentTime,
        historical: parseFloat((predictionValue + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        prediction: predictionValue,
        threshold: 5.5
      };

      setData(prevData => {
        const newData = [...prevData, newDataPoint];

        // Lógica Sticky Scroll:
        // Si estamos en modo auto-scroll, actualizamos el brush para mostrar lo nuevo
        if (isAutoScrollRef.current && prevData.length > 0) {
          // Calculamos el tamaño de la ventana actual
          const currentWindowSize = (brushState?.endIndex ?? 0) - (brushState?.startIndex ?? 0);

          // Si es la primera carga o ventana inválida, mostramos un rango por defecto (ej. últimos 20)
          const windowSize = currentWindowSize > 0 ? currentWindowSize : 20;

          const newEndIndex = newData.length - 1;
          // Aseguramos que el start no sea negativo
          const newStartIndex = Math.max(0, newEndIndex - windowSize);

          // Usamos setTimeout para evitar conflictos de renderizado con Recharts en el mismo ciclo (opcional pero seguro)
          // En este caso actualizamos el estado directamente, React lo batcheará
          setBrushState({ startIndex: newStartIndex, endIndex: newEndIndex });
        } else if (prevData.length === 0) {
          // Primera vez que llegan datos
          setBrushState({ startIndex: 0, endIndex: 0 });
        }

        return newData;
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

  // Manejador del cambio en el Brush (usuario scrollea)
  const handleBrushChange = (e: any) => {
    if (!e || e.startIndex === undefined || e.endIndex === undefined) return;

    setBrushState({ startIndex: e.startIndex, endIndex: e.endIndex });

    // Determinamos si el usuario está al final de la gráfica ("pegado" a la derecha)
    // Si el final de la selección es el último dato disponible, activamos auto-scroll
    if (data.length > 0 && e.endIndex === data.length - 1) {
      isAutoScrollRef.current = true;
    } else {
      // Si el usuario se movió atrás, desactivamos auto-scroll
      isAutoScrollRef.current = false;
    }
  };

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
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {error && (
        <div style={{ position: 'absolute', top: 0, right: 0, color: '#FFCC00', background: 'rgba(50,0,0,0.5)', padding: '5px' }}>
          ⏳ Entrenando modelo..
        </div>
      )}

      {/* Indicador visual de modo historia (opcional) */}
      {!isAutoScrollRef.current && data.length > 0 && (
        <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 10, backgroundColor: 'rgba(41, 181, 232, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid #29B5E8', color: '#29B5E8', fontSize: '12px' }}>
          ⏸️ Historial (Scroll pausado)
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 12 }} />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={5.5} stroke="red" strokeDasharray="3 3" />

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
          <Brush
            dataKey="time"
            height={30}
            stroke="#29B5E8"
            fill="#1A1D24"
            tickFormatter={() => ''}
            // Controlamos el brush
            startIndex={brushState?.startIndex}
            endIndex={brushState?.endIndex}
            onChange={handleBrushChange}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}