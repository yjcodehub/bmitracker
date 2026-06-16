'use client';

import { useState } from 'react';
import { BMIRecord } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Scale, Activity, Percent, Dumbbell } from 'lucide-react';

interface MemberProgressChartsProps {
  records: BMIRecord[];
}

type MetricType = 'weight' | 'bmi' | 'bodyFatPercent' | 'muscleMass';

export function MemberProgressCharts({ records }: MemberProgressChartsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('weight');

  if (!records || records.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
        No progress data available yet
      </div>
    );
  }

  // Sort chronologically ascending for the trend line
  const chartData = [...records]
    .sort((a, b) => new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime())
    .map((r) => ({
      date: new Date(r.analysisDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      weight: r.weight,
      bmi: r.bmi,
      bodyFatPercent: r.bodyComposition?.bodyFatPercent ?? 0,
      muscleMass: r.bodyComposition?.muscleMass ?? 0,
      rawDate: r.analysisDate,
    }));

  const metricsConfig = {
    weight: {
      label: 'Weight',
      unit: 'kg',
      color: 'hsl(24, 95%, 53%)',
      icon: Scale,
      gradientId: 'weightGrad',
    },
    bmi: {
      label: 'BMI',
      unit: '',
      color: 'hsl(262, 83%, 58%)',
      icon: Activity,
      gradientId: 'bmiGrad',
    },
    bodyFatPercent: {
      label: 'Body Fat',
      unit: '%',
      color: 'hsl(142, 71%, 45%)',
      icon: Percent,
      gradientId: 'fatGrad',
    },
    muscleMass: {
      label: 'Muscle Mass',
      unit: 'kg',
      color: 'hsl(200, 95%, 48%)',
      icon: Dumbbell,
      gradientId: 'muscleGrad',
    },
  };

  const activeConfig = metricsConfig[activeMetric];
  const Icon = activeConfig.icon;

  return (
    <div className="space-y-4">
      {/* Tab Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(metricsConfig) as MetricType[]).map((key) => {
          const config = metricsConfig[key];
          const TabIcon = config.icon;
          const isActive = activeMetric === key;
          // Get latest value
          const latestRecord = chartData[chartData.length - 1];
          const latestValue = latestRecord ? latestRecord[key] : '—';

          return (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group hover:shadow-sm ${
                isActive
                  ? 'border-transparent text-white shadow-md'
                  : 'bg-card text-card-foreground border-border hover:border-gray-300 hover:bg-accent/10'
              }`}
              style={isActive ? { backgroundColor: config.color } : {}}
            >
              <div className="flex justify-between items-start">
                <p className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {config.label}
                </p>
                <TabIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:scale-110 transition-transform duration-200'}`} />
              </div>
              <p className="text-xl font-bold mt-1 tracking-tight">
                {latestValue}
                <span className="text-xs font-normal ml-0.5">{config.unit}</span>
              </p>
              
              {/* Subtle background decoration */}
              <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-125 transition-transform duration-300 pointer-events-none">
                <TabIcon className="h-12 w-12" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-card border rounded-xl p-4 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: activeConfig.color }}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{activeConfig.label} History</h3>
            <p className="text-xs text-muted-foreground">Progress trend over sessions</p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={activeConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                labelStyle={{ fontSize: 11, fontWeight: 600 }}
                itemStyle={{ fontSize: 12, color: activeConfig.color }}
                formatter={(value: any) => [`${value} ${activeConfig.unit}`, activeConfig.label]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${activeConfig.gradientId})`}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
