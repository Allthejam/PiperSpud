"use client";

import React from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { Info } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useRouteContext();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
      <div className="bg-stagecoach-navy text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs sm:text-sm font-medium">
        <Info className="w-4 h-4 text-stagecoach-amber flex-shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
