import React, { useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react';

const matchData = [
  { subject: 'Skills Fit', candidate: 98, benchmark: 85, fullMark: 100 },
  { subject: 'Budget Match', candidate: 95, benchmark: 80, fullMark: 100 },
  { subject: 'Turnaround', candidate: 92, benchmark: 75, fullMark: 100 },
  { subject: 'Experience', candidate: 96, benchmark: 85, fullMark: 100 },
  { subject: 'Success Rate', candidate: 99, benchmark: 90, fullMark: 100 },
  { subject: 'Communication', candidate: 94, benchmark: 80, fullMark: 100 },
];

function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border-subtle p-3 rounded-xl shadow-xl text-xs flex flex-col gap-1.5">
        <p className="font-heading font-bold text-ink">{payload[0]?.payload?.subject}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-ai-violet font-semibold">Matched Candidate:</span>
          <span className="font-mono font-bold text-ink">{payload[0]?.value}%</span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between gap-4 text-muted">
            <span>Project Baseline:</span>
            <span className="font-mono">{payload[1]?.value}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function RadarMatchCard() {
  const [activeView, setActiveView] = useState('candidate'); // 'candidate' | 'comparison'

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header with AI Match Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            97.4% Match Precision
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-background/60 p-1 rounded-lg border border-border-subtle text-xs">
          <button
            onClick={() => setActiveView('candidate')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'candidate' 
                ? 'bg-ai-violet text-white shadow-sm' 
                : 'text-muted hover:text-ink'
            }`}
          >
            Candidate Fit
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'comparison' 
                ? 'bg-ai-violet text-white shadow-sm' 
                : 'text-muted hover:text-ink'
            }`}
          >
            Vs. Baseline
          </button>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="w-full h-56 sm:h-64 my-auto relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={matchData}>
            <PolarGrid stroke="currentColor" strokeOpacity={0.12} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500, opacity: 0.8 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            
            {activeView === 'comparison' && (
              <Radar
                name="Project Baseline"
                dataKey="benchmark"
                stroke="#0284c7"
                fill="#38bdf8"
                fillOpacity={0.2}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}

            <Radar
              name="AI Matched Candidate"
              dataKey="candidate"
              stroke="#8b5cf6"
              fill="#7c3aed"
              fillOpacity={0.35}
              strokeWidth={2}
            />

            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Match Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t border-border-subtle/80 mt-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          <span className="truncate">React & Node.js Match</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          <span className="truncate">$100 Budget Aligned</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          <span className="truncate">4-Day Delivery Ready</span>
        </div>
      </div>
    </div>
  );
}
