"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouteContext } from '@/context/RouteContext';
import HazardRegister from '@/components/hazards/HazardRegister';
import FleetCompatibility from '@/components/fleet/FleetCompatibility';
import DriverFlashcard from '@/components/driver/DriverFlashcard';
import GovernanceSignOff from '@/components/governance/GovernanceSignOff';

// Dynamically import LeafletMap with SSR disabled
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-125px)] sm:h-[calc(100vh-115px)] bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 rounded-full border-4 border-stagecoach-amber border-t-transparent animate-spin mb-4"></div>
      <p className="font-bold text-base">Loading Stagecoach GIS Engine...</p>
      <p className="text-xs text-slate-400 mt-1">Calibrating GPS and Vector Layers</p>
    </div>
  ),
});

export default function HomePage() {
  const { activeTab, currentRoute } = useRouteContext();

  if (!currentRoute) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-slate-600">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-stagecoach-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold">Initializing Stagecoach RRA Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {activeTab === 'map' && <LeafletMap />}
      {activeTab === 'hazards' && <HazardRegister />}
      {activeTab === 'fleet' && <FleetCompatibility />}
      {activeTab === 'driver' && <DriverFlashcard />}
      {activeTab === 'governance' && <GovernanceSignOff />}
    </div>
  );
}
