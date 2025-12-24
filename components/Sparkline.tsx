
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = '#ffffff' }) => {
  const chartData = React.useMemo(() => data.map((val, i) => ({ val, id: i })), [data]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(Sparkline);
