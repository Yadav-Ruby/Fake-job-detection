'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  ShieldAlert, 
  User, 
  Save, 
  Check, 
  Smartphone,
  Eye
} from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark-luxury');
  const [sensitivity, setSensitivity] = useState(70);
  const [notifHighRisk, setNotifHighRisk] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifRecruiterChecks, setNotifRecruiterChecks] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      {/* Floating Save Alert Success toast */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 rounded-lg border border-cyber-emerald/20 bg-slate-950 px-4 py-3 text-xs text-cyber-emerald shadow-2xl font-mono animate-bounce">
          <Check className="h-4 w-4" />
          <span>POLICIES UPDATED SUCCESSFULLY</span>
        </div>
      )}

      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Security & Configuration Settings
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Adjust alert thresholds, notification scopes, and interface themes.
        </p>
      </header>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Appearance Settings */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 bg-slate-950/70 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
            <Eye className="h-4.5 w-4.5 text-cyber-cyan mr-2" />
            Appearance Preferences
          </h3>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Terminal Skin Style</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark-luxury')}
                className={`py-3 px-3 border rounded-lg text-xs font-mono text-center transition-all ${
                  theme === 'dark-luxury'
                    ? 'border-cyber-cyan/35 bg-cyber-cyan/5 text-cyber-cyan'
                    : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:text-white'
                }`}
              >
                Dark Luxury (Rich Black)
              </button>
              <button
                type="button"
                onClick={() => setTheme('cyber-navy')}
                className={`py-3 px-3 border rounded-lg text-xs font-mono text-center transition-all ${
                  theme === 'cyber-navy'
                    ? 'border-cyber-cyan/35 bg-cyber-cyan/5 text-cyber-cyan'
                    : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:text-white'
                }`}
              >
                Midnight Cyber Navy
              </button>
              <button
                type="button"
                disabled
                className="py-3 px-3 border border-slate-900 bg-slate-950/40 text-slate-700 text-xs font-mono text-center cursor-not-allowed"
              >
                Light Matrix (Locked)
              </button>
            </div>
          </div>
        </div>

        {/* Threat Alert Thresholds */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 bg-slate-950/70 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
            <ShieldAlert className="h-4.5 w-4.5 text-cyber-rose mr-2" />
            Threat Alert Thresholds
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Trigger Alert Score Threshold</span>
              <span className="text-cyber-rose font-bold">{sensitivity}% Danger</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
            />
            <p className="text-[10px] text-slate-500 leading-normal">
              Determines when to highlight an analysis in high-risk alert categories. Current configuration will flag any postings with risk score equal to or higher than {sensitivity}%.
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-panel rounded-xl p-5 border border-cyber-indigo/10 bg-slate-950/70 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center">
            <Bell className="h-4.5 w-4.5 text-cyber-cyan mr-2" />
            Active Alert Notifications
          </h3>
          <div className="space-y-3 text-xs">
            {/* Box 1 */}
            <div className="flex items-start">
              <input
                id="notif-high-risk"
                type="checkbox"
                checked={notifHighRisk}
                onChange={(e) => setNotifHighRisk(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyber-cyan focus:ring-cyber-cyan mt-0.5"
              />
              <label htmlFor="notif-high-risk" className="ml-2.5">
                <span className="text-slate-200 font-semibold block">Instant email warning on Critical scan scores</span>
                <span className="text-[10px] text-slate-500 font-mono">Notify when a scan hits risk scores &gt; 80%</span>
              </label>
            </div>

            {/* Box 2 */}
            <div className="flex items-start">
              <input
                id="notif-recruiter"
                type="checkbox"
                checked={notifRecruiterChecks}
                onChange={(e) => setNotifRecruiterChecks(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyber-cyan focus:ring-cyber-cyan mt-0.5"
              />
              <label htmlFor="notif-recruiter" className="ml-2.5">
                <span className="text-slate-200 font-semibold block">Flag checks discrepancy alerts</span>
                <span className="text-[10px] text-slate-500 font-mono">Warn when recruiter email fails corporate SPF alignment</span>
              </label>
            </div>

            {/* Box 3 */}
            <div className="flex items-start">
              <input
                id="notif-weekly"
                type="checkbox"
                checked={notifWeeklyDigest}
                onChange={(e) => setNotifWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyber-cyan focus:ring-cyber-cyan mt-0.5"
              />
              <label htmlFor="notif-weekly" className="ml-2.5">
                <span className="text-slate-200 font-semibold block">Weekly domain intelligence briefs</span>
                <span className="text-[10px] text-slate-500 font-mono">Recount new phishing domain signatures registered in last 7 days</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <button
          type="submit"
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-cyan px-6 py-3 text-xs font-bold text-cyber-bg hover:opacity-90 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
        >
          <Save className="h-4 w-4" />
          <span>Commit Configuration Changes</span>
        </button>
      </form>
    </div>
  );
}
