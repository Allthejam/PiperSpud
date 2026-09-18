"use client";

import React, { useEffect, useRef } from 'react';
import { useRouteContext } from '@/context/RouteContext';
import { RouteStop, HazardObservation, StopType } from '@/types/route';
import { getRiskLevel } from '@/lib/calculations';
import GisToolbar from './GisToolbar';
import MobileGisSheet from './MobileGisSheet';
import HazardDetailModal from './HazardDetailModal';
import AddStopModal from './AddStopModal';
import AddHazardModal from './AddHazardModal';

// Dynamically import leaflet to prevent SSR issues
let L: typeof import('leaflet') | null = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

export default function LeafletMap() {
  const {
    currentRoute,
    gisToolMode,
    tileLayer,
    setPendingCoords,
    setPendingStopType,
    setIsAddStopModalOpen,
    setIsAddHazardModalOpen,
    setSelectedHazardForModal,
    addPathPoint,
    isGpsTracking,
    setIsGpsTracking,
    userGpsPosition,
    setUserGpsPosition,
    showToast,
  } = useRouteContext();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const gpsMarkerRef = useRef<L.CircleMarker | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !L) return;

    // Default center (Manchester / UK)
    const initialCenter: [number, number] = currentRoute?.pathCoordinates[0] || [53.4808, -2.2426];
    
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control top-right for mobile ergonomics
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileUrl =
      tileLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© Stagecoach GIS / OpenStreetMap',
    }).addTo(map);

    currentTileLayerRef.current = tiles;

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }
    const tileUrl =
      tileLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© Stagecoach GIS / OpenStreetMap',
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = tiles;
  }, [tileLayer]);

  // Handle Map Click based on Active GIS Tool
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const coord: [number, number] = [lat, lng];

      if (gisToolMode === 'draw_path') {
        addPathPoint(coord);
        showToast(`Added path node (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      } else if (
        gisToolMode === 'drop_bus_stop' ||
        gisToolMode === 'drop_popup_stop' ||
        gisToolMode === 'drop_junction' ||
        gisToolMode === 'drop_roadworks' ||
        gisToolMode === 'drop_other'
      ) {
        setPendingCoords(coord);
        let type: StopType = 'bus_stop';
        if (gisToolMode === 'drop_popup_stop') type = 'popup_stop';
        if (gisToolMode === 'drop_junction') type = 'junction';
        if (gisToolMode === 'drop_roadworks') type = 'roadworks';
        if (gisToolMode === 'drop_other') type = 'other';
        setPendingStopType(type);
        setIsAddStopModalOpen(true);
      } else if (gisToolMode === 'drop_hazard') {
        setPendingCoords(coord);
        setIsAddHazardModalOpen(true);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [gisToolMode, addPathPoint, setPendingCoords, setPendingStopType, setIsAddStopModalOpen, setIsAddHazardModalOpen, showToast]);

  // Render Path & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !L || !currentRoute) return;
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous markers
    markersGroup.clearLayers();

    // 1. Draw Polyline Route Path
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    if (currentRoute.pathCoordinates && currentRoute.pathCoordinates.length > 0) {
      const polyline = L.polyline(currentRoute.pathCoordinates, {
        color: '#002D62', // Stagecoach corporate blue
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map);

      polylineLayerRef.current = polyline;
    }

    // 2. Render Stops
    currentRoute.stops.forEach((stop) => {
      let iconEmoji = '🚏';
      let bgColor = 'bg-blue-600';
      if (stop.stopType === 'popup_stop') {
        iconEmoji = '🚧';
        bgColor = 'bg-amber-600';
      } else if (stop.stopType === 'junction') {
        iconEmoji = '🚦';
        bgColor = 'bg-purple-600';
      } else if (stop.stopType === 'roadworks') {
        iconEmoji = '🏗️';
        bgColor = 'bg-orange-600';
      } else if (stop.stopType === 'other') {
        iconEmoji = '📍';
        bgColor = 'bg-slate-700';
      }

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-white shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
            <span class="text-xs">${iconEmoji}</span>
            <span class="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
              ${stop.dwellMinutes}m
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(markersGroup);
      
      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 180px; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${stop.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            Type: <strong>${stop.stopType.replace('_', ' ').toUpperCase()}</strong>
          </div>
          <div style="font-size: 11px; color: #475569;">
            Dwell Time: <strong>${stop.dwellMinutes} min</strong>
          </div>
          ${stop.notes ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px; font-style: italic;">${stop.notes}</div>` : ''}
        </div>
      `);
    });

    // 3. Render Hazards
    currentRoute.hazards.forEach((hazard) => {
      const risk = getRiskLevel(hazard.residualScore);
      const isHighRisk = hazard.residualScore >= 15;

      const hazardIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full ${isHighRisk ? 'bg-red-600 animate-bounce' : 'bg-amber-600'} text-white shadow-2xl border-2 border-white cursor-pointer hover:scale-125 transition-transform">
            <span class="text-sm">⚠️</span>
            <span class="absolute -bottom-1.5 -right-1.5 bg-black text-white text-[9px] font-extrabold px-1 rounded-full border border-white">
              ${hazard.residualScore}
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon: hazardIcon }).addTo(markersGroup);

      // Popup with in-place modal trigger button
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'inherit';
      popupDiv.style.minWidth = '210px';
      popupDiv.style.padding = '4px';

      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b91c1c;">⚠️ ${hazard.category}</span>
          <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 9999px;">
            Score: ${hazard.residualScore}
          </span>
        </div>
        <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3;">${hazard.title}</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">📍 ${hazard.locationName}</div>
        <div style="font-size: 11px; color: #15803d; margin-top: 4px; font-weight: 600;">
          🛡️ ${hazard.controlMeasures.length > 55 ? hazard.controlMeasures.substring(0, 55) + '...' : hazard.controlMeasures}
        </div>
        <button id="view-hazard-btn-${hazard.id}" style="margin-top: 8px; width: 100%; background: #002D62; color: white; border: none; border-radius: 8px; padding: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
          View Full Assessment Details
        </button>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-hazard-btn-${hazard.id}`);
        if (btn) {
          btn.onclick = (ev) => {
            ev.stopPropagation();
            setSelectedHazardForModal(hazard);
          };
        }
      });
    });

  }, [currentRoute, setSelectedHazardForModal]);

  // Handle GPS Tracking
  const handleToggleGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    if (isGpsTracking) {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (gpsMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(gpsMarkerRef.current);
        gpsMarkerRef.current = null;
      }
      setIsGpsTracking(false);
      setUserGpsPosition(null);
      showToast('GPS Survey Tracking stopped');
    } else {
      setIsGpsTracking(true);
      showToast('Acquiring high-accuracy GPS fix...');

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const posCoord: [number, number] = [latitude, longitude];
          setUserGpsPosition(posCoord);

          if (mapInstanceRef.current && L) {
            if (!gpsMarkerRef.current) {
              gpsMarkerRef.current = L.circleMarker(posCoord, {
                radius: 8,
                color: '#ffffff',
                weight: 3,
                fillColor: '#0284c7',
                fillOpacity: 0.9,
              }).addTo(mapInstanceRef.current);
            } else {
              gpsMarkerRef.current.setLatLng(posCoord);
            }
          }
        },
        (err) => {
          console.error(err);
          showToast(`GPS Error: ${err.message}`);
          setIsGpsTracking(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );
      gpsWatchIdRef.current = watchId;
    }
  };

  // Center & Fit Route
  const handleCenterMap = () => {
    if (!mapInstanceRef.current || !currentRoute) return;
    if (currentRoute.pathCoordinates.length > 0 && polylineLayerRef.current) {
      mapInstanceRef.current.fitBounds(polylineLayerRef.current.getBounds(), {
        padding: [50, 50],
      });
      showToast('Map centered to route geometry');
    } else if (currentRoute.stops.length > 0) {
      const latlngs = currentRoute.stops.map((s) => [s.lat, s.lng] as [number, number]);
      mapInstanceRef.current.fitBounds(latlngs, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] sm:h-[calc(100vh-115px)] bg-slate-100 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Desktop Left GIS Toolbar */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <GisToolbar onCenterMap={handleCenterMap} onToggleGps={handleToggleGps} />
      </div>

      {/* Mobile GIS Action Drawer */}
      <MobileGisSheet onCenterMap={handleCenterMap} onToggleGps={handleToggleGps} />

      {/* Active Tool Mode Badge Overlay */}
      <div className="hidden sm:flex absolute bottom-4 left-4 z-20 bg-stagecoach-navy/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-lg items-center space-x-2 text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-stagecoach-amber animate-pulse"></span>
        <span className="uppercase tracking-wider text-slate-400">Tool:</span>
        <span className="text-stagecoach-amber font-bold">{gisToolMode.replace('_', ' ').toUpperCase()}</span>
      </div>

      {/* Modals */}
      <HazardDetailModal />
      <AddStopModal />
      <AddHazardModal />
    </div>
  );
}
