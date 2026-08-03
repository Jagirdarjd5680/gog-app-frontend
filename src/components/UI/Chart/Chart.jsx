import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

export const AreaChartUI = ({
  data,
  xKey,
  yKey,
  variant = 'develop', // 'develop' | 'preview' | 'ship'
  height = 300,
  className = '',
  ...props
}) => {
  let startColor = '#007cf0';
  let endColor = '#00dfd8';

  if (variant === 'preview') {
    startColor = '#7928ca';
    endColor = '#ff0080';
  } else if (variant === 'ship') {
    startColor = '#ff4d4d';
    endColor = '#f9cb28';
  }

  return (
    <div className={`w-full ${className}`} style={{ height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={startColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={endColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-vc-hairline)" />
          <XAxis 
            dataKey={xKey} 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
          />
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: 'var(--color-vc-canvas)',
              borderColor: 'var(--color-vc-hairline)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-vc-ink)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke={startColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#grad-${variant})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChartUI = ({
  data,
  xKey,
  yKey,
  variant = 'develop', // 'develop' | 'preview' | 'ship'
  height = 300,
  className = '',
  ...props
}) => {
  let color = '#007cf0';

  if (variant === 'preview') {
    color = '#7928ca';
  } else if (variant === 'ship') {
    color = '#ff4d4d';
  }

  return (
    <div className={`w-full ${className}`} style={{ height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-vc-hairline)" />
          <XAxis 
            dataKey={xKey} 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
          />
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: 'var(--color-vc-canvas)',
              borderColor: 'var(--color-vc-hairline)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-vc-ink)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LineChartUI = ({
  data,
  xKey,
  yKey,
  variant = 'develop', // 'develop' | 'preview' | 'ship'
  height = 300,
  className = '',
  ...props
}) => {
  let color = '#007cf0';

  if (variant === 'preview') {
    color = '#7928ca';
  } else if (variant === 'ship') {
    color = '#ff4d4d';
  }

  return (
    <div className={`w-full ${className}`} style={{ height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-vc-hairline)" />
          <XAxis 
            dataKey={xKey} 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="var(--color-vc-mute)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
          />
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: 'var(--color-vc-canvas)',
              borderColor: 'var(--color-vc-hairline)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-vc-ink)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
