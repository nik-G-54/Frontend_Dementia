import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts';

export const ProgressChart = ({ data, dataKey = 'score', gradientColor = '#6366f1', title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              itemStyle={{ color: gradientColor, fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={gradientColor} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorScore)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: gradientColor }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
