'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Info, Eye, Layers, Compass, BedDouble, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateTravelCosts } from '@/lib/travelCalculator';
import { TravelExpensesConfig } from '@/types/spud';

interface UKRadiusMapProps {
  config: TravelExpensesConfig;
  onSelectTestCity?: (postcode: string, name: string) => void;
}

interface UKCityPoint {
  name: string;
  postcode: string;
  region: string;
  lat: number;
  lng: number;
  isIsland?: boolean;
}

const NOTABLE_UK_LOCATIONS: UKCityPoint[] = [
  // Highland Base & Zone 1 Hubs
  { name: 'Inverness', postcode: 'IV1 1AA', region: 'Highlands & Loch Ness', lat: 57.4778, lng: -4.2247 },
  { name: 'Elgin', postcode: 'IV30 1AB', region: 'Moray & Speyside', lat: 57.6499, lng: -3.3184 },
  { name: 'Pitlochry', postcode: 'PH16 5AA', region: 'Perthshire Glens', lat: 56.7044, lng: -3.7297 },
  { name: 'Grantown-on-Spey', postcode: 'PH26 3HG', region: 'Cairngorms National Park', lat: 57.3300, lng: -3.6100 },
  
  // Zone 2 Hubs
  { name: 'Fort William', postcode: 'PH33 6AA', region: 'Lochaber & Ben Nevis', lat: 56.8198, lng: -5.1052 },
  { name: 'Aberdeen', postcode: 'AB10 1AA', region: 'Granite City & Deeside', lat: 57.1497, lng: -2.0943 },
  { name: 'Dundee', postcode: 'DD1 1AA', region: 'Tay & Angus', lat: 56.4620, lng: -2.9707 },
  { name: 'Perth', postcode: 'PH1 5AA', region: 'Perthshire', lat: 56.3950, lng: -3.4308 },
  { name: 'Stirling', postcode: 'FK8 1EJ', region: 'Stirling Castle & Forth', lat: 56.1165, lng: -3.9369 },
  { name: 'Edinburgh', postcode: 'EH1 1AA', region: 'Capital & Lothians', lat: 55.9533, lng: -3.1883 },
  { name: 'Glasgow', postcode: 'G1 1AA', region: 'Clyde & West Coast', lat: 55.8642, lng: -4.2518 },
  { name: 'Isle of Skye', postcode: 'IV51 9EJ', region: 'Inner Hebrides', lat: 57.4120, lng: -6.1960, isIsland: true },
  
  // Zone 3 Hubs (Extended & Southern Scotland / North England)
  { name: 'Dumfries & Gretna', postcode: 'DG16 5EA', region: 'Borders / Gretna Green', lat: 54.9967, lng: -3.0645 },
  { name: 'Stornoway (Lewis)', postcode: 'HS1 2AA', region: 'Outer Hebrides', lat: 58.2094, lng: -6.3849, isIsland: true },
  { name: 'Kirkwall (Orkney)', postcode: 'KW15 1AA', region: 'Northern Isles', lat: 58.9814, lng: -2.9605, isIsland: true },
  { name: 'Newcastle', postcode: 'NE1 1AA', region: 'North East England', lat: 54.9783, lng: -1.6178 },
  
  // Zone 4 Hubs (Max Distance / Rest of UK)
  { name: 'Manchester', postcode: 'M1 1AA', region: 'North West England', lat: 53.4808, lng: -2.2426 },
  { name: 'London', postcode: 'SW1A 1AA', region: 'Greater London', lat: 51.5074, lng: -0.1278 }
];

export const UKRadiusMap: React.FC<UKRadiusMapProps> = ({ config, onSelectTestCity }) => {
  const [selectedLocation, setSelectedLocation] = useState<UKCityPoint | null>(null);
  const [viewMode, setViewMode] = useState<'geo' | 'leaflet'>('geo');
  const [hoveredLocation, setHoveredLocation] = useState<UKCityPoint | null>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  const baseLat = config.baseLatitude || 57.1955;
  const baseLng = config.baseLongitude || -3.8350;
  const freeMiles = config.freeRadiusMiles || 50;
  const overnightMiles = config.overnightThresholdMiles || 120;
  const maxMiles = config.maxBookingRadiusMiles || 250;

  // Geographic SVG Map Dimensions and Projection
  const mapWidth = 520;
  const mapHeight = 620;
  
  // UK Bounding Box for SVG rendering
  const minLat = 50.0;
  const maxLat = 60.5;
  const minLng = -8.5;
  const maxLng = 2.0;

  const projectToSvg = (lat: number, lng: number) => {
    // Mercator-adjusted Equirectangular projection
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };

  // Convert radius in miles to horizontal/vertical SVG pixels
  const getRadiusPixels = (miles: number) => {
    // 1 deg Lat ~= 69.17 miles
    const latSpanMiles = (maxLat - minLat) * 69.17;
    const ry = (miles / latSpanMiles) * mapHeight;
    
    // 1 deg Lng at 57° Lat ~= 37.67 miles
    const lngSpanMiles = (maxLng - minLng) * 37.67;
    const rx = (miles / lngSpanMiles) * mapWidth;
    return { rx, ry };
  };

  const basePoint = projectToSvg(baseLat, baseLng);
  const zone1Radius = getRadiusPixels(freeMiles);
  const zone2Radius = getRadiusPixels(Math.min(overnightMiles, maxMiles));
  const zone3Radius = getRadiusPixels(overnightMiles);
  const zone4Radius = getRadiusPixels(maxMiles);

  // Leaflet Map Initialization
  useEffect(() => {
    if (viewMode !== 'leaflet' || !leafletContainerRef.current) return;

    let isMounted = true;

    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Ensure stylesheet is attached
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!isMounted || !leafletContainerRef.current) return;

        // Clean up previous instance if exists
        if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.remove();
          leafletMapInstanceRef.current = null;
        }

        const map = L.map(leafletContainerRef.current, {
          center: [baseLat, baseLng],
          zoom: 7,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // Dark Matter / CartoDB Voyager Map Tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Spud the Piper',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        // Zone 4: Max booking boundary
        L.circle([baseLat, baseLng], {
          radius: maxMiles * 1609.34,
          color: '#f59e0b',
          dashArray: '6, 8',
          fillColor: '#f59e0b',
          fillOpacity: 0.04,
          weight: 1.5
        }).addTo(map).bindTooltip(`Zone 4: > ${maxMiles}mi (Overseas / Bespoke)`, { sticky: true });

        // Zone 3: Extended / Long Distance (Always active!)
        L.circle([baseLat, baseLng], {
          radius: overnightMiles * 1609.34,
          color: '#60a5fa',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 1.5
        }).addTo(map).bindTooltip(
          `Zone 3: > ${overnightMiles}mi (${config.enableOvernightStay ? `+£${config.overnightFee} Overnight` : 'Extended Mileage Rate'})`,
          { sticky: true }
        );

        // Zone 1: Free 50-Mile Radius
        L.circle([baseLat, baseLng], {
          radius: freeMiles * 1609.34,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.18,
          weight: 2
        }).addTo(map).bindTooltip(`Zone 1: FREE Travel (${freeMiles} Miles from Aviemore)`, { sticky: true });

        // Base Pin (Aviemore)
        const baseIcon = L.divIcon({
          className: 'custom-base-pin',
          html: `
            <div style="background: linear-gradient(135deg, #d4af37, #f3e5ab); color: #0b1329; border: 2px solid #fff; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 0 15px rgba(212,175,55,0.8);">
              ★
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([baseLat, baseLng], { icon: baseIcon })
          .addTo(map)
          .bindPopup(`
            <div style="color: #0b1329; font-family: sans-serif; padding: 4px;">
              <strong style="color: #854d0e; font-size: 13px;">${config.publicBaseDisplay || 'Aviemore, Highlands'}</strong><br/>
              <span style="font-size: 11px; color: #4b5563;">Postcode: ${config.basePostcode}</span><br/>
              <span style="font-size: 11px; font-weight: bold; color: #059669;">★ Spud's Central Home Base</span>
            </div>
          `)
          .openPopup();

        // Add City Hub Markers
        NOTABLE_UK_LOCATIONS.forEach(loc => {
          const cost = calculateTravelCosts(loc.postcode, loc.name, '', config);
          const marker = L.circleMarker([loc.lat, loc.lng], {
            radius: 5,
            fillColor: cost.isWithinFreeRadius ? '#10b981' : cost.isOverseasOrMaxDistance ? '#f59e0b' : '#eab308',
            color: '#ffffff',
            weight: 1,
            fillOpacity: 0.9
          }).addTo(map);

          marker.bindTooltip(`
            <div style="font-size: 11px; font-family: sans-serif; line-height: 1.3;">
              <strong>${loc.name}</strong> (${loc.region})<br/>
              Distance: <b>${cost.distanceMiles} miles</b><br/>
              Travel Surcharge: <b style="color: #d97706;">${cost.isWithinFreeRadius ? 'FREE' : cost.isOverseasOrMaxDistance ? 'Bespoke' : `£${cost.totalTravelExpense}`}</b>
            </div>
          `, { sticky: true });

          marker.on('click', () => {
            setSelectedLocation(loc);
            if (onSelectTestCity) onSelectTestCity(loc.postcode, loc.name);
          });
        });

        leafletMapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [viewMode, baseLat, baseLng, freeMiles, overnightMiles, maxMiles, config.enableOvernightStay, config.overnightFee]);

  return (
    <div className="bg-tartan-card rounded-3xl p-5 sm:p-6 border border-tartan-border/80 shadow-2xl space-y-4">
      {/* Header & Map Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tartan-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-tartan-gold/10 border border-tartan-gold/30 flex items-center justify-center text-tartan-gold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>UK Radius Zone Map</span>
              <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Live Geography
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">Centered on Spud&apos;s base ({config.publicBaseDisplay || 'Aviemore'})</p>
          </div>
        </div>

        {/* View Switcher: High-Precision Vector Geo vs Leaflet Satellite */}
        <div className="flex items-center bg-tartan-dark rounded-xl p-1 border border-tartan-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('geo')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'geo'
                ? 'bg-tartan-navy text-tartan-gold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            UK Graphic Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('leaflet')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'leaflet'
                ? 'bg-tartan-navy text-tartan-gold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive OSM</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] max-h-[540px] rounded-2xl bg-gradient-to-b from-slate-950 via-[#070e1c] to-slate-950 border border-tartan-border overflow-hidden shadow-inner flex items-center justify-center">
        
        {viewMode === 'leaflet' ? (
          <div ref={leafletContainerRef} className="w-full h-full z-0" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-2 select-none">
            
            {/* SVG UK Coastline & Geographic Landmass */}
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full max-h-[500px] object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
            >
              <defs>
                {/* Tartan Gradients */}
                <radialGradient id="zone1Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
                <radialGradient id="zone2Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                </radialGradient>
                <radialGradient id="zone3Grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </radialGradient>
                <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Geographic UK Coastline Silhouette (Scotland, England, Wales, Ireland, Islands) */}
              <g className="fill-slate-900/90 stroke-slate-700/60 stroke-[1.2]">
                {/* Mainland Scotland & Northern Highlands */}
                <path d="M 230,95 L 250,90 L 285,115 L 305,145 L 320,155 L 335,190 L 315,220 L 310,240 L 290,265 L 280,290 L 270,305 L 245,310 L 225,295 L 205,300 L 180,285 L 185,250 L 175,220 L 195,185 L 190,150 L 205,120 Z" />
                {/* Moray Firth & Grampian coast */}
                <path d="M 245,145 L 270,140 L 315,155 L 325,185 L 315,220 Z" />
                {/* Isle of Skye & Inner Hebrides */}
                <path d="M 160,165 L 175,170 L 170,195 L 155,185 Z" />
                <path d="M 165,225 L 180,230 L 175,250 L 160,240 Z" />
                {/* Lewis & Harris (Outer Hebrides) */}
                <path d="M 135,115 L 150,110 L 155,145 L 140,165 L 130,140 Z" />
                {/* Orkney Islands */}
                <path d="M 290,60 L 310,55 L 315,75 L 295,80 Z" />
                {/* Shetland Islands */}
                <path d="M 370,15 L 385,10 L 390,35 L 375,40 Z" />
                
                {/* England & Wales */}
                <path d="M 270,305 L 295,315 L 325,360 L 355,410 L 370,445 L 350,480 L 355,510 L 335,535 L 290,545 L 250,540 L 210,555 L 190,540 L 220,505 L 230,465 L 210,435 L 240,400 L 260,345 Z" />
                {/* Wales peninsula */}
                <path d="M 230,430 L 190,440 L 175,475 L 200,500 L 230,490 Z" />
                {/* Northern Ireland */}
                <path d="M 130,300 L 170,295 L 175,335 L 135,340 Z" />
              </g>

              {/* Waterway Accents & Scottish Lochs */}
              <path d="M 215,175 L 245,160" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />
              <text x="210" y="170" fill="#38bdf8" fontSize="8" fontWeight="bold">Loch Ness</text>

              {/* ZONE 4: Max Booking Radius Circle (> 250 miles / Overseas) */}
              <ellipse
                cx={basePoint.x}
                cy={basePoint.y}
                rx={zone4Radius.rx}
                ry={zone4Radius.ry}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
              <text
                x={basePoint.x}
                y={basePoint.y - zone4Radius.ry + 12}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="8.5"
                fontWeight="bold"
                letterSpacing="0.5"
              >
                ZONE 4: &gt; {maxMiles} MILES (OVERSEAS / BESPOKE)
              </text>

              {/* ZONE 3: Extended Distance Circle (ALWAYS VISIBLE!) */}
              <ellipse
                cx={basePoint.x}
                cy={basePoint.y}
                rx={zone3Radius.rx}
                ry={zone3Radius.ry}
                fill="url(#zone3Grad)"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.85"
              />
              <text
                x={basePoint.x}
                y={basePoint.y - zone3Radius.ry + 12}
                textAnchor="middle"
                fill="#93c5fd"
                fontSize="8.5"
                fontWeight="bold"
              >
                ZONE 3: &gt; {overnightMiles} MILES ({config.enableOvernightStay ? `+£${config.overnightFee} OVERNIGHT` : 'EXTENDED MILEAGE'})
              </text>

              {/* ZONE 2: Chargeable Mileage Zone Circle */}
              <ellipse
                cx={basePoint.x}
                cy={basePoint.y}
                rx={zone2Radius.rx}
                ry={zone2Radius.ry}
                fill="url(#zone2Grad)"
                stroke="#eab308"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <text
                x={basePoint.x}
                y={basePoint.y - zone2Radius.ry + 11}
                textAnchor="middle"
                fill="#fde047"
                fontSize="8"
                fontWeight="bold"
              >
                ZONE 2: STANDARD MILEAGE (£{config.costPerMileAboveFree.toFixed(2)}/mi)
              </text>

              {/* ZONE 1: 50-Mile Free Travel Zone Circle (Solid Emerald) */}
              <ellipse
                cx={basePoint.x}
                cy={basePoint.y}
                rx={zone1Radius.rx}
                ry={zone1Radius.ry}
                fill="url(#zone1Grad)"
                stroke="#10b981"
                strokeWidth="2.5"
                filter="url(#glowGold)"
              />
              <text
                x={basePoint.x}
                y={basePoint.y - zone1Radius.ry + 10}
                textAnchor="middle"
                fill="#34d399"
                fontSize="9"
                fontWeight="900"
                letterSpacing="0.8"
              >
                ★ ZONE 1: FREE 50 MILES ★
              </text>

              {/* City Hub Markers & Labels */}
              {NOTABLE_UK_LOCATIONS.map((city) => {
                const pt = projectToSvg(city.lat, city.lng);
                const cost = calculateTravelCosts(city.postcode, city.name, '', config);
                const isSelected = selectedLocation?.name === city.name;
                const isHovered = hoveredLocation?.name === city.name;

                let markerColor = '#10b981'; // Green (Free)
                if (cost.isOverseasOrMaxDistance) markerColor = '#f59e0b'; // Amber
                else if (cost.distanceMiles > freeMiles) markerColor = '#eab308'; // Yellow

                return (
                  <g
                    key={city.name}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedLocation(city);
                      if (onSelectTestCity) onSelectTestCity(city.postcode, city.name);
                    }}
                    onMouseEnter={() => setHoveredLocation(city)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    {/* Pulsing ring on hover/select */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="none"
                        stroke={markerColor}
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? '5' : '3.5'}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />

                    {/* City Label */}
                    <text
                      x={pt.x + 6}
                      y={pt.y + 3}
                      fill={isSelected ? '#d4af37' : '#e2e8f0'}
                      fontSize={isSelected ? '9.5' : '8'}
                      fontWeight={isSelected ? '900' : '600'}
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {/* Center Home Base Marker: Aviemore */}
              <g transform={`translate(${basePoint.x}, ${basePoint.y})`}>
                <circle r="14" fill="#d4af37" fillOpacity="0.25" className="animate-ping" />
                <circle r="7" fill="#d4af37" stroke="#ffffff" strokeWidth="2" />
                <circle r="3" fill="#0b1329" />
                
                {/* Banner Tag */}
                <rect
                  x="-42"
                  y="10"
                  width="84"
                  height="16"
                  rx="8"
                  fill="#0b1329"
                  stroke="#d4af37"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="21"
                  textAnchor="middle"
                  fill="#f3e5ab"
                  fontSize="8"
                  fontWeight="900"
                >
                  ★ AVIEMORE
                </text>
              </g>
            </svg>

            {/* Floating Live Tooltip */}
            {(hoveredLocation || selectedLocation) && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-tartan-gold/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between text-xs animate-fadeIn">
                {(() => {
                  const loc = hoveredLocation || selectedLocation!;
                  const cost = calculateTravelCosts(loc.postcode, loc.name, '', config);
                  return (
                    <div className="flex items-center justify-between w-full">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold">{loc.name}</strong>
                          <span className="text-[10px] text-gray-400">({loc.region})</span>
                          {loc.isIsland && (
                            <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded border border-purple-700">
                              Ferry Island
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-300">
                          Road Distance from Aviemore: <strong className="text-white">{cost.distanceMiles} miles</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          cost.isWithinFreeRadius
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                            : cost.isOverseasOrMaxDistance
                            ? 'bg-amber-900/80 text-amber-300 border border-amber-600'
                            : 'bg-yellow-900/80 text-yellow-300 border border-yellow-600'
                        }`}>
                          {cost.isWithinFreeRadius ? 'FREE TRAVEL' : cost.isOverseasOrMaxDistance ? 'BESPOKE ENQUIRY' : `£${cost.totalTravelExpense.toFixed(2)}`}
                        </span>
                        {cost.isOvernightTriggered && (
                          <div className="text-[9px] text-blue-300 mt-0.5 flex items-center justify-end gap-1">
                            <BedDouble className="w-3 h-3" />
                            <span>Inc. £{cost.overnightCost} Hotel</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Zone Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Zone 1 */}
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50"></span>
            <span>Zone 1: Free Radius</span>
          </div>
          <p className="text-[10px] text-gray-300">0 – {freeMiles} miles (100% Free)</p>
        </div>

        {/* Zone 2 */}
        <div className="bg-yellow-950/40 border border-yellow-800/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-yellow-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-400/50"></span>
            <span>Zone 2: Standard</span>
          </div>
          <p className="text-[10px] text-gray-300">{freeMiles}+ mi (@ £{config.costPerMileAboveFree.toFixed(2)}/mi)</p>
        </div>

        {/* Zone 3 - Always visible whether overnight is checked or not */}
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400/50"></span>
            <span>Zone 3: Extended</span>
          </div>
          <p className="text-[10px] text-gray-300">
            &gt; {overnightMiles} mi {config.enableOvernightStay ? `(+£${config.overnightFee} Stay)` : '(Mileage Only)'}
          </p>
        </div>

        {/* Zone 4 */}
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-400/50"></span>
            <span>Zone 4: Max / Overseas</span>
          </div>
          <p className="text-[10px] text-gray-300">&gt; {maxMiles} mi (Direct Enquiry)</p>
        </div>
      </div>
    </div>
  );
};
