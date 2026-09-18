"use client";

import React, { useState } from 'react';
import { useRouteContext, ActiveTab } from '@/context/RouteContext';
import { 
  Bus, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Plus, 
  RotateCcw, 
  Wifi, 
  Cloud,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function Header() {
  const { 
    routes, 
    currentRouteId, 
    currentRoute, 
    selectRoute, 
    activeTab, 
    setActiveTab,
    createNewRoute,
    showConfirmModal,
    deleteCurrentRoute,
    resetToMockData
  } = useRouteContext();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDepot, setNewDepot] = useState('');

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim() || !newTitle.trim()) return;
    createNewRoute(newNumber.trim(), newTitle.trim(), newDepot.trim() || 'Stagecoach Depot');
    setNewNumber('');
    setNewTitle('');
    setNewDepot('');
    setIsNewModalOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'map', label: 'GIS & Route Map', icon: MapPin },
    { id: 'hazards', label: 'Hazard Register', icon: AlertTriangle, count: currentRoute?.hazards.length || 0 },
    { id: 'fleet', label: 'Fleet Clearance', icon: Bus },
    { id: 'driver', label: 'Driver Flashcard', icon: FileText },
    { id: 'governance', label: 'Governance Sign-off', icon: ShieldCheck },
  ];

  return (
    <>
      <header className="bg-stagecoach-navy border-b border-slate-800 text-white shadow-lg sticky top-0 z-40">
        {/* Top Corporate Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-stagecoach-amber flex items-center justify-center font-black text-xl shadow-md tracking-tighter text-white">
              SC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wide text-white">STAGECOACH</span>
                <span className="text-xs bg-stagecoach-amber/20 text-stagecoach-amber border border-stagecoach-amber/30 px-2 py-0.5 rounded-full font-semibold">
                  RRA v2.4 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Route Risk Assessment & GPS Survey Platform
              </p>
            </div>
          </div>

          {/* Route Selector & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Route Selector Dropdown */}
            <div className="relative">
              <select
                value={currentRouteId}
                onChange={(e) => selectRoute(e.target.value)}
                aria-label="Select active route assessment"
                className="bg-slate-800/90 text-white text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stagecoach-amber pr-8 cursor-pointer"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Route {r.routeNumber} - {r.routeTitle.length > 28 ? r.routeTitle.substring(0, 28) + '...' : r.routeTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* New Route Button */}
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center px-2.5 py-1.5 bg-stagecoach-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors border border-blue-600"
              title="Create New Route Assessment"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Route</span>
            </button>

            {/* Sync Status Badge */}
            <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isFirebaseConfigured ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400 ml-1" />
                  <span>Cloud Active</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400 ml-1" />
                  <span>Offline Ready</span>
                </>
              )}
            </div>

            {/* Print / Export A4 PDF */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Print / Save A4 Route Safety Dossier"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-slate-300" />
              <span className="hidden md:inline">Print / PDF</span>
            </button>

            {/* Reset Mock Data */}
            <button
              onClick={() => {
                showConfirmModal({
                  title: 'Reset Corporate Mock Data?',
                  message: 'This will reset your route assessments back to official Stagecoach baseline templates.',
                  confirmText: 'Reset Mock Data',
                  isDestructive: false,
                  onConfirm: () => resetToMockData(),
                });
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset Mock Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Delete Route */}
            {routes.length > 1 && (
              <button
                onClick={() => {
                  showConfirmModal({
                    title: `Delete Route ${currentRoute?.routeNumber}?`,
                    message: `Are you sure you want to delete ${currentRoute?.routeTitle}? All hazards and GIS coordinates for this route will be permanently removed.`,
                    confirmText: 'Delete Route',
                    isDestructive: true,
                    onConfirm: () => deleteCurrentRoute(),
                  });
                }}
                className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 transition-colors"
                title="Delete Current Route"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:block">
          <nav className="flex space-x-1 border-t border-slate-800/80 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 py-2.5 px-4 font-semibold text-xs lg:text-sm border-b-2 transition-all ${
                    isActive
                      ? 'border-stagecoach-amber text-stagecoach-amber bg-slate-800/50'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-stagecoach-amber' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-stagecoach-amber text-slate-900' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Modal: New Route Assessment */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-stagecoach-blue">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">New Route Assessment</h3>
                <p className="text-xs text-slate-500">Initiate a field survey dossier for Stagecoach bus network</p>
              </div>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route / Line Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192, X50, 43A"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stagecoach-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route Corridor / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manchester Airport - Piccadilly Express"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stagecoach-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Home Depot</label>
                <input
                  type="text"
                  placeholder="e.g. Sharston Depot, Hyde Road"
                  value={newDepot}
                  onChange={(e) => setNewDepot(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stagecoach-blue"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stagecoach-blue hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Create & Launch GIS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
