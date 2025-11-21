import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { Alert, AlertDescription } from './components/ui/alert';
import { ArrowUp, Zap, TrendingUp, Gauge, AlertTriangle } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { EnergyChart } from './components/EnergyChart';
import { ApplianceBreakdown } from './components/ApplianceBreakdown';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState([12]);
  const [temperature, setTemperature] = useState([22]);
  const [activeAppliances, setActiveAppliances] = useState([5]);
  const [simulationRun, setSimulationRun] = useState(0);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRunSimulation = () => {
    setSimulationRun(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0E1117' }}>
      {/* Sidebar */}
      <div className="w-80 border-r p-6 flex flex-col gap-6" style={{ borderColor: '#262730' }}>
        <div>
          <h2 className="mb-6" style={{ color: '#FAFAFA' }}>Simulation Parameters</h2>
          
          {/* Time of Day Slider */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="text-sm" style={{ color: '#B8B8B8' }}>Time of Day</label>
              <span className="text-sm" style={{ color: '#29B5E8' }}>{timeOfDay[0]}:00</span>
            </div>
            <Slider
              value={timeOfDay}
              onValueChange={setTimeOfDay}
              max={23}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Temperature Slider */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="text-sm" style={{ color: '#B8B8B8' }}>Temperature (°C)</label>
              <span className="text-sm" style={{ color: '#29B5E8' }}>{temperature[0]}°C</span>
            </div>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={40}
              min={-10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Active Appliances Slider */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="text-sm" style={{ color: '#B8B8B8' }}>Active Appliances</label>
              <span className="text-sm" style={{ color: '#29B5E8' }}>{activeAppliances[0]}</span>
            </div>
            <Slider
              value={activeAppliances}
              onValueChange={setActiveAppliances}
              max={15}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleRunSimulation}
            className="w-full"
            style={{ 
              backgroundColor: '#29B5E8',
              color: '#0E1117'
            }}
          >
            <Zap className="mr-2 h-4 w-4" />
            Run Simulation
          </Button>
        </div>

        {/* Sidebar Stats */}
        <div className="mt-auto pt-6 border-t" style={{ borderColor: '#262730' }}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#B8B8B8' }}>Simulations Run</span>
              <span style={{ color: '#00CC96' }}>{simulationRun}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#B8B8B8' }}>AI Model</span>
              <span style={{ color: '#29B5E8' }}>MLP v2.1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#B8B8B8' }}>Accuracy</span>
              <span style={{ color: '#00CC96' }}>94.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#1A1D24' }}>
              <Zap className="h-8 w-8" style={{ color: '#29B5E8' }} />
            </div>
            <h1 style={{ color: '#FAFAFA' }}>
              ElectrIA: Predictive Energy Monitor
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm" style={{ color: '#B8B8B8' }}>Live Time</div>
            <div style={{ color: '#29B5E8' }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Current Load"
            value="4.2 kW"
            icon={<Gauge className="h-5 w-5" />}
            color="#29B5E8"
          />
          <MetricCard
            title="Predicted Peak"
            value="6.8 kW"
            subtitle="in 15 mins"
            icon={<ArrowUp className="h-5 w-5" />}
            color="#FF4B4B"
          />
          <MetricCard
            title="Grid Voltage"
            value="230V"
            icon={<TrendingUp className="h-5 w-5" />}
            color="#00CC96"
          />
        </div>

        {/* Alert Banner */}
        <Alert className="mb-8 border-0" style={{ backgroundColor: '#2A1A1A' }}>
          <AlertTriangle className="h-5 w-5" style={{ color: '#FF4B4B' }} />
          <AlertDescription style={{ color: '#FAFAFA' }}>
            <strong style={{ color: '#FF4B4B' }}>WARNING:</strong> High Demand Predicted at 19:00 hours. 
            <span style={{ color: '#B8B8B8' }}> Suggestion: Turn off HVAC.</span>
          </AlertDescription>
        </Alert>

        {/* Energy Chart */}
        <Card className="mb-8 border-0" style={{ backgroundColor: '#1A1D24' }}>
          <CardHeader>
            <CardTitle style={{ color: '#FAFAFA' }}>Energy Consumption Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <EnergyChart simulationKey={simulationRun} />
          </CardContent>
        </Card>

        {/* Appliance Breakdown */}
        <Card className="border-0" style={{ backgroundColor: '#1A1D24' }}>
          <CardHeader>
            <CardTitle style={{ color: '#FAFAFA' }}>Appliance Breakdown (Sub-metering)</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplianceBreakdown />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}