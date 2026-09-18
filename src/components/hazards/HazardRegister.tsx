"use client";

import React, { useState } from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { HazardObservation } from '@/types/route';
import { getRiskLevel } from '@/lib/calculations';
import RiskMatrix5x5 from './RiskMatrix5x5';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Gauge, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  Trash2
} from 'lucide-react';

export default function HazardRegister() {
  const { 
    currentRoute, 
    setSelectedHazardForModal, 
    setIsAddHazardModalOpen, 
    setPendingCoords,
    updateCurrentRoute,
    showConfirmModal,
    showToast
  } = useRouteContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (!currentRoute) return null;

  const hazards = currentRoute.hazards;

  const filteredHazards = hazards.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.controlMeasures.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || h.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(hazards.map((h) => h.category)));

  const handleAddManualHazard = () => {
    // Default coordinate to center of route or first stop
    const defaultCoord: [number, number] = currentRoute.pathCoordinates[0] || [57.3295, -3.6062];
    setPendingCoords(defaultCoord);
    setIsAddHazardModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase">
              Route {currentRoute.routeNumber}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Hazard Register</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {currentRoute.routeTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Depot: {currentRoute.depot} • Total Logged Risks: <strong>{hazards.length}</strong>
          </p>
        </div>

        <button
          onClick={handleAddManualHazard}
          className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Log New Hazard</span>
        </button>
      </div>

      {/* 5x5 Matrix Card */}
      <RiskMatrix5x5 hazards={hazards} />

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search hazard title, location, or controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stagecoach-blue"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none"
          >
            <option value="ALL">All Categories ({hazards.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hazards Grid */}
      {filteredHazards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No hazards match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Use the GIS Map or button above to log a new hazard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHazards.map((h) => {
            const residualRisk = getRiskLevel(h.residualScore);
            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {h.category}
                    </span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded ${residualRisk.badgeClass}`}>
                      Residual: {h.residualScore} ({residualRisk.level})
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {h.title}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stagecoach-blue flex-shrink-0" />
                    <span className="truncate">{h.locationName}</span>
                  </div>

                  <div className="mt-3 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-slate-700">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-800 uppercase mb-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Mitigation Controls</span>
                    </div>
                    <p className="line-clamp-2">{h.controlMeasures}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    GPS: {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </div>
                  <button
                    onClick={() => setSelectedHazardForModal(h)}
                    className="inline-flex items-center text-xs font-bold text-stagecoach-blue hover:text-blue-800"
                  >
                    <span>View Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
