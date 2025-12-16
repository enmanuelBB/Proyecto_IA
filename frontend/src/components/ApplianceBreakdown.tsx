import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

interface ApplianceData {
  name: string;
  consumption: number;
  color: string;
}

export function ApplianceBreakdown() {
  const [data, setData] = useState<ApplianceData[]>([
    { name: 'Kitchen', consumption: 2.8, color: '#29B5E8' },
    { name: 'Laundry', consumption: 1.5, color: '#00CC96' },
    { name: 'AC', consumption: 3.4, color: '#FF4B4B' },
    { name: 'Lighting', consumption: 0.8, color: '#9D4EDD' },
    { name: 'Entertainment', consumption: 1.2, color: '#FFA500' }
  ]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/appliance-breakdown');
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching appliance data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch immediately
    const interval = setInterval(fetchData, 5000); // And every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-lg border" style={{ backgroundColor: '#1A1D24', borderColor: '#262730' }}>
          <p className="text-sm mb-1" style={{ color: '#FAFAFA' }}>{payload[0].payload.name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            {payload[0].value} kW
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#262730" />
        <XAxis
          type="number"
          stroke="#B8B8B8"
          tick={{ fill: '#B8B8B8' }}
          label={{ value: 'Consumption (kW)', position: 'insideBottom', offset: -5, fill: '#B8B8B8' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#B8B8B8"
          tick={{ fill: '#B8B8B8' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="consumption"
          radius={[0, 8, 8, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
