'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MapPin, 
  Car, 
  Navigation, 
  Compass, 
  Save, 
  BedDouble, 
  Globe, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Calculator, 
  Info,
  Map as MapIcon,
  Fuel,
  Ship,
  Plane,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { calculateTravelCosts, findCoordinatesForLocation } from '@/lib/travelCalculator';
import { initialTravelConfig } from '@/lib/initialData';
import { CustomTravelZone } from '@/types/spud';
import dynamic from 'next/dynamic';

const UKRadiusMap = dynamic(
  () => import('./UKRadiusMap').then((mod) => mod.UKRadiusMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border h-[460px] flex items-center justify-center text-tartan-gold text-sm animate-pulse">
        <Compass className="w-5 h-5 mr-2 animate-spin text-tartan-gold" />
        <span>Loading Actual UK & Highland Map...</span>
      </div>
    )
  }
);

export const AdminTravelExpenses: React.FC = () => {
  const { travelConfig, updateTravelConfig } = useApp();

  const activeConfig = travelConfig || initialTravelConfig;

  // Local editing state with guaranteed fallbacks
  const [baseLocationName, setBaseLocationName] = useState(activeConfig?.baseLocationName || initialTravelConfig.baseLocationName);
  const [publicBaseDisplay, setPublicBaseDisplay] = useState(activeConfig?.publicBaseDisplay || initialTravelConfig.publicBaseDisplay || 'Aviemore, Highlands');
  const [exactAddressPrivate, setExactAddressPrivate] = useState(activeConfig?.exactAddressPrivate || initialTravelConfig.exactAddressPrivate || '16 Lodge Lane High Burnside, Aviemore, PH22 1UJ United Kingdom (Confidential)');
  const [basePostcode, setBasePostcode] = useState(activeConfig?.basePostcode || initialTravelConfig.basePostcode);
  const [baseLatitude, setBaseLatitude] = useState(activeConfig?.baseLatitude ?? initialTravelConfig.baseLatitude);
  const [baseLongitude, setBaseLongitude] = useState(activeConfig?.baseLongitude ?? initialTravelConfig.baseLongitude);
  const [freeRadiusMiles, setFreeRadiusMiles] = useState(activeConfig?.freeRadiusMiles ?? initialTravelConfig.freeRadiusMiles);
  const [costPerMileAboveFree, setCostPerMileAboveFree] = useState(activeConfig?.costPerMileAboveFree ?? initialTravelConfig.costPerMileAboveFree);
  const [chargeType, setChargeType] = useState<'one_way' | 'return'>(activeConfig?.chargeType || initialTravelConfig.chargeType);
  const [overnightThresholdMiles, setOvernightThresholdMiles] = useState(activeConfig?.overnightThresholdMiles ?? initialTravelConfig.overnightThresholdMiles);
  const [overnightFee, setOvernightFee] = useState(activeConfig?.overnightFee ?? initialTravelConfig.overnightFee);
  const [enableOvernightStay, setEnableOvernightStay] = useState(activeConfig?.enableOvernightStay ?? initialTravelConfig.enableOvernightStay);
  const [customZones, setCustomZones] = useState<CustomTravelZone[]>(activeConfig?.customZones || []);
  const [maxBookingRadiusMiles, setMaxBookingRadiusMiles] = useState(activeConfig?.maxBookingRadiusMiles ?? initialTravelConfig.maxBookingRadiusMiles);
  const [islandFerrySurcharge, setIslandFerrySurcharge] = useState(activeConfig?.islandFerrySurcharge ?? initialTravelConfig.islandFerrySurcharge);
  const [overseasEnquiryOnly, setOverseasEnquiryOnly] = useState(activeConfig?.overseasEnquiryOnly ?? initialTravelConfig.overseasEnquiryOnly);
  const [customTravelNotes, setCustomTravelNotes] = useState(activeConfig?.customTravelNotes || initialTravelConfig.customTravelNotes || '');

  // Synchronize state when travelConfig loads or updates from Firebase
  useEffect(() => {
    if (travelConfig) {
      setBaseLocationName(travelConfig.baseLocationName || initialTravelConfig.baseLocationName);
      setPublicBaseDisplay(travelConfig.publicBaseDisplay || initialTravelConfig.publicBaseDisplay || 'Aviemore, Highlands');
      setExactAddressPrivate(travelConfig.exactAddressPrivate || initialTravelConfig.exactAddressPrivate || '16 Lodge Lane High Burnside, Aviemore, PH22 1UJ United Kingdom (Confidential)');
      setBasePostcode(travelConfig.basePostcode || initialTravelConfig.basePostcode);
      setBaseLatitude(travelConfig.baseLatitude ?? initialTravelConfig.baseLatitude);
      setBaseLongitude(travelConfig.baseLongitude ?? initialTravelConfig.baseLongitude);
      setFreeRadiusMiles(travelConfig.freeRadiusMiles ?? initialTravelConfig.freeRadiusMiles);
      setCostPerMileAboveFree(travelConfig.costPerMileAboveFree ?? initialTravelConfig.costPerMileAboveFree);
      setChargeType(travelConfig.chargeType || initialTravelConfig.chargeType);
      setOvernightThresholdMiles(travelConfig.overnightThresholdMiles ?? initialTravelConfig.overnightThresholdMiles);
      setOvernightFee(travelConfig.overnightFee ?? initialTravelConfig.overnightFee);
      setEnableOvernightStay(travelConfig.enableOvernightStay ?? initialTravelConfig.enableOvernightStay);
      setCustomZones(travelConfig.customZones || []);
      setMaxBookingRadiusMiles(travelConfig.maxBookingRadiusMiles ?? initialTravelConfig.maxBookingRadiusMiles);
      setIslandFerrySurcharge(travelConfig.islandFerrySurcharge ?? initialTravelConfig.islandFerrySurcharge);
      setOverseasEnquiryOnly(travelConfig.overseasEnquiryOnly ?? initialTravelConfig.overseasEnquiryOnly);
      setCustomTravelNotes(travelConfig.customTravelNotes || initialTravelConfig.customTravelNotes || '');
    }
  }, [travelConfig]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Test Calculator state
  const [testPostcode, setTestPostcode] = useState('IV1 1AA');
  const [testVenueName, setTestVenueName] = useState('Inverness Castle');

  const handlePostcodeChange = (newPostcode: string) => {
    const upper = newPostcode.toUpperCase();
    setBasePostcode(upper);
    const resolved = findCoordinatesForLocation(upper);
    if (resolved) {
      setBaseLatitude(resolved.lat);
      setBaseLongitude(resolved.lng);
    }
  };

  const handleAddCustomZone = () => {
    const nextZoneNum = 4 + customZones.length;
    const minM = customZones.length === 0 
      ? Math.max(overnightThresholdMiles + 30, 160)
      : customZones[customZones.length - 1].maxMiles + 1;
    const maxM = minM + 50;

    const colors = ['#a855f7', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];
    const assignedColor = colors[customZones.length % colors.length];

    const newZone: CustomTravelZone = {
      id: `zone-${Date.now()}`,
      name: `Extended UK Transit (Zone ${nextZoneNum})`,
      minMiles: minM,
      maxMiles: maxM,
      ratePerMile: costPerMileAboveFree,
      fixedSurcharge: 0,
      enableOvernight: false,
      overnightFee: overnightFee,
      color: assignedColor,
      description: `Covers destinations between ${minM} and ${maxM} miles.`
    };

    setCustomZones([...customZones, newZone]);
  };

  const handleUpdateCustomZone = (id: string, updates: Partial<CustomTravelZone>) => {
    setCustomZones(customZones.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleRemoveCustomZone = (id: string) => {
    setCustomZones(customZones.filter(z => z.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    await updateTravelConfig({
      baseLocationName,
      publicBaseDisplay,
      exactAddressPrivate,
      basePostcode,
      baseLatitude: Number(baseLatitude),
      baseLongitude: Number(baseLongitude),
      freeRadiusMiles: Number(freeRadiusMiles),
      costPerMileAboveFree: Number(costPerMileAboveFree),
      chargeType,
      overnightThresholdMiles: Number(overnightThresholdMiles),
      overnightFee: Number(overnightFee),
      enableOvernightStay,
      customZones,
      maxBookingRadiusMiles: Number(maxBookingRadiusMiles),
      islandFerrySurcharge: Number(islandFerrySurcharge),
      overseasEnquiryOnly,
      customTravelNotes
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Preview config for live calculation
  const currentPreviewConfig = {
    baseLocationName,
    publicBaseDisplay,
    exactAddressPrivate,
    basePostcode,
    baseLatitude: Number(baseLatitude),
    baseLongitude: Number(baseLongitude),
    freeRadiusMiles: Number(freeRadiusMiles),
    costPerMileAboveFree: Number(costPerMileAboveFree),
    chargeType,
    overnightThresholdMiles: Number(overnightThresholdMiles),
    overnightFee: Number(overnightFee),
    enableOvernightStay,
    customZones,
    maxBookingRadiusMiles: Number(maxBookingRadiusMiles),
    islandFerrySurcharge: Number(islandFerrySurcharge),
    overseasEnquiryOnly,
    customTravelNotes
  };

  const testResult = calculateTravelCosts(testPostcode, testVenueName, '', currentPreviewConfig);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tartan-card p-6 rounded-3xl border border-tartan-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tartan-accent to-amber-600 flex items-center justify-center text-tartan-dark font-extrabold shadow-lg">
            <Compass className="w-6 h-6 text-tartan-dark" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif tracking-wide">
                Travel Radius & Distance Expenses Studio
              </h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Live Auto-Pricing
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Configure Spud&apos;s home base pin, 50-mile free travel radius, mileage rate, overnight allowances, and overseas booking safeguards.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          {isSaving ? (
            <span>Saving Config...</span>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-tartan-dark" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-tartan-dark" />
              <span>Save Travel Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Base Pin & Radius Tier Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Virtual Base Pin / Home Location */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>1. Virtual Base Pin & Home Location</span>
              </div>
              <span className="text-[11px] text-gray-400">All travel distances radiate from this pin</span>
            </div>

            {/* Privacy Safeguard Banner */}
            <div className="bg-emerald-950/40 border border-emerald-700/60 p-4 rounded-2xl space-y-1.5 text-xs text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Home Privacy Safeguard Active</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Spud&apos;s exact residential house and street address is stored <strong>privately in the Back Office only</strong> for accurate GPS mileage calculations. The public website and client booking receipts will strictly display only <strong className="text-tartan-gold">&quot;Aviemore, Highlands&quot;</strong> as your central base location.
              </p>
            </div>

            {/* Private Exact Address & Public Display Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>Exact Home Address (Private Admin)</span>
                  <span className="text-[10px] text-emerald-500 font-normal">Hidden from public</span>
                </label>
                <input
                  type="text"
                  value={exactAddressPrivate}
                  onChange={(e) => setExactAddressPrivate(e.target.value)}
                  placeholder="e.g. 16 Lodge Lane High Burnside, Aviemore, PH22 1UJ"
                  className="w-full bg-tartan-dark border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1 flex items-center justify-between">
                  <span>Public Central Location Label</span>
                  <span className="text-[10px] text-gray-400 font-normal">Visible on quotes</span>
                </label>
                <input
                  type="text"
                  value={publicBaseDisplay}
                  onChange={(e) => setPublicBaseDisplay(e.target.value)}
                  placeholder="e.g. Aviemore, Highlands"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-tartan-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Base Location Name
                </label>
                <input
                  type="text"
                  value={baseLocationName}
                  onChange={(e) => setBaseLocationName(e.target.value)}
                  placeholder="e.g. Spud's Highland Home Base"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center justify-between">
                  <span>Calculation Base Postcode *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Auto-locates GPS</span>
                </label>
                <input
                  type="text"
                  value={basePostcode}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  placeholder="e.g. PH22 1UJ"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Latitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={baseLatitude}
                  onChange={(e) => setBaseLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-tartan-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Longitude Coordinate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={baseLongitude}
                  onChange={(e) => setBaseLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-tartan-accent"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Radius Zones & Expense Rules */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>2. Radius Zones & Pricing Rates</span>
              </div>
              <span className="text-[11px] text-gray-400">Automated Mileage Calculation</span>
            </div>

            {/* Zone 1: Free Radius */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Free Travel Radius (Zone 1)</span>
                </div>
                <span className="text-emerald-400 font-extrabold text-sm">FREE (£0.00)</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Any event within this radius from Spud&apos;s home base incurs zero extra travel charge.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={freeRadiusMiles}
                  onChange={(e) => setFreeRadiusMiles(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <div className="w-24 px-3 py-1.5 rounded-xl bg-tartan-dark border border-emerald-600/60 text-center font-bold text-emerald-300 text-sm">
                  {freeRadiusMiles} miles
                </div>
              </div>
            </div>

            {/* Zone 2: Mileage Rate */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-tartan-gold text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Extended Mileage Rate (Zone 2)</span>
                </div>
                <span className="text-tartan-gold font-bold text-xs">Charged beyond {freeRadiusMiles} miles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Cost Per Chargeable Mile (£)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">£</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={costPerMileAboveFree}
                      onChange={(e) => setCostPerMileAboveFree(parseFloat(e.target.value) || 0)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-8 pr-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Recommended standard: £0.50 – £0.80 / mile</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Trip Multiplier
                  </label>
                  <select
                    value={chargeType}
                    onChange={(e) => setChargeType(e.target.value as 'one_way' | 'return')}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="return">Round Trip (Both Ways - Recommended)</option>
                    <option value="one_way">One-Way Only</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Calculates return fuel & driving time</p>
                </div>
              </div>
            </div>

            {/* Zone 3: Extended Distance & Long Journeys */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Extended Distance & Long Journeys (Zone 3)
                    </span>
                    <span className="text-[11px] text-gray-300">
                      Journeys &ge; {overnightThresholdMiles} miles from base
                    </span>
                  </div>
                </div>
                <span className="text-blue-400 font-bold text-xs bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                  Mileage Always Charged
                </span>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                Standard travel mileage (£{costPerMileAboveFree.toFixed(2)}/mi) is <strong>always charged</strong> for trips reaching into Zone 3. You can also optionally enable an overnight accommodation allowance below if Spud needs hotel lodging.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Zone 3 Distance Threshold (miles)
                  </label>
                  <input
                    type="number"
                    value={overnightThresholdMiles}
                    onChange={(e) => setOvernightThresholdMiles(parseInt(e.target.value) || 0)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Distance trigger for long-distance Highlands & rest of UK</p>
                </div>

                <div className="bg-tartan-dark/80 rounded-xl p-3 border border-tartan-border/80 flex flex-col justify-between">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-blue-400" />
                      Optional Overnight Stay Fee
                    </span>
                    <input
                      type="checkbox"
                      checked={enableOvernightStay}
                      onChange={(e) => setEnableOvernightStay(e.target.checked)}
                      className="accent-blue-500 rounded w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {enableOvernightStay
                      ? `Enabled: Fixed £${overnightFee} accommodation fee added to quote.`
                      : 'Disabled: Travel mileage only (no accommodation fee added).'}
                  </span>
                </div>
              </div>

              {enableOvernightStay && (
                <div className="pt-2 border-t border-tartan-border/40">
                  <label className="block text-[11px] font-semibold text-blue-300 mb-1">
                    Fixed Accommodation Allowance Fee (£)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">£</span>
                    <input
                      type="number"
                      value={overnightFee}
                      onChange={(e) => setOvernightFee(parseFloat(e.target.value) || 0)}
                      className="w-full bg-tartan-dark border border-blue-600/70 rounded-xl pl-8 pr-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Covers Highland B&B / hotel stay for multi-hour distant events</p>
                </div>
              )}
            </div>

            {/* Dynamic Intermediate Custom Zones */}
            {customZones.map((cz, index) => {
              const zoneNum = 4 + index;
              const zoneColor = cz.color || '#a855f7';
              return (
                <div key={cz.id} className="bg-tartan-navy/70 rounded-2xl p-4 border border-purple-800/60 shadow-lg space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm" style={{ backgroundColor: zoneColor }}>
                        {zoneNum}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block">
                          Intermediate Travel Zone {zoneNum}
                        </span>
                        <span className="text-[10px] text-gray-300">
                          {cz.minMiles} – {cz.maxMiles} miles from base
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustomZone(cz.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-xs flex items-center gap-1 transition-all"
                      title="Delete this custom zone"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-semibold">Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Zone Name / Label
                      </label>
                      <input
                        type="text"
                        value={cz.name}
                        onChange={(e) => handleUpdateCustomZone(cz.id, { name: e.target.value })}
                        placeholder="e.g. Extended Borders & North England"
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-300 mb-1">
                          Min Distance (mi)
                        </label>
                        <input
                          type="number"
                          value={cz.minMiles}
                          onChange={(e) => handleUpdateCustomZone(cz.id, { minMiles: parseInt(e.target.value) || 0 })}
                          className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-300 mb-1">
                          Max Distance (mi)
                        </label>
                        <input
                          type="number"
                          value={cz.maxMiles}
                          onChange={(e) => handleUpdateCustomZone(cz.id, { maxMiles: parseInt(e.target.value) || 0 })}
                          className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-300 mb-1">
                        Rate Per Mile (£)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={cz.ratePerMile ?? costPerMileAboveFree}
                        onChange={(e) => handleUpdateCustomZone(cz.id, { ratePerMile: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-300 mb-1">
                        Fixed Zone Surcharge (£)
                      </label>
                      <input
                        type="number"
                        value={cz.fixedSurcharge || 0}
                        onChange={(e) => handleUpdateCustomZone(cz.id, { fixedSurcharge: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-300">
                        <input
                          type="checkbox"
                          checked={cz.enableOvernight || false}
                          onChange={(e) => handleUpdateCustomZone(cz.id, { enableOvernight: e.target.checked })}
                          className="accent-purple-500 rounded w-3.5 h-3.5"
                        />
                        <span>Hotel Stay (£{cz.overnightFee || overnightFee})</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Zone Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddCustomZone}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-tartan-navy to-purple-950/60 hover:from-purple-900/80 hover:to-purple-900/80 border border-purple-600/60 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01]"
              >
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span>+ Add New Intermediate Zone (Zone {4 + customZones.length})</span>
              </button>
            </div>

            {/* Zone Max: Maximum Distance & Overseas Safeguard */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                    {4 + customZones.length}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Zone {4 + customZones.length}: Max Distance & Overseas Safeguard
                    </span>
                    <span className="text-[10px] text-gray-300">
                      Journeys &gt; {maxBookingRadiusMiles} miles from base
                    </span>
                  </div>
                </div>
                <span className="text-amber-400 font-bold text-xs">Custom Quote Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Maximum Direct Booking Radius (miles)
                  </label>
                  <input
                    type="number"
                    value={maxBookingRadiusMiles}
                    onChange={(e) => setMaxBookingRadiusMiles(parseInt(e.target.value) || 0)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Events beyond this become Bespoke Enquiries</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Island / Ferry Transit Surcharge (£)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">£</span>
                    <input
                      type="number"
                      value={islandFerrySurcharge}
                      onChange={(e) => setIslandFerrySurcharge(parseFloat(e.target.value) || 0)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-8 pr-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">For Skye, Mull, Islay, Orkney, Arran, etc.</p>
                </div>
              </div>
            </div>

            {/* Custom Travel Terms Text */}
            <div>
              <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                Client Receipt / Travel Explanatory Notes
              </label>
              <textarea
                rows={2}
                value={customTravelNotes}
                onChange={(e) => setCustomTravelNotes(e.target.value)}
                placeholder="Notes visible on quote breakdowns..."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-tartan-accent"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Visual UK Map & Live Test Calculator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Authentic UK Radius Zone Map */}
          <UKRadiusMap
            config={{
              baseLocationName,
              publicBaseDisplay,
              exactAddressPrivate,
              basePostcode,
              baseLatitude,
              baseLongitude,
              freeRadiusMiles,
              costPerMileAboveFree,
              chargeType,
              enableOvernightStay,
              customZones,
              overnightThresholdMiles,
              overnightFee,
              maxBookingRadiusMiles,
              islandFerrySurcharge,
              overseasEnquiryOnly,
              customTravelNotes
            }}
            onSelectTestCity={(postcode, name) => {
              setTestPostcode(postcode);
              setTestVenueName(name);
            }}
          />

          {/* Card 3: Interactive Travel Expense Sandbox & Test Simulator */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Live Travel Sandbox Test</span>
              </div>
              <span className="text-[11px] text-gray-400">Instant Estimate Preview</span>
            </div>

            <p className="text-xs text-gray-300">
              Type any venue or postcode to test what a client will see during booking:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Test Venue Postcode / Destination
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPostcode}
                    onChange={(e) => setTestPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. EH30 9SP, IV40 8DX, W1A 1AA..."
                    className="flex-1 bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white text-xs font-bold uppercase focus:outline-none focus:border-tartan-accent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const samplePostcodes = ['EH30 9SP', 'FK8 1EJ', 'PH22 1QH', 'IV40 8DX', 'IV51 9EJ', 'DG16 5EA', 'SW1A 1AA', 'Amsterdam, Netherlands'];
                      const random = samplePostcodes[Math.floor(Math.random() * samplePostcodes.length)];
                      setTestPostcode(random);
                      setTestVenueName(random);
                    }}
                    className="px-3 py-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-tartan-gold text-xs font-bold border border-tartan-border"
                    title="Load a random Scottish/UK/Overseas test location"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Test Venue Name (Optional)
                </label>
                <input
                  type="text"
                  value={testVenueName}
                  onChange={(e) => setTestVenueName(e.target.value)}
                  placeholder="e.g. Dundas Castle / Eilean Donan..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-tartan-accent"
                />
              </div>
            </div>

            {/* Test Calculation Output Card */}
            <div className="bg-tartan-navy rounded-2xl p-4 border border-tartan-border space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Calculation Outcome:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  testResult.isWithinFreeRadius
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : testResult.isOverseasOrMaxDistance
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-yellow-950 text-yellow-300 border border-yellow-700'
                }`}>
                  {testResult.isWithinFreeRadius
                    ? 'Zone 1: FREE'
                    : testResult.isOverseasOrMaxDistance
                    ? 'Zone 4: Bespoke Enquiry'
                    : 'Zone 2/3: Additional Expenses'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-gray-400 block text-[10px]">Distance from Base:</span>
                  <span className="text-white font-extrabold text-sm">{testResult.distanceMiles} miles</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Calculated Travel Surcharge:</span>
                  <span className="text-tartan-gold font-extrabold text-sm">
                    {testResult.isOverseasOrMaxDistance ? 'Bespoke Quote' : `£${testResult.totalTravelExpense.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {testResult.isOvernightTriggered && (
                <div className="flex items-center gap-1.5 text-blue-300 text-[11px] bg-blue-950/40 p-2 rounded-xl border border-blue-800">
                  <BedDouble className="w-3.5 h-3.5 shrink-0" />
                  <span>Includes £{testResult.overnightCost} overnight hotel stay allowance.</span>
                </div>
              )}

              {testResult.isIslandOrFerry && (
                <div className="flex items-center gap-1.5 text-purple-300 text-[11px] bg-purple-950/40 p-2 rounded-xl border border-purple-800">
                  <Ship className="w-3.5 h-3.5 shrink-0" />
                  <span>Includes £{testResult.islandSurcharge} island ferry transit surcharge.</span>
                </div>
              )}

              <p className="text-[11px] text-gray-300 bg-tartan-dark/80 p-2.5 rounded-xl border border-tartan-border/60">
                <strong className="text-tartan-gold">Client Summary:</strong> {testResult.explanationText}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
