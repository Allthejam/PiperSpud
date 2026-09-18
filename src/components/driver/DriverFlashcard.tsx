"use client";

import React from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { 
  AlertTriangle, 
  Printer, 
  MapPin, 
  ShieldCheck, 
  Gauge, 
  Clock, 
  Bus, 
  Info 
} from 'lucide-react';

export default function DriverFlashcard() {
  const { currentRoute } = useRouteContext();

  if (!currentRoute) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Driver Cab Safety Flashcard</h2>
          <p className="text-xs sm:text-sm text-slate-500">Official Stagecoach Pre-Service Route Briefing Notice</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 bg-stagecoach-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          <span>Print / Export Cab Notice</span>
        </button>
      </div>

      {/* High-Contrast Driver Flashcard Card */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-stagecoach-amber space-y-6 print:border-black print:text-black print:bg-white">
        
        {/* Route Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b-2 border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-stagecoach-amber text-slate-950 flex items-center justify-center font-black text-3xl shadow-xl">
              {currentRoute.routeNumber}
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-stagecoach-amber">
                Stagecoach Safety Directorate
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white print:text-black mt-0.5">
                {currentRoute.routeTitle}
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Depot: {currentRoute.depot} • Total Distance: {currentRoute.totalDistanceKm} km • Est. Time: {currentRoute.estimatedRunningTimeMin} min
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">RRA Status</div>
            <div className="text-sm font-black text-emerald-400">
              APPROVED & ACTIVE
            </div>
            <div className="text-[10px] text-slate-400">Review: {currentRoute.reviewDate}</div>
          </div>
        </div>

        {/* Critical Safety Rules Banner */}
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl font-bold flex items-start space-x-3 shadow-lg">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider font-black">Mandatory Driver Compliance</div>
            <p className="text-xs sm:text-sm mt-0.5 font-extrabold leading-snug">
              Strict adherence to advisory speed limits, center arch clearance markers, and mirrors at pedestrian pinch points.
            </p>
          </div>
        </div>

        {/* Top Route Hazards & Critical Action Points */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Critical Corridor Hazards & Advisory Actions
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {currentRoute.hazards.map((hazard, idx) => (
              <div
                key={hazard.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-stagecoach-amber uppercase">
                        {hazard.category}
                      </span>
                      {hazard.speedLimitMph && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 bg-white text-slate-900 rounded font-mono">
                          MAX {hazard.speedLimitMph} MPH
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">{hazard.title}</div>
                    <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{hazard.locationName}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:max-w-xs w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase mb-0.5">Action:</div>
                  <p className="line-clamp-2">{hazard.controlMeasures}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Stops & Operational Timings */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Route Stops, Temporary Works & Dwell Baselines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentRoute.stops.map((stop) => (
              <div
                key={stop.id}
                className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-lg">
                    {stop.stopType === 'bus_stop' && '🚏'}
                    {stop.stopType === 'popup_stop' && '🚧'}
                    {stop.stopType === 'junction' && '🚦'}
                    {stop.stopType === 'roadworks' && '🏗️'}
                    {stop.stopType === 'other' && '📍'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{stop.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{stop.stopType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-bold text-stagecoach-amber">{stop.dwellMinutes} min</span>
                  <p className="text-[9px] text-slate-500">Dwell</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flashcard Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>Stagecoach Operational Safety Standard Operating Procedure (SOP-401)</div>
          <div>Report new roadworks or hazards immediately to Depot Controller.</div>
        </div>

      </div>

    </div>
  );
}
