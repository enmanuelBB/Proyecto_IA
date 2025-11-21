import { Card, CardContent } from './ui/card';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: string;
}

export function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  return (
    <Card className="border-0" style={{ backgroundColor: '#1A1D24' }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm" style={{ color: '#B8B8B8' }}>{title}</div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0E1117', color }}>
            {icon}
          </div>
        </div>
        <div style={{ color }}>
          {value}
        </div>
        {subtitle && (
          <div className="text-sm mt-1" style={{ color: '#B8B8B8' }}>
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
