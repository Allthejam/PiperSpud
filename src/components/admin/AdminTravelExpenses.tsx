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
  Plane
} from 'lucide-react';
import { calculateTravelCosts, findCoordinatesForLocation } from '@/lib/travelCalculator';
import { initialTravelConfig } from '@/lib/initialData';

export const AdminTravelExpenses: React.FC = () => {
  const { travelConfig, updateTravelConfig } = useApp();

  const activeConfig = travelConfig || initialTravelConfig;

  // Local editing state with guaranteed fallbacks
  const [baseLocationName, setBaseLocationName] = useState(activeConfig?.baseLocationName || initialTravelConfig.baseLocationName);
  const [basePostcode, setBasePostcode] = useState(activeConfig?.basePostcode || initialTravelConfig.basePostcode);
  const [baseLatitude, setBaseLatitude] = useState(activeConfig?.baseLatitude ?? initialTravelConfig.baseLatitude);
  const [baseLongitude, setBaseLongitude] = useState(activeConfig?.baseLongitude ?? initialTravelConfig.baseLongitude);
  const [freeRadiusMiles, setFreeRadiusMiles] = useState(activeConfig?.freeRadiusMiles ?? initialTravelConfig.freeRadiusMiles);
  const [costPerMileAboveFree, setCostPerMileAboveFree] = useState(activeConfig?.costPerMileAboveFree ?? initialTravelConfig.costPerMileAboveFree);
  const [chargeType, setChargeType] = useState<'one_way' | 'return'>(activeConfig?.chargeType || initialTravelConfig.chargeType);
  const [overnightThresholdMiles, setOvernightThresholdMiles] = useState(activeConfig?.overnightThresholdMiles ?? initialTravelConfig.overnightThresholdMiles);
  const [overnightFee, setOvernightFee] = useState(activeConfig?.overnightFee ?? initialTravelConfig.overnightFee);
  const [enableOvernightStay, setEnableOvernightStay] = useState(activeConfig?.enableOvernightStay ?? initialTravelConfig.enableOvernightStay);
  const [maxBookingRadiusMiles, setMaxBookingRadiusMiles] = useState(activeConfig?.maxBookingRadiusMiles ?? initialTravelConfig.maxBookingRadiusMiles);
  const [islandFerrySurcharge, setIslandFerrySurcharge] = useState(activeConfig?.islandFerrySurcharge ?? initialTravelConfig.islandFerrySurcharge);
  const [overseasEnquiryOnly, setOverseasEnquiryOnly] = useState(activeConfig?.overseasEnquiryOnly ?? initialTravelConfig.overseasEnquiryOnly);
  const [customTravelNotes, setCustomTravelNotes] = useState(activeConfig?.customTravelNotes || initialTravelConfig.customTravelNotes || '');

  // Synchronize state when travelConfig loads or updates from Firebase
  useEffect(() => {
    if (travelConfig) {
      setBaseLocationName(travelConfig.baseLocationName || initialTravelConfig.baseLocationName);
      setBasePostcode(travelConfig.basePostcode || initialTravelConfig.basePostcode);
      setBaseLatitude(travelConfig.baseLatitude ?? initialTravelConfig.baseLatitude);
      setBaseLongitude(travelConfig.baseLongitude ?? initialTravelConfig.baseLongitude);
      setFreeRadiusMiles(travelConfig.freeRadiusMiles ?? initialTravelConfig.freeRadiusMiles);
      setCostPerMileAboveFree(travelConfig.costPerMileAboveFree ?? initialTravelConfig.costPerMileAboveFree);
      setChargeType(travelConfig.chargeType || initialTravelConfig.chargeType);
      setOvernightThresholdMiles(travelConfig.overnightThresholdMiles ?? initialTravelConfig.overnightThresholdMiles);
      setOvernightFee(travelConfig.overnightFee ?? initialTravelConfig.overnightFee);
      setEnableOvernightStay(travelConfig.enableOvernightStay ?? initialTravelConfig.enableOvernightStay);
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
  const [testPostcode, setTestPostcode] = useState('EH30 9SP');
  const [testVenueName, setTestVenueName] = useState('Dundas Castle, South Queensferry');

  // Quick base presets for Spud
  const basePresets = [
    { name: 'Edinburgh & Lothians', postcode: 'EH1 1AA', lat: 55.9533, lng: -3.1883 },
    { name: 'Aviemore & Cairngorms', postcode: 'PH22 1QH', lat: 57.1983, lng: -3.8291 },
    { name: 'Inverness & Highlands', postcode: 'IV1 1AA', lat: 57.4778, lng: -4.2247 },
    { name: 'Stirling & Central', postcode: 'FK8 1EJ', lat: 56.1165, lng: -3.9369 },
    { name: 'Glasgow & Clyde', postcode: 'G1 1AA', lat: 55.8642, lng: -4.2518 }
  ];

  const handleApplyPreset = (preset: typeof basePresets[0]) => {
    setBaseLocationName(preset.name);
    setBasePostcode(preset.postcode);
    setBaseLatitude(preset.lat);
    setBaseLongitude(preset.lng);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    await updateTravelConfig({
      baseLocationName,
      basePostcode,
      baseLatitude: Number(baseLatitude),
      baseLongitude: Number(baseLongitude),
      freeRadiusMiles: Number(freeRadiusMiles),
      costPerMileAboveFree: Number(costPerMileAboveFree),
      chargeType,
      overnightThresholdMiles: Number(overnightThresholdMiles),
      overnightFee: Number(overnightFee),
      enableOvernightStay,
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
    basePostcode,
    baseLatitude: Number(baseLatitude),
    baseLongitude: Number(baseLongitude),
    freeRadiusMiles: Number(freeRadiusMiles),
    costPerMileAboveFree: Number(costPerMileAboveFree),
    chargeType,
    overnightThresholdMiles: Number(overnightThresholdMiles),
    overnightFee: Number(overnightFee),
    enableOvernightStay,
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

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-2">
                Quick Highland / Scottish Base Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {basePresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      basePostcode === preset.postcode
                        ? 'bg-tartan-gold text-tartan-dark border-yellow-300 shadow-md font-bold'
                        : 'bg-tartan-navy text-gray-300 border-tartan-border hover:bg-slate-700'
                    }`}
                  >
                    {preset.name} ({preset.postcode})
                  </button>
                ))}
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
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                  Base Home Postcode *
                </label>
                <input
                  type="text"
                  value={basePostcode}
                  onChange={(e) => setBasePostcode(e.target.value.toUpperCase())}
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-tartan-accent"
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

            {/* Zone 3: Overnight Accommodation */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Overnight Stay Allowance (Zone 3)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableOvernightStay}
                    onChange={(e) => setEnableOvernightStay(e.target.checked)}
                    className="accent-tartan-gold rounded w-4 h-4"
                  />
                  <span className="text-xs text-gray-300 font-semibold">Enable Overnight Fee</span>
                </label>
              </div>

              {enableOvernightStay && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Distance Trigger Threshold (miles)
                    </label>
                    <input
                      type="number"
                      value={overnightThresholdMiles}
                      onChange={(e) => setOvernightThresholdMiles(parseInt(e.target.value) || 0)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Automatically applies when distance &ge; this limit</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Fixed Accommodation Allowance (£)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">£</span>
                      <input
                        type="number"
                        value={overnightFee}
                        onChange={(e) => setOvernightFee(parseFloat(e.target.value) || 0)}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-8 pr-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-tartan-accent"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Covers Highland B&B / hotel stay</p>
                  </div>
                </div>
              )}
            </div>

            {/* Zone 4: Maximum Distance & Overseas Safeguard */}
            <div className="bg-tartan-navy/60 rounded-2xl p-4 border border-tartan-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">4</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Max Distance & Overseas Enquiry Mode</span>
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

        {/* Right Column: Visual Radar Map & Live Test Calculator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Visual Radius Radar Card */}
          <div className="bg-tartan-card rounded-3xl p-6 border border-tartan-border/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
              <div className="flex items-center gap-2 text-tartan-gold font-bold text-sm uppercase tracking-wider">
                <MapIcon className="w-4 h-4" />
                <span>Radius Zone Visualizer</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">RADAR 360°</span>
            </div>

            {/* Radar Diagram */}
            <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-slate-950 via-tartan-dark to-slate-950 border border-tartan-border overflow-hidden flex items-center justify-center p-4">
              
              {/* Concentric Zone Rings */}
              {/* Zone 4: Max limit */}
              <div className="absolute w-[92%] h-[92%] rounded-full border border-dashed border-amber-600/40 flex items-center justify-center">
                <span className="absolute top-2 text-[9px] font-bold text-amber-500/80 uppercase">
                  Zone 4: &gt; {maxBookingRadiusMiles}mi (Overseas / Enquiry Only)
                </span>
              </div>

              {/* Zone 3: Overnight stay */}
              {enableOvernightStay && (
                <div className="absolute w-[68%] h-[68%] rounded-full border border-blue-500/40 bg-blue-950/10 flex items-center justify-center">
                  <span className="absolute top-2 text-[9px] font-bold text-blue-400/80 uppercase">
                    Zone 3: &gt; {overnightThresholdMiles}mi (+£{overnightFee} Overnight)
                  </span>
                </div>
              )}

              {/* Zone 2: Chargeable Mileage */}
              <div className="absolute w-[44%] h-[44%] rounded-full border border-yellow-500/50 bg-amber-950/20 flex items-center justify-center">
                <span className="absolute top-2 text-[9px] font-bold text-yellow-300 uppercase">
                  Zone 2: @ £{costPerMileAboveFree.toFixed(2)}/mi
                </span>
              </div>

              {/* Zone 1: Free Radius */}
              <div className="absolute w-[24%] h-[24%] rounded-full border-2 border-emerald-500 bg-emerald-950/40 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-tighter">
                  FREE 50mi
                </span>
              </div>

              {/* Center Home Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gold-gradient text-tartan-dark font-extrabold flex items-center justify-center shadow-2xl ring-4 ring-yellow-400/30 animate-pulse">
                  <MapPin className="w-4 h-4 text-tartan-dark fill-current" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-full border border-tartan-gold/40">
                  {basePostcode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>0 – {freeRadiusMiles} mi: Free Travel</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-300">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span>{freeRadiusMiles}+ mi: £{costPerMileAboveFree.toFixed(2)}/mi</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>&gt; {overnightThresholdMiles} mi: +£{overnightFee} Hotel</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>&gt; {maxBookingRadiusMiles} mi: Enquiry Only</span>
              </div>
            </div>
          </div>

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
