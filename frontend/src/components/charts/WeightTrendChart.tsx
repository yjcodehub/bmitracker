'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeightTrendChartProps {
  data: { date: string; avgWeight: number }[];
}

export function WeightTrendChart({ data }: WeightTrendChartProps) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="avgWeight"
          stroke="hsl(24, 95%, 53%)"
          fill="hsl(24, 95%, 53%)"
          fillOpacity={0.2}
          name="Avg Weight (kg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
