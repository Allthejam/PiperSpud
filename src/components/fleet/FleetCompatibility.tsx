"use client";

import React from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { evaluateFleetCompatibility } from '@/lib/calculations';
import { Bus, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Sparkles, Scale } from 'lucide-react';

export default function FleetCompatibility() {
  const { currentRoute, updateCurrentRoute, showToast } = useRouteContext();

  if (!currentRoute) return null;

  const restrictions = currentRoute.vehicleRestrictions;
  const compatibility = evaluateFleetCompatibility(currentRoute.hazards, restrictions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-stagecoach-blue text-xs font-black uppercase">
            Route {currentRoute.routeNumber}
          </span>
          <span className="text-xs text-slate-500 font-semibold">Fleet Compatibility & Bridge Clearances</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Vehicle Allocation & Engineering Safety
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Automatic risk validation based on logged GIS corridor hazards and low bridge clearances.
        </p>
      </div>

      {/* Warning Alert Banner if prohibited */}
      {compatibility.warnings.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
          <div className="flex items-center space-x-2 text-red-800 font-extrabold text-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>CRITICAL FLEET ALLOCATION WARNINGS ({compatibility.warnings.length})</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs sm:text-sm text-red-700 font-medium">
            {compatibility.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fleet Type Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Double Decker Bus */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${
          compatibility.doubleDeckerSafe
            ? 'bg-white border-emerald-200 shadow-sm'
            : 'bg-red-50/50 border-red-300 shadow-md'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-stagecoach-blue font-black text-2xl">
              🚌
            </div>
            {compatibility.doubleDeckerSafe ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Cleared
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                Prohibited
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900">Double Decker Vehicles</h3>
          <p className="text-xs text-slate-500 mt-1">Alexander Dennis Enviro400 MMC / EV (Height ~4.3m)</p>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
            <div>Max Bridge Clearance: <strong className="text-slate-900">{restrictions.maxVehicleHeightM}m</strong></div>
            <div>Overhead Foliage: <strong className={compatibility.doubleDeckerSafe ? 'text-emerald-700' : 'text-red-700'}>
              {compatibility.doubleDeckerSafe ? 'Acceptable' : 'Foliage / Arch Risk'}
            </strong></div>
          </div>
        </div>

        {/* Single Decker / Coaches */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${
          compatibility.coachSafe
            ? 'bg-white border-emerald-200 shadow-sm'
            : 'bg-amber-50/50 border-amber-300 shadow-md'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-2xl">
              🚐
            </div>
            {compatibility.coachSafe ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Cleared
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Caution
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900">Single Decker & 15m Coaches</h3>
          <p className="text-xs text-slate-500 mt-1">Enviro200 / Volvo B8RLE / Plaxton Elite</p>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
            <div>Turning Radius Requirement: <strong className="text-slate-900">{restrictions.minTurningRadiusM || 12.5}m</strong></div>
            <div>Axle Clearance: <strong className="text-emerald-700">Cleared</strong></div>
          </div>
        </div>

        {/* Zero-Emission Battery EV */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${
          compatibility.evSafe
            ? 'bg-white border-emerald-200 shadow-sm'
            : 'bg-amber-50/50 border-amber-300 shadow-md'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-2xl">
              ⚡
            </div>
            {compatibility.evSafe ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                EV Certified
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Review
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900">Zero-Emission Battery Electric</h3>
          <p className="text-xs text-slate-500 mt-1">BYD / ADL Electric & Yutong E12</p>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
            <div>Max Axle Load: <strong className="text-slate-900">{restrictions.maxAxleWeightTonnes || 18.0} Tonnes</strong></div>
            <div>Regen Gradient Clearance: <strong className="text-emerald-700">Suitable</strong></div>
          </div>
        </div>

      </div>

      {/* Engineering Notes Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Depot Engineering Allocation Directive
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {restrictions.notes || 'All standard depot vehicle types permitted pending regular maintenance checks.'}
        </p>
      </div>

    </div>
  );
}
