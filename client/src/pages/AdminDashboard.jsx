import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CreditCard, Activity, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { apiClient } from '../services/apiClient';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isMock) {
          setData({
            kpis: {
              totalUsers: 1240,
              activeOrders: 342,
              paymentVolume: '$84,500',
              systemHealth: '99.9%'
            },
            recentUsers: [
              { email: 'muthu@dev.com', role: 'provider', status: 'Active' },
              { email: 'customer@acme.com', role: 'customer', status: 'Active' }
            ],
            recentOrders: [
              { id: 'ORD-12345', amount: '$89.25', status: 'In Escrow' },
              { id: 'ORD-99812', amount: '$450.00', status: 'Released' }
            ]
          });
        } else {
          const result = await apiClient.get('/admin/dashboard');
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isMock]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-muted">Loading metrics...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Users', value: data.kpis.totalUsers, icon: Users, color: 'text-accent' },
    { label: 'Active Orders', value: data.kpis.activeOrders, icon: Briefcase, color: 'text-warning' },
    { label: 'Payment Volume', value: data.kpis.paymentVolume, icon: CreditCard, color: 'text-success' },
    { label: 'System Health', value: data.kpis.systemHealth, icon: Activity, color: 'text-ai-violet' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Admin Control Center</h1>
        <p className="text-muted">Platform metrics and system management.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              <span className="text-2xl font-mono font-bold text-ink">{kpi.value}</span>
            </div>
            <span className="text-sm font-semibold text-muted">{kpi.label}</span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-bold">Recent Users</h2>
          </div>
          
          <div className="overflow-x-auto border border-border-subtle rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-subtle text-sm text-muted">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u, idx) => (
                  <tr key={idx} className="border-b border-border-subtle">
                    <td className="p-4 font-medium">{u.email}</td>
                    <td className="p-4 capitalize"><Badge variant={u.role === 'provider' ? 'ai' : 'neutral'}>{u.role}</Badge></td>
                    <td className="p-4"><Badge variant="success">{u.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-bold">Recent Transactions (PayPal Escrow)</h2>
          </div>
          
          <div className="overflow-x-auto border border-border-subtle rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-subtle text-sm text-muted">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o, idx) => (
                  <tr key={idx} className="border-b border-border-subtle">
                    <td className="p-4 font-mono text-sm">{o.id}</td>
                    <td className="p-4 font-mono font-medium">{o.amount}</td>
                    <td className="p-4 capitalize">
                      <Badge variant={o.status === 'released' || o.status === 'paid' ? 'success' : 'warning'}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
