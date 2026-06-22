'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../../store/useStore';
import { BarChart3, ArrowLeft, TrendingUp, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';

export default function AdminAnalyticsPage() {
  const { fetchAnalytics } = useStore();
  const [mounted, setMounted] = useState(false);
  const [accuracyData, setAccuracyData] = useState<any[]>([]);
  const [loadData, setLoadData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics().then((data) => {
      if (data) {
        setAccuracyData(data.accuracyData || []);
        setLoadData(data.loadData || []);
        setCategoryData(data.categoryData || []);
      }
    });
  }, [fetchAnalytics]);

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 pb-6">
        <Link href="/admin" className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-cyber-cyan transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Admin Overview</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center">
          <BarChart3 className="h-7 w-7 text-cyber-cyan mr-2" />
          Neural Engine threat Analytics
        </h1>
      </header>

      {/* Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Accuracy */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 h-[320px] flex flex-col">
          <div className="flex justify-between items-center mb-4 text-xs font-mono">
            <div>
              <h3 className="font-bold text-white uppercase">Model Accuracy Telemetry</h3>
              <p className="text-[10px] text-slate-500">True Positive (Scams Flagged) vs False Positives</p>
            </div>
            <Cpu className="h-4.5 w-4.5 text-cyber-cyan" />
          </div>
          <div className="flex-1 w-full text-xs">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1a30" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#080f1e', borderColor: '#1e293b', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="TruePositives" stroke="#10b981" strokeWidth={2.5} name="True Positives" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="FalsePositives" stroke="#f43f5e" strokeWidth={2} name="False Positives" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-600 font-mono">Loading data...</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Daily scan loads */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 h-[320px] flex flex-col">
          <div className="flex justify-between items-center mb-4 text-xs font-mono">
            <div>
              <h3 className="font-bold text-white uppercase">Scanner Workload Loads</h3>
              <p className="text-[10px] text-slate-500">Daily query types count breakdown</p>
            </div>
            <Activity className="h-4.5 w-4.5 text-cyber-purple" />
          </div>
          <div className="flex-1 w-full text-xs">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1a30" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#080f1e', borderColor: '#1e293b', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="URLScans" stackId="a" fill="#00f0ff" name="URL Queries" />
                  <Bar dataKey="TextScans" stackId="a" fill="#6366f1" name="Text Descriptions" />
                  <Bar dataKey="ScreenshotScans" stackId="a" fill="#8b5cf6" name="Screenshots OCR" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-600 font-mono">Loading data...</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Threat types distribution */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 h-[340px] flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-4 text-xs font-mono">
            <div>
              <h3 className="font-bold text-white uppercase">Threat Categories Distribution</h3>
              <p className="text-[10px] text-slate-500">Breakdown of confirmed fake listings by mod-operandi</p>
            </div>
            <ShieldAlert className="h-4.5 w-4.5 text-cyber-rose" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {mounted ? (
              <>
                <div className="h-[200px] w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends */}
                <div className="flex flex-col space-y-3.5 text-xs text-slate-400 font-mono">
                  {categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="text-[10px] text-slate-500">({item.value} Scams Flagged)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-600 font-mono">Loading data...</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
