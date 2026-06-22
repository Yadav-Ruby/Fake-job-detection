'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { 
  Terminal, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Filter,
  Trash2,
  FileCheck2,
  XOctagon
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { analyses, setActiveAnalysis, fetchJobs } = useStore();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRowClick = (item: typeof analyses[0]) => {
    setActiveAnalysis(item);
    router.push('/analysis/result');
  };

  // Perform filtering
  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || item.riskLevel === levelFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesLevel && matchesType;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg p-6 space-y-8">
      {/* Background Grids */}
      <div className="absolute inset-0 cyber-grid-dots pointer-events-none" />

      <header className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Security Scan Telemetry Logs
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Historical registry of all text description analyses, screenshot extractions, and domain lookups.
        </p>
      </header>

      {/* Filter Toolbar */}
      <section className="glass-panel rounded-xl p-4 border border-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset to page 1
            }}
            placeholder="Search by job title or company..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>

        {/* Filters Select */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyber-cyan font-mono"
          >
            <option value="all">All Risk Levels</option>
            <option value="safe">Safe Only</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-cyber-cyan font-mono"
          >
            <option value="all">All Source Vectors</option>
            <option value="url">Link / URL Only</option>
            <option value="screenshot">Screenshot Only</option>
            <option value="text">Copy Text Only</option>
          </select>
        </div>
      </section>

      {/* Analyses List Table */}
      <section className="glass-panel rounded-xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500">
                <th className="p-4 font-semibold uppercase">Scan Signature</th>
                <th className="p-4 font-semibold uppercase">Claimed Entity</th>
                <th className="p-4 font-semibold uppercase">Source Type</th>
                <th className="p-4 font-semibold uppercase">Risk Evaluation</th>
                <th className="p-4 font-semibold uppercase">Timestamp</th>
                <th className="p-4 font-semibold uppercase text-right">Telemetries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {paginatedAnalyses.length > 0 ? (
                paginatedAnalyses.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-900/35 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-200 group-hover:text-cyber-cyan transition-colors truncate max-w-[200px]" title={item.title}>
                        {item.title}
                      </div>
                      <span className="text-[10px] text-slate-600 block mt-0.5">{item.id}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">{item.company}</td>
                    <td className="p-4 uppercase text-slate-400">{item.type}</td>
                    <td className="p-4">
                      <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        item.riskLevel === 'safe' ? 'text-cyber-emerald bg-cyber-emerald/5 border-cyber-emerald/10' :
                        item.riskLevel === 'low' ? 'text-cyber-blue bg-cyber-blue/5 border-cyber-blue/10' :
                        item.riskLevel === 'medium' ? 'text-cyber-indigo bg-cyber-indigo/5 border-cyber-indigo/10' :
                        item.riskLevel === 'high' ? 'text-cyber-amber bg-cyber-amber/5 border-cyber-amber/10' :
                        'text-cyber-rose bg-cyber-rose/5 border-cyber-rose/10'
                      }`}>
                        {item.riskLevel} ({item.riskScore}%)
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(item.analyzedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end text-cyber-cyan font-bold space-x-1">
                        <span>Brief</span>
                        <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-cyber-cyan transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching scanner logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-slate-900 bg-slate-950/20 text-xs font-mono text-slate-500">
          <div>
            Showing <span className="text-slate-300 font-bold">{Math.min(startIndex + 1, filteredAnalyses.length)}</span> to{' '}
            <span className="text-slate-300 font-bold">{Math.min(startIndex + itemsPerPage, filteredAnalyses.length)}</span> of{' '}
            <span className="text-slate-300 font-bold">{filteredAnalyses.length}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-slate-300 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
