import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, TrendingUp, Star, DollarSign, Bell, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AIBadge } from '../components/ai/AIBadge';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

const earningsData = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 250 },
  { name: 'Wed', value: 210 },
  { name: 'Thu', value: 480 },
  { name: 'Fri', value: 350 },
  { name: 'Sat', value: 600 },
  { name: 'Sun', value: 850 },
];

export function ProviderDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Orders', value: 3, icon: Briefcase, color: 'text-ai-violet' },
    { label: 'Completed', value: 42, icon: CheckCircle, color: 'text-success' },
    { label: 'Earnings (Week)', value: '$850', icon: DollarSign, color: 'text-warning' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'text-accent' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted">Manage your opportunities and track your earnings.</p>
        </div>
        <Button variant="secondary" leftIcon={Bell}>
          Notifications
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-2xl font-mono font-bold text-ink">{stat.value}</span>
            </div>
            <span className="text-sm font-semibold text-muted">{stat.label}</span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-heading font-bold">New Opportunities</h2>
              <Badge variant="ai">2 New AI Matches</Badge>
            </div>
            
            {/* Opportunity Card */}
            <div className="border border-ai-violet/30 bg-ai-violet/5 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading font-bold text-lg">Restaurant Website</h3>
                  <div className="text-right">
                    <p className="font-mono font-bold text-ink">$100</p>
                    <p className="text-xs text-muted">Budget</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted mb-4">
                  <span>Delivery: 4 Days</span>
                  <span>Complexity: Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <AIBadge label="94% Match" />
                  <span className="text-xs text-muted italic">Perfect skill alignment</span>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-4">
                <Button variant="ai" size="sm" onClick={() => navigate('/deal/1')} className="flex-1">
                  Enter Deal Room
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                  Decline
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-bold">Active Orders</h2>
              <button className="text-sm text-accent hover:underline font-semibold focus-ring rounded">View all</button>
            </div>
            
            <div className="overflow-x-auto border border-border-subtle rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border-subtle text-sm text-muted">
                    <th className="p-4 font-semibold">Project</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-subtle hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-4 font-medium">E-commerce App</td>
                    <td className="p-4 text-sm text-muted">Alex G.</td>
                    <td className="p-4"><Badge variant="warning">In Progress</Badge></td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>Update</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-heading font-bold mb-6">Earnings Overview</h2>
            
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-ink)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center mt-4 border-t border-border-subtle pt-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted">Total (30 Days)</span>
                <span className="font-mono text-xl font-bold text-ink">$3,450.00</span>
              </div>
              <Button variant="secondary" size="sm">Withdraw</Button>
            </div>
          </GlassCard>
        </div>
      </div>

    </div>
  );
}
