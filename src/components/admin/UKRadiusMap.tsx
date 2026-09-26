'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Compass, 
  BedDouble, 
  Layers, 
  LocateFixed, 
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { calculateTravelCosts } from '@/lib/travelCalculator';
import { TravelExpensesConfig, CustomTravelZone } from '@/types/spud';

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

const KEY_SCOTTISH_AND_UK_HUBS: UKCityPoint[] = [
  // Zone 1: Free 50-Mile Radius Hubs
  { name: 'Inverness', postcode: 'IV1 1AA', region: 'Highland Capital', lat: 57.4778, lng: -4.2247 },
  { name: 'Elgin', postcode: 'IV30 1AB', region: 'Moray & Speyside', lat: 57.6499, lng: -3.3184 },
  { name: 'Pitlochry', postcode: 'PH16 5AA', region: 'Highland Perthshire', lat: 56.7044, lng: -3.7297 },
  { name: 'Grantown-on-Spey', postcode: 'PH26 3HG', region: 'Cairngorms', lat: 57.3300, lng: -3.6100 },
  { name: 'Loch Ness', postcode: 'IV63 6TX', region: 'Great Glen & Loch Ness', lat: 57.3340, lng: -4.4780 },
  
  // Zone 2: Standard Mileage Hubs (50 - 120 mi)
  { name: 'Fort William', postcode: 'PH33 6AA', region: 'Ben Nevis & Lochaber', lat: 56.8198, lng: -5.1052 },
  { name: 'Aberdeen', postcode: 'AB10 1AA', region: 'Granite City & Deeside', lat: 57.1497, lng: -2.0943 },
  { name: 'Dundee', postcode: 'DD1 1AA', region: 'City of Discovery', lat: 56.4620, lng: -2.9707 },
  { name: 'Perth', postcode: 'PH1 5AA', region: 'Fair City & Scone', lat: 56.3950, lng: -3.4308 },
  { name: 'Stirling', postcode: 'FK8 1EJ', region: 'Stirling Castle & Forth', lat: 56.1165, lng: -3.9369 },
  { name: 'Edinburgh', postcode: 'EH1 1AA', region: 'Scottish Capital & Lothians', lat: 55.9533, lng: -3.1883 },
  { name: 'Glasgow', postcode: 'G1 1AA', region: 'Greater Glasgow & Clyde', lat: 55.8642, lng: -4.2518 },
  { name: 'Portree (Isle of Skye)', postcode: 'IV51 9EJ', region: 'Inner Hebrides', lat: 57.4120, lng: -6.1960, isIsland: true },
  { name: 'Oban', postcode: 'PA34 4AB', region: 'Gateway to the Isles', lat: 56.4150, lng: -5.4710 },
  
  // Zone 3: Extended Distance Hubs (120 - 250 mi)
  { name: 'Gretna Green & Dumfries', postcode: 'DG16 5EA', region: 'Scottish Borders & Marriages', lat: 54.9967, lng: -3.0645 },
  { name: 'Stornoway (Isle of Lewis)', postcode: 'HS1 2AA', region: 'Outer Hebrides', lat: 58.2094, lng: -6.3849, isIsland: true },
  { name: 'Kirkwall (Orkney Islands)', postcode: 'KW15 1AA', region: 'Northern Isles', lat: 58.9814, lng: -2.9605, isIsland: true },
  { name: 'Newcastle upon Tyne', postcode: 'NE1 1AA', region: 'North East England', lat: 54.9783, lng: -1.6178 },
  { name: 'Carlisle', postcode: 'CA1 1AA', region: 'Cumbria / Border', lat: 54.8925, lng: -2.9329 },

  // Zone 4: Long Distance & Overseas (> 250 mi)
  { name: 'Manchester', postcode: 'M1 1AA', region: 'North West England', lat: 53.4808, lng: -2.2426 },
  { name: 'London', postcode: 'SW1A 1AA', region: 'Greater London', lat: 51.5074, lng: -0.1278 }
];

// 100% Free Public Tile Providers - ZERO API Keys Required
const MAP_TILE_PROVIDERS = {
  osm: {
    name: 'Real Streets & Towns',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  esriStreet: {
    name: 'Highland Highways & A-Roads',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, TomTom, Intermap'
  },
  satellite: {
    name: 'Satellite & Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
  },
  topo: {
    name: 'Highland Topo & Glens',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: USGS, Intermap, increment P Corp.'
  }
};

export const UKRadiusMap: React.FC<UKRadiusMapProps> = ({ config, onSelectTestCity }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const circlesLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [tileTheme, setTileTheme] = useState<keyof typeof MAP_TILE_PROVIDERS>('osm');
  const [activeLocation, setActiveLocation] = useState<{ 
    name: string; 
    distance: number; 
    cost: number; 
    isFree: boolean; 
    isOvernight: boolean; 
    isEnquiry: boolean; 
    region?: string 
  } | null>(null);

  const baseLat = config.baseLatitude || 57.1955;
  const baseLng = config.baseLongitude || -3.8350;
  const freeMiles = config.freeRadiusMiles || 50;
  const overnightMiles = config.overnightThresholdMiles || 120;
  const maxMiles = config.maxBookingRadiusMiles || 250;
  const customZones = config.customZones || [];
  const maxZoneNumber = 4 + customZones.length;

  // Function to redraw all circles and markers
  const renderOverlays = (L: any, map: any) => {
    if (!circlesLayerRef.current || !markersLayerRef.current) return;

    circlesLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    // 1. Max Safeguard Zone: e.g. Zone 4, Zone 5, Zone 6 (> maxMiles)
    L.circle([baseLat, baseLng], {
      radius: maxMiles * 1609.34, // meters
      color: '#f59e0b',
      dashArray: '8, 8',
      fillColor: '#f59e0b',
      fillOpacity: 0.08,
      weight: 2.5
    }).addTo(circlesLayerRef.current).bindTooltip(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <strong style="color: #b45309;">ZONE ${maxZoneNumber}: &gt; ${maxMiles} Miles (Max Safeguard)</strong><br/>
        <span>Destinations beyond this trigger Bespoke Long Distance / Overseas Enquiry</span>
      </div>
    `, { sticky: true });

    // 2. Custom Intermediate Zones (e.g. Zone 4, Zone 5)
    customZones.forEach((cz, idx) => {
      const czNum = 4 + idx;
      const zoneColor = cz.color || '#a855f7';
      L.circle([baseLat, baseLng], {
        radius: cz.maxMiles * 1609.34,
        color: zoneColor,
        fillColor: zoneColor,
        fillOpacity: 0.12,
        weight: 2.5
      }).addTo(circlesLayerRef.current).bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px;">
          <strong style="color: ${zoneColor};">ZONE ${czNum}: ${cz.name} (${cz.minMiles} – ${cz.maxMiles} mi)</strong><br/>
          <span>Rate: £${(cz.ratePerMile ?? config.costPerMileAboveFree).toFixed(2)}/mi ${cz.fixedSurcharge ? `+ £${cz.fixedSurcharge} Surcharge` : ''} ${cz.enableOvernight ? `+ £${cz.overnightFee ?? config.overnightFee} Overnight` : ''}</span>
        </div>
      `, { sticky: true });
    });

    // 3. Zone 3: Extended Highland & Long Distance Journeys (> 120 miles) - ALWAYS VISIBLE!
    L.circle([baseLat, baseLng], {
      radius: overnightMiles * 1609.34,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.14,
      weight: 2.5
    }).addTo(circlesLayerRef.current).bindTooltip(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <strong style="color: #1d4ed8;">ZONE 3: &gt; ${overnightMiles} Miles (Extended Distance)</strong><br/>
        <span>Standard Mileage Charged (£${config.costPerMileAboveFree.toFixed(2)}/mi) ${config.enableOvernightStay ? `+ £${config.overnightFee} Overnight Stay` : '(No Overnight Fee)'}</span>
      </div>
    `, { sticky: true });

    // 4. Zone 2: Standard Mileage Zone (50 - 120 miles)
    L.circle([baseLat, baseLng], {
      radius: Math.min(overnightMiles, maxMiles) * 1609.34,
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.12,
      weight: 2.5
    }).addTo(circlesLayerRef.current).bindTooltip(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <strong style="color: #ca8a04;">ZONE 2: 50 – ${overnightMiles} Miles (Standard Mileage)</strong><br/>
        <span>Charged at £${config.costPerMileAboveFree.toFixed(2)}/mile return</span>
      </div>
    `, { sticky: true });

    // 5. Zone 1: 50-Mile Free Travel Zone (Solid Emerald Green)
    L.circle([baseLat, baseLng], {
      radius: freeMiles * 1609.34,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.28,
      weight: 3.5
    }).addTo(circlesLayerRef.current).bindTooltip(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <strong style="color: #047857;">★ ZONE 1: FREE 50-MILE RADIUS</strong><br/>
        <span>Zero travel expense charged within this circle (Inverness, Speyside, Loch Ness, Cairngorms, Pitlochry)</span>
      </div>
    `, { sticky: true });

    // 6. Spud's Central Home Base Marker (Aviemore)
    const baseIcon = L.divIcon({
      className: 'spud-base-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa7c11 100%); color: #0b1329; border: 3px solid #ffffff; border-radius: 9999px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; box-shadow: 0 0 20px rgba(212,175,55,0.9), 0 4px 10px rgba(0,0,0,0.5);">
            🎺
          </div>
          <div style="background: #0b1329; color: #f3e5ab; border: 1.5px solid #d4af37; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.7); letter-spacing: 0.5px;">
            ★ BASE: ${config.publicBaseDisplay || 'Aviemore'} (${config.basePostcode})
          </div>
        </div>
      `,
      iconSize: [140, 60],
      iconAnchor: [70, 19]
    });

    const baseMarker = L.marker([baseLat, baseLng], { icon: baseIcon, zIndexOffset: 2000 }).addTo(markersLayerRef.current);
    baseMarker.bindPopup(`
      <div style="color: #0b1329; font-family: sans-serif; padding: 4px 6px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">🎺</span>
          <strong style="color: #854d0e; font-size: 14px;">${config.publicBaseDisplay || 'Aviemore, Highlands'}</strong>
        </div>
        <p style="font-size: 11px; margin: 0; color: #374151;">
          <strong>Postcode:</strong> ${config.basePostcode}<br/>
          <strong>Coordinates:</strong> ${baseLat.toFixed(4)}, ${baseLng.toFixed(4)}<br/>
          <span style="color: #059669; font-weight: bold;">★ 50-Mile Free Travel Radiates from here</span>
        </p>
      </div>
    `);

    // 7. City / Regional Hubs
    KEY_SCOTTISH_AND_UK_HUBS.forEach((hub) => {
      const cost = calculateTravelCosts(hub.postcode, hub.name, '', config);
      
      let markerColor = '#10b981'; // Green (Zone 1)
      if (cost.isOverseasOrMaxDistance) markerColor = '#f59e0b'; // Amber (Max Zone)
      else if (cost.distanceMiles >= overnightMiles) markerColor = '#3b82f6'; // Blue (Zone 3)
      else if (cost.distanceMiles > freeMiles) markerColor = '#eab308'; // Gold (Zone 2)

      const hubMarker = L.circleMarker([hub.lat, hub.lng], {
        radius: 6,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      }).addTo(markersLayerRef.current);

      hubMarker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; line-height: 1.35; padding: 2px;">
          <strong style="font-size: 12px; color: #0b1329;">${hub.name}</strong> <span style="color: #6b7280;">(${hub.region})</span><br/>
          <span>Distance from Base: <b>${cost.distanceMiles} miles</b></span><br/>
          <span>Travel Surcharge: <b style="color: ${cost.isWithinFreeRadius ? '#059669' : '#d97706'}; font-size: 12px;">${cost.isWithinFreeRadius ? 'FREE (£0.00)' : cost.isOverseasOrMaxDistance ? 'Bespoke Enquiry' : `£${cost.totalTravelExpense.toFixed(2)}`}</b></span>
          ${cost.isOvernightTriggered ? '<br/><span style="color: #2563eb; font-weight: bold;">Includes £' + cost.overnightCost + ' Overnight Stay</span>' : ''}
        </div>
      `, { sticky: true });

      hubMarker.on('click', () => {
        setActiveLocation({
          name: hub.name,
          region: hub.region,
          distance: cost.distanceMiles,
          cost: cost.totalTravelExpense,
          isFree: cost.isWithinFreeRadius,
          isOvernight: cost.isOvernightTriggered,
          isEnquiry: cost.isOverseasOrMaxDistance
        });

        if (onSelectTestCity) {
          onSelectTestCity(hub.postcode, hub.name);
        }
      });
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        leafletModuleRef.current = L;

        // Ensure Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize Leaflet Map
        const map = L.map(mapContainerRef.current, {
          center: [56.8, -4.2],
          zoom: 7,
          minZoom: 5,
          maxZoom: 18,
          zoomControl: false,
          scrollWheelZoom: true
        });

        // Set Public Free Tile Layer
        const currentTile = MAP_TILE_PROVIDERS[tileTheme];
        tileLayerRef.current = L.tileLayer(currentTile.url, {
          attribution: currentTile.attribution,
          subdomains: 'abc',
          maxZoom: 19
        }).addTo(map);

        // Create overlay and marker layer groups
        circlesLayerRef.current = L.layerGroup().addTo(map);
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Render initial circles and markers
        renderOverlays(L, map);

        // Interactive click anywhere on map
        map.on('click', (e: any) => {
          const clickLat = e.latlng.lat;
          const clickLng = e.latlng.lng;

          // Haversine distance
          const dLat = (clickLat - baseLat) * (Math.PI / 180);
          const dLng = (clickLng - baseLng) * (Math.PI / 180);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(baseLat * (Math.PI / 180)) * Math.cos(clickLat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const straight = c * 3958.8;
          const approxRoad = Math.round(straight * 1.25);

          const isFree = approxRoad <= freeMiles;
          const isEnquiry = approxRoad > maxMiles;
          const isOvernight = approxRoad >= overnightMiles && config.enableOvernightStay;
          
          let estCost = 0;
          if (!isFree && !isEnquiry) {
            const matchingCz = customZones.find(z => approxRoad >= z.minMiles && approxRoad <= z.maxMiles);
            const rate = matchingCz?.ratePerMile ?? config.costPerMileAboveFree;
            const surcharge = matchingCz?.fixedSurcharge ?? 0;
            const chargeMiles = (approxRoad - freeMiles) * (config.chargeType === 'return' ? 2 : 1);
            estCost = Math.round(chargeMiles * rate) + surcharge + (isOvernight ? config.overnightFee : 0);
          }

          setActiveLocation({
            name: `Custom Map Pin (${clickLat.toFixed(3)}, ${clickLng.toFixed(3)})`,
            distance: approxRoad,
            cost: estCost,
            isFree,
            isOvernight,
            isEnquiry,
            region: 'Interactive Map Click'
          });
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Style Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletModuleRef.current) return;
    const L = leafletModuleRef.current;
    const currentTile = MAP_TILE_PROVIDERS[tileTheme];

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(currentTile.url, {
      attribution: currentTile.attribution,
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    if (circlesLayerRef.current) {
      circlesLayerRef.current.bringToFront?.();
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.bringToFront?.();
    }
  }, [tileTheme]);

  // Update Dynamic Geodesic Radius Circles when coordinates or settings change
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletModuleRef.current) return;
    renderOverlays(leafletModuleRef.current, mapInstanceRef.current);
  }, [
    baseLat, 
    baseLng, 
    freeMiles, 
    overnightMiles, 
    maxMiles, 
    config.costPerMileAboveFree, 
    config.enableOvernightStay, 
    config.overnightFee, 
    config.chargeType,
    config.publicBaseDisplay,
    config.basePostcode,
    JSON.stringify(customZones)
  ]);

  // Camera presets
  const handleZoomPreset = (type: 'scotland' | 'uk' | 'base') => {
    if (!mapInstanceRef.current) return;
    if (type === 'base') {
      mapInstanceRef.current.setView([baseLat, baseLng], 9, { animate: true });
    } else if (type === 'scotland') {
      mapInstanceRef.current.setView([56.8, -4.2], 7, { animate: true });
    } else if (type === 'uk') {
      mapInstanceRef.current.setView([54.5, -3.5], 6, { animate: true });
    }
  };

  return (
    <div className="bg-tartan-card rounded-3xl p-5 sm:p-6 border border-tartan-border/80 shadow-2xl space-y-4">
      
      {/* Top Controls & Map Style Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tartan-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-tartan-gold/10 border border-tartan-gold/30 flex items-center justify-center text-tartan-gold shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Actual UK & Highland Map</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Live Dynamic Scale
              </span>
            </h3>
            <p className="text-[11px] text-gray-300">
              Live geographic map centered on Spud&apos;s base ({config.publicBaseDisplay || 'Aviemore'})
            </p>
          </div>
        </div>

        {/* Public Tile Layers Buttons - Zero API keys */}
        <div className="flex items-center gap-1.5 bg-tartan-dark p-1 rounded-xl border border-tartan-border">
          {(Object.keys(MAP_TILE_PROVIDERS) as Array<keyof typeof MAP_TILE_PROVIDERS>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTileTheme(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                tileTheme === key
                  ? 'bg-tartan-navy text-tartan-gold shadow-sm border border-tartan-gold/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {MAP_TILE_PROVIDERS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Real Leaflet Map Container */}
      <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl border border-tartan-border overflow-hidden shadow-2xl bg-slate-950">
        
        {/* Leaflet Map DOM Target */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Quick Preset Controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleZoomPreset('base')}
            className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 text-emerald-300 hover:text-emerald-200 border border-emerald-600/70 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
            title="Zoom directly into Aviemore 50-mile Free Travel Zone"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aviemore 50mi</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoomPreset('scotland')}
            className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 text-tartan-gold hover:text-yellow-200 border border-tartan-border rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
            title="Fit Scotland & Highlands into view"
          >
            <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland View</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoomPreset('uk')}
            className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 text-gray-200 hover:text-white border border-tartan-border rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
            title="Fit Entire UK into view"
          >
            <span>🇬🇧 Entire UK</span>
          </button>
        </div>

        {/* Map Help / Click Hint */}
        <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 border border-tartan-border/80 text-gray-300 text-[11px] px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
          <span>Click any city or point on the map to test mileage</span>
        </div>

        {/* Floating Active Selection Card */}
        {activeLocation && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-950/95 border border-tartan-gold/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <strong className="text-white text-sm font-extrabold">{activeLocation.name}</strong>
                {activeLocation.region && (
                  <span className="text-[10px] text-gray-400">({activeLocation.region})</span>
                )}
              </div>
              <div className="text-gray-300 text-[11px]">
                Road Distance from Base: <strong className="text-white">{activeLocation.distance} miles</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  activeLocation.isFree
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : activeLocation.isEnquiry
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-yellow-950 text-yellow-300 border border-yellow-600'
                }`}>
                  {activeLocation.isFree ? '★ FREE TRAVEL' : activeLocation.isEnquiry ? 'BESPOKE ENQUIRY' : `£${activeLocation.cost.toFixed(2)} Travel Fee`}
                </span>
                {activeLocation.isOvernight && (
                  <div className="text-[10px] text-blue-300 mt-0.5 flex items-center justify-end gap-1">
                    <BedDouble className="w-3 h-3" />
                    <span>Inc. £{config.overnightFee} Hotel Allowance</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveLocation(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Geodesic Zone Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Zone 1 */}
        <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></span>
            <span>Zone 1: Free Radius</span>
          </div>
          <p className="text-[10px] text-gray-300">0 – {freeMiles} mi (Free Travel)</p>
        </div>

        {/* Zone 2 */}
        <div className="bg-yellow-950/50 border border-yellow-700/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-yellow-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-400"></span>
            <span>Zone 2: Standard</span>
          </div>
          <p className="text-[10px] text-gray-300">{freeMiles}+ mi (@ £{config.costPerMileAboveFree.toFixed(2)}/mi)</p>
        </div>

        {/* Zone 3 */}
        <div className="bg-blue-950/50 border border-blue-700/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400"></span>
            <span>Zone 3: Extended</span>
          </div>
          <p className="text-[10px] text-gray-300">
            &gt; {overnightMiles} mi {config.enableOvernightStay ? `(+£${config.overnightFee} Stay)` : '(Mileage Only)'}
          </p>
        </div>

        {/* Dynamic Custom Zones in Legend */}
        {customZones.map((cz, idx) => {
          const czNum = 4 + idx;
          const color = cz.color || '#a855f7';
          return (
            <div key={cz.id} className="bg-purple-950/50 border border-purple-700/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-purple-300 truncate">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                <span className="truncate">Zone {czNum}: {cz.name}</span>
              </div>
              <p className="text-[10px] text-gray-300 truncate">{cz.minMiles} – {cz.maxMiles} mi (@ £{(cz.ratePerMile ?? config.costPerMileAboveFree).toFixed(2)}/mi)</p>
            </div>
          );
        })}

        {/* Max Safeguard Zone */}
        <div className="bg-amber-950/50 border border-amber-700/60 rounded-xl p-2.5 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-400"></span>
            <span>Zone {maxZoneNumber}: Max Safeguard</span>
          </div>
          <p className="text-[10px] text-gray-300">&gt; {maxMiles} mi (Enquiry Mode)</p>
        </div>
      </div>

    </div>
  );
};
