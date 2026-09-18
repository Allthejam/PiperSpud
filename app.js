/**
 * Stagecoach Route Risk Assessment (RRA) & Mapping System
 * Multi-route management, Leaflet GIS tracking, 5x5 Matrix, Dwell timing, Digital Sign-off
 */

// --- Database & Storage (IndexedDB + LocalStorage fallback) ---
const DB_NAME = 'Stagecoach_RRA_DB';
const DB_VERSION = 1;
const STORE_NAME = 'routes';

let db = null;
let currentRouteId = 'route-133';
let currentRoute = null;
let map = null;
let routePolyline = null;
let stopMarkers = [];
let hazardMarkers = [];
let gpsWatchId = null;
let currentGpsCoords = null;
let mapMode = 'browse'; // 'browse' | 'draw_route' | 'add_stop' | 'add_hazard'

// Sample initial default routes for Stagecoach
const defaultRoutes = [
  {
    id: 'route-133',
    serviceNumber: '133',
    routeName: 'Grantown-on-Spey – Advie – Cromdale Circular',
    depot: 'Aviemore / Inverness',
    opCo: 'Stagecoach Highlands',
    documentRef: 'RRA-133-AVIEMORE-2026',
    revision: 'Rev 2.0 (April 2026 Survey)',
    surveyDate: '2026-04-13',
    reviewDate: '2027-04-13',
    assessorName: 'C. Bell (Senior Route Assessor)',
    approverName: 'M. MacMillan (Operations Manager)',
    assessorSignature: null,
    approverSignature: null,
    signOffDate: '2026-04-14',
    overallStatus: 'RESTRICTED',
    defaultDwellTimeSeconds: 60,
    vehicleRestrictions: {
      doubleDeckHigh: { status: 'PROHIBITED', note: 'Castle Grant Railway Arch haunch clearance <4.10m. Severe bridge strike hazard.' },
      doubleDeckLow: { status: 'PROHIBITED', note: 'Single-track cambers and overhanging pine tree strikes on Cottartown B9102.' },
      singleDeck12m: { status: 'RESTRICTED', note: 'Swept path collision on Speybridge roundabout & narrow B9102 passing places.' },
      midiBus: { status: 'PERMITTED', note: 'ADL Enviro200 (8.9m - 9.7m) compliant with primary lane positioning.' },
      optareSolo: { status: 'PERMITTED', note: 'Recommended for all rural circular diagrams with high verge clearance.' },
      electricEV: { status: 'RESTRICTED', note: 'Check roof battery pod clearance under Castle Grant archway.' }
    },
    waypoints: [
      [57.3295, -3.6062],
      [57.3380, -3.5950],
      [57.3520, -3.5650],
      [57.3700, -3.5200],
      [57.3910, -3.4650],
      [57.4100, -3.4200],
      [57.3850, -3.4400],
      [57.3550, -3.5100],
      [57.3350, -3.5700],
      [57.3295, -3.6062]
    ],
    stops: [
      { id: 's1', sequence: 1, type: 'BUS_STOP', durationStatus: 'Permanent', name: 'Craig Maclean Sports Centre', lat: 57.3295, lng: -3.6062, dwellSeconds: 60, speedLimitMph: 20, notes: 'Depot start terminal & passenger boarding' },
      { id: 's2', sequence: 2, type: 'BUS_STOP', durationStatus: 'Permanent', name: 'Grantown High Street (The Square)', lat: 57.3325, lng: -3.6015, dwellSeconds: 90, speedLimitMph: 20, notes: 'Town center main stop, high boarding numbers' },
      { id: 's3', sequence: 3, type: 'JUNCTION', durationStatus: 'Permanent', name: 'Speybridge Critical Roundabout', lat: 57.3410, lng: -3.5890, dwellSeconds: 30, speedLimitMph: 30, notes: 'Tight turning swept radius, yield hold point' },
      { id: 's4', sequence: 4, type: 'ROADWORKS', durationStatus: 'Long-Term Roadworks (2-3 Years)', name: 'Dulicht Bridge Culvert Works', lat: 57.3560, lng: -3.5550, dwellSeconds: 90, speedLimitMph: 20, notes: 'Major bridge reinforcement contraflow & 3-way lights active 2026-2028' },
      { id: 's5', sequence: 5, type: 'TEMP_STOP', durationStatus: 'Temporary Pop-up (Days/Weeks)', name: 'Cromdale Pop-up Shelter (Diversion)', lat: 57.3710, lng: -3.5150, dwellSeconds: 60, speedLimitMph: 30, notes: 'Pop-up temporary stop replacing closed church stop due to pipe repairs' },
      { id: 's6', sequence: 6, type: 'BUS_STOP', durationStatus: 'Permanent', name: 'Advie Village Hall Turn', lat: 57.4100, lng: -3.4200, dwellSeconds: 120, speedLimitMph: 30, notes: 'Rural turnaround loop' },
      { id: 's7', sequence: 7, type: 'OTHER', durationStatus: 'Permanent', name: 'Speyside Way Relief Checkpoint', lat: 57.3850, lng: -3.4400, dwellSeconds: 45, speedLimitMph: 45, notes: 'Driver intermediate timing point' },
      { id: 's8', sequence: 8, type: 'BUS_STOP', durationStatus: 'Permanent', name: 'Craig Maclean Sports Centre (Finish)', lat: 57.3295, lng: -3.6062, dwellSeconds: 60, speedLimitMph: 20, notes: 'Terminal finish stand' }
    ],
    hazards: [
      {
        id: 'h1',
        title: 'Castle Grant Railway Arch (Low Bridge & Haunch)',
        category: 'Low Bridge / Overpass',
        lat: 57.3485,
        lng: -3.5750,
        photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 5,
        initialLikelihood: 4,
        initialRisk: 20,
        riskRating: 'Extreme',
        description: 'Low arched stone railway bridge signed at 16\'0" (4.87m) central clearance. The kerbside arch haunch reduces clearance below 4.10m.',
        controlMeasures: '1. Strict vehicle restriction: ALL Double Deck vehicles prohibited.\n2. Solo & Midi single decks permitted with center-lane arch navigation.\n3. Driver hazard alert card in cab.\n4. Warning beacon alert configured on Ticket Machine (ETM).',
        residualSeverity: 2,
        residualLikelihood: 2,
        residualRisk: 4,
        residualRating: 'Low',
        councilEscalation: 'Highland Council sign survey Ref #HC-2026-088.'
      },
      {
        id: 'h2',
        title: 'B9102 Cottartown Pine & Birch Tree Strike Zone',
        category: 'Tree Canopy & Foliage',
        lat: 57.3620,
        lng: -3.5400,
        photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 4,
        initialLikelihood: 4,
        initialRisk: 16,
        riskRating: 'High',
        description: 'Overhanging pine and birch branches protruding into near-side sweep between Cottartown and Cromdale. Severe mirror and upper saloon window strike hazard.',
        controlMeasures: '1. Fitted reinforced nearside mirror deflector guard brackets on dedicated fleet.\n2. Speed reduction to 25mph on blind wooded sections.\n3. Section 154 Highways Act tree-cutting notice served to Forestry Estate.',
        residualSeverity: 2,
        residualLikelihood: 2,
        residualRisk: 4,
        residualRating: 'Low',
        councilEscalation: 'Forestry Scotland clearance job #FS-4410.'
      },
      {
        id: 'h3',
        title: 'Advie Single Track Soft Verges & Deep Culverts',
        category: 'Narrow Road / Soft Verge',
        lat: 57.3980,
        lng: -3.4500,
        photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 4,
        initialLikelihood: 3,
        initialRisk: 12,
        riskRating: 'High',
        description: 'Single-track unclassified road with unstable, unreinforced soft peat verges bordering 1.2m deep drainage ditches. High rollover / ditch drop hazard.',
        controlMeasures: '1. Strict anti-verge drop policy: Drivers instructed NEVER to yield onto unpaved verges.\n2. Mandatory use of designated tarmac intervisible passing places.\n3. Maximum speed capped at 20 mph.',
        residualSeverity: 2,
        residualLikelihood: 2,
        residualRisk: 4,
        residualRating: 'Low',
        councilEscalation: 'Council requested passing place tarmac extension #HC-PP-12.'
      },
      {
        id: 'h4',
        title: 'Grantown High Street Primary School & Pinch Point',
        category: 'School Zone / Pedestrian Surge',
        lat: 57.3330,
        lng: -3.5990,
        photoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 4,
        initialLikelihood: 3,
        initialRisk: 12,
        riskRating: 'High',
        description: 'Heavy pedestrian congestion, school children crossing between parked delivery vans during 08:15–09:00 and 15:00–15:45 peak hours.',
        controlMeasures: '1. 15 mph defensive driving speed ceiling during bell times.\n2. Mandatory horn warning tap if visibility masked by delivery lorries.\n3. Door interlocking protocol verified at stop.',
        residualSeverity: 2,
        residualLikelihood: 1,
        residualRisk: 2,
        residualRating: 'Low',
        councilEscalation: '20mph mandatory school flashers active.'
      }
    ]
  },
  {
    id: 'route-11',
    serviceNumber: '11',
    routeName: 'Inverness Bus Station – Inverness Airport – Nairn',
    depot: 'Inverness Depot (Seafield)',
    opCo: 'Stagecoach Highlands',
    documentRef: 'RRA-011-INV-2026',
    revision: 'Rev 1.4 (March 2026 Survey)',
    surveyDate: '2026-03-20',
    reviewDate: '2027-03-20',
    assessorName: 'D. Fraser (Route Risk Lead)',
    approverName: 'M. MacMillan (Operations Manager)',
    assessorSignature: null,
    approverSignature: null,
    signOffDate: '2026-03-22',
    overallStatus: 'PASS',
    defaultDwellTimeSeconds: 60,
    vehicleRestrictions: {
      doubleDeckHigh: { status: 'PERMITTED', note: 'Standard clearances on A96 corridor; watch canopy along Millburn Rd.' },
      doubleDeckLow: { status: 'PERMITTED', note: 'Full clearance on all scheduled airport terminal diagrams.' },
      singleDeck12m: { status: 'PERMITTED', note: 'Approved for Volvo B8RLE / ADL Enviro200 MMC 11.8m.' },
      midiBus: { status: 'PERMITTED', note: 'Approved for all relief diagrams.' },
      optareSolo: { status: 'PERMITTED', note: 'Approved.' },
      electricEV: { status: 'PERMITTED', note: 'Yutong E10 / E12 Electric Fleet approved for airport charging bays.' }
    },
    waypoints: [
      [57.4815, -4.2255],
      [57.4850, -4.2000],
      [57.4930, -4.1300],
      [57.5350, -4.0500],
      [57.5850, -3.8750]
    ],
    stops: [
      { id: 's11-1', sequence: 1, name: 'Inverness Bus Station (Stance 4)', lat: 57.4815, lng: -4.2255, dwellSeconds: 180, speedLimitMph: 15 },
      { id: 's11-2', sequence: 2, name: 'Millburn Academy', lat: 57.4850, lng: -4.2000, dwellSeconds: 60, speedLimitMph: 30 },
      { id: 's11-3', sequence: 3, name: 'Inverness Retail Park', lat: 57.4930, lng: -4.1300, dwellSeconds: 90, speedLimitMph: 30 },
      { id: 's11-4', sequence: 4, name: 'Inverness Airport Terminal', lat: 57.5350, lng: -4.0500, dwellSeconds: 180, speedLimitMph: 20 },
      { id: 's11-5', sequence: 5, name: 'Nairn Bus Station', lat: 57.5850, lng: -3.8750, dwellSeconds: 120, speedLimitMph: 30 }
    ],
    hazards: [
      {
        id: 'h11-1',
        title: 'Airport Terminal Turning Loop & Pedestrian Island',
        category: 'Tight Junction / Swept Path',
        lat: 57.5340,
        lng: -4.0520,
        photoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 3,
        initialLikelihood: 3,
        initialRisk: 9,
        riskRating: 'Medium',
        description: 'Tight radius loop with luggage trolleys and passengers walking across transit lanes from car parks.',
        controlMeasures: '1. Max speed 10mph in terminal loop.\n2. Hazard 4-way flashers when reversing or maneuvering at stand.',
        residualSeverity: 2,
        residualLikelihood: 1,
        residualRisk: 2,
        residualRating: 'Low',
        councilEscalation: 'Airport Authority signage review.'
      }
    ]
  },
  {
    id: 'route-55',
    serviceNumber: '55',
    routeName: 'Aviemore – Coylumbridge – Cairngorm Mountain Base',
    depot: 'Aviemore Outstation',
    opCo: 'Stagecoach Highlands',
    documentRef: 'RRA-055-CAIRN-2026',
    revision: 'Rev 2.1 (January 2026 Winter Survey)',
    surveyDate: '2026-01-15',
    reviewDate: '2027-01-15',
    assessorName: 'C. Bell (Route Assessor)',
    approverName: 'M. MacMillan (Operations Manager)',
    assessorSignature: null,
    approverSignature: null,
    signOffDate: '2026-01-16',
    overallStatus: 'RESTRICTED',
    defaultDwellTimeSeconds: 60,
    vehicleRestrictions: {
      doubleDeckHigh: { status: 'PROHIBITED', note: 'Severe crosswinds and gradient ice risk on upper ski road.' },
      doubleDeckLow: { status: 'PROHIBITED', note: 'High center-of-gravity risk on mountain descent.' },
      singleDeck12m: { status: 'RESTRICTED', note: 'Fitted winter tyres required. Chain protocols in force during snow alerts.' },
      midiBus: { status: 'PERMITTED', note: 'Standard mountain diagram vehicle with retarder.' },
      optareSolo: { status: 'PERMITTED', note: 'Approved for winter shuttle services.' },
      electricEV: { status: 'RESTRICTED', note: 'Monitor battery thermal draw in sub-zero ambient temperatures.' }
    },
    waypoints: [
      [57.1880, -3.8290],
      [57.1750, -3.7850],
      [57.1550, -3.7200],
      [57.1340, -3.6740]
    ],
    stops: [
      { id: 's55-1', sequence: 1, name: 'Aviemore Rail Station', lat: 57.1880, lng: -3.8290, dwellSeconds: 120, speedLimitMph: 20 },
      { id: 's55-2', sequence: 2, name: 'Coylumbridge Hotel', lat: 57.1750, lng: -3.7850, dwellSeconds: 60, speedLimitMph: 40 },
      { id: 's55-3', sequence: 3, name: 'Loch Morlich Beach', lat: 57.1550, lng: -3.7200, dwellSeconds: 90, speedLimitMph: 40 },
      { id: 's55-4', sequence: 4, name: 'Cairngorm Mountain Ski Centre', lat: 57.1340, lng: -3.6740, dwellSeconds: 180, speedLimitMph: 30 }
    ],
    hazards: [
      {
        id: 'h55-1',
        title: 'Cairngorm Ski Road 1:6 Gradient & Black Ice Crest',
        category: 'Blind Summit / Steep Gradient',
        lat: 57.1420,
        lng: -3.6900,
        photoUrl: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&auto=format&fit=crop&q=80',
        initialSeverity: 5,
        initialLikelihood: 4,
        initialRisk: 20,
        riskRating: 'Extreme',
        description: 'Steep winding ascent with frequent winter black ice, drift snow, and heavy tourist traffic.',
        controlMeasures: '1. Daily winter road inspection with Mountain Ranger station.\n2. Mandatory retarder check before descent.\n3. Speed restricted to 20 mph under adverse weather.',
        residualSeverity: 3,
        residualLikelihood: 2,
        residualRisk: 6,
        residualRating: 'Medium',
        councilEscalation: 'Council grit priority #1.'
      }
    ]
  }
];

// Open IndexedDB
function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('serviceNumber', 'serviceNumber', { unique: false });
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      seedInitialRoutesIfEmpty().then(resolve);
    };
    request.onerror = (e) => {
      console.error('IndexedDB error:', e);
      resolve(); // Fallback to memory/localStorage
    };
  });
}

async function seedInitialRoutesIfEmpty() {
  const routes = await getAllRoutesFromDB();
  if (routes.length === 0) {
    for (const route of defaultRoutes) {
      await saveRouteToDB(route);
    }
  }
}

function getAllRoutesFromDB() {
  return new Promise((resolve) => {
    if (!db) {
      const stored = localStorage.getItem('stagecoach_rra_routes');
      return resolve(stored ? JSON.parse(stored) : defaultRoutes);
    }
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(defaultRoutes);
  });
}

function getRouteFromDB(routeId) {
  return new Promise((resolve) => {
    if (!db) {
      const stored = localStorage.getItem('stagecoach_rra_routes');
      const list = stored ? JSON.parse(stored) : defaultRoutes;
      return resolve(list.find(r => r.id === routeId) || list[0]);
    }
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(routeId);
    req.onsuccess = () => resolve(req.result || defaultRoutes[0]);
    req.onerror = () => resolve(defaultRoutes[0]);
  });
}

function saveRouteToDB(route) {
  return new Promise((resolve) => {
    if (!db) {
      const stored = localStorage.getItem('stagecoach_rra_routes');
      let list = stored ? JSON.parse(stored) : [...defaultRoutes];
      const idx = list.findIndex(r => r.id === route.id);
      if (idx >= 0) list[idx] = route;
      else list.push(route);
      localStorage.setItem('stagecoach_rra_routes', JSON.stringify(list));
      return resolve(route);
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(route);
    tx.oncomplete = () => resolve(route);
    tx.onerror = () => resolve(route);
  });
}

function deleteRouteFromDB(routeId) {
  return new Promise((resolve) => {
    if (!db) {
      const stored = localStorage.getItem('stagecoach_rra_routes');
      let list = stored ? JSON.parse(stored) : defaultRoutes;
      list = list.filter(r => r.id !== routeId);
      localStorage.setItem('stagecoach_rra_routes', JSON.stringify(list));
      return resolve();
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(routeId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// --- Geographic & Runtime Calculations ---

// Haversine distance in miles
function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate runtime between two stops allowing for road speed & dwell
function computeRouteMetrics(route) {
  let totalDistanceMiles = 0;
  let totalDrivingTimeSeconds = 0;
  let totalDwellTimeSeconds = 0;

  const stops = (route.stops || []).sort((a, b) => a.sequence - b.sequence);

  for (let i = 0; i < stops.length; i++) {
    totalDwellTimeSeconds += (stops[i].dwellSeconds || route.defaultDwellTimeSeconds || 60);

    if (i > 0) {
      const dist = calculateDistanceMiles(stops[i - 1].lat, stops[i - 1].lng, stops[i].lat, stops[i].lng);
      totalDistanceMiles += dist;
      // Use road speed limit or default 25mph bus operating speed
      const speed = stops[i - 1].speedLimitMph || 25;
      const hours = dist / speed;
      totalDrivingTimeSeconds += hours * 3600;
    }
  }

  // If waypoints are present and more detailed than stops, calculate path distance
  if (route.waypoints && route.waypoints.length > 1 && totalDistanceMiles === 0) {
    for (let i = 1; i < route.waypoints.length; i++) {
      totalDistanceMiles += calculateDistanceMiles(
        route.waypoints[i - 1][0], route.waypoints[i - 1][1],
        route.waypoints[i][0], route.waypoints[i][1]
      );
    }
    totalDrivingTimeSeconds = (totalDistanceMiles / 25) * 3600;
  }

  const totalCycleSeconds = totalDrivingTimeSeconds + totalDwellTimeSeconds;

  return {
    totalDistanceMiles: totalDistanceMiles.toFixed(1),
    totalDistanceKm: (totalDistanceMiles * 1.60934).toFixed(1),
    drivingTimeFormatted: formatSecondsToTime(totalDrivingTimeSeconds),
    dwellTimeFormatted: formatSecondsToTime(totalDwellTimeSeconds),
    totalCycleFormatted: formatSecondsToTime(totalCycleSeconds),
    stopCount: stops.length,
    hazardCount: (route.hazards || []).length
  };
}

function formatSecondsToTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

// Risk classification helper
function getRiskClassification(score) {
  if (score >= 17) return { label: 'Extreme', badgeClass: 'bg-red-600 text-white', borderClass: 'border-red-500' };
  if (score >= 10) return { label: 'High', badgeClass: 'bg-amber-500 text-white', borderClass: 'border-amber-500' };
  if (score >= 5) return { label: 'Medium', badgeClass: 'bg-yellow-400 text-slate-900', borderClass: 'border-yellow-400' };
  return { label: 'Low', badgeClass: 'bg-emerald-600 text-white', borderClass: 'border-emerald-500' };
}

// Marker Classification Config (Bus Stop, Temp Stop, Junction, Roadworks, Other)
function getMarkerTypeConfig(type) {
  switch (type) {
    case 'TEMP_STOP':
      return { label: 'Temporary Pop-up Stop', shortLabel: 'Temp Stop', bgCol: '#EB680B', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300', iconEmoji: '🚧' };
    case 'JUNCTION':
      return { label: 'Critical Junction / Turn', shortLabel: 'Junction', bgCol: '#7C3AED', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300', iconEmoji: '🚦' };
    case 'ROADWORKS':
      return { label: 'Major Roadworks (2-3 Yrs)', shortLabel: 'Roadworks', bgCol: '#DC2626', badgeClass: 'bg-red-100 text-red-800 border-red-300', iconEmoji: '🏗️' };
    case 'OTHER':
      return { label: 'Other Waypoint', shortLabel: 'Waypoint', bgCol: '#475569', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300', iconEmoji: '📍' };
    case 'BUS_STOP':
    default:
      return { label: 'Bus Stop (Permanent)', shortLabel: 'Bus Stop', bgCol: '#00539B', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', iconEmoji: '🚏' };
  }
}

// --- Leaflet Map Controller & Tile Layers ---
let osmLayer = null;
let satelliteLayer = null;

function initMap() {
  if (map) return;
  
  // 1. Street Roads Layer (OSM)
  osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors | Stagecoach Operations GIS'
  });

  // 2. High-Resolution Satellite Layer (Esri World Imagery)
  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Initialize Map
  map = L.map('mapContainer', {
    zoomControl: true,
    scrollWheelZoom: true,
    layers: [osmLayer]
  }).setView([57.34, -3.55], 11);

  currentBaseTileLayer = osmLayer;
  isSatelliteLayer = false;

  // Add Native Leaflet Layer Toggle Switcher (Top-Right)
  const baseMaps = {
    "🗺️ Standard Road Map": osmLayer,
    "🛰️ Satellite Aerial View": satelliteLayer
  };
  L.control.layers(baseMaps, null, { position: 'topright', collapsed: false }).addTo(map);

  // Add Custom On-Map Quick Action Bar (Top-Left under zoom)
  const QuickToolControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function() {
      const div = L.DomUtil.create('div', 'leaflet-bar bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-md border border-slate-300 flex flex-col space-y-1.5 text-xs font-semibold select-none');
      div.innerHTML = `
        <button onclick="setMapMode('draw_route')" class="p-1.5 hover:bg-slate-100 rounded text-slate-800 flex items-center space-x-1" title="Draw Route Path">
          <span>✏️</span><span class="hidden sm:inline">Draw Path</span>
        </button>
        <button onclick="undoLastWaypoint()" class="p-1.5 hover:bg-slate-100 rounded text-slate-800 flex items-center space-x-1" title="Undo Last Point">
          <span>↩</span><span class="hidden sm:inline">Undo</span>
        </button>
        <button onclick="reverseRouteDirection()" class="p-1.5 hover:bg-slate-100 rounded text-slate-800 flex items-center space-x-1" title="Reverse Route Direction">
          <span>🔄</span><span class="hidden sm:inline">Reverse</span>
        </button>
        <button onclick="fitRouteBounds()" class="p-1.5 hover:bg-slate-100 rounded text-slate-800 flex items-center space-x-1" title="Fit Route Bounds">
          <span>🎯</span><span class="hidden sm:inline">Fit Route</span>
        </button>
        <button onclick="toggleMapLayer()" class="p-1.5 hover:bg-blue-50 text-blue-800 rounded flex items-center space-x-1" title="Toggle Satellite / Road View">
          <span>🛰️</span><span class="hidden sm:inline">Toggle View</span>
        </button>
      `;
      L.DomEvent.disableClickPropagation(div);
      return div;
    }
  });
  map.addControl(new QuickToolControl());

  map.on('click', onMapClick);
}

let waypointMarkers = [];

function renderMapForCurrentRoute() {
  if (!map || !currentRoute) return;

  // Clear existing layers
  if (routePolyline) map.removeLayer(routePolyline);
  waypointMarkers.forEach(m => map.removeLayer(m));
  stopMarkers.forEach(m => map.removeLayer(m));
  hazardMarkers.forEach(m => map.removeLayer(m));
  waypointMarkers = [];
  stopMarkers = [];
  hazardMarkers = [];

  const latLngs = [];

  // Plot route polyline and interactive waypoint dots
  if (currentRoute.waypoints && currentRoute.waypoints.length > 0) {
    currentRoute.waypoints.forEach((pt, idx) => {
      latLngs.push(pt);

      // Render interactive circular dot along polyline
      const wpMarker = L.circleMarker(pt, {
        radius: 5,
        fillColor: '#00539B',
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.9
      }).addTo(map);

      wpMarker.bindTooltip(`Point #${idx + 1}`, { direction: 'top', offset: [0, -6] });
      wpMarker.bindPopup(`
        <div class="p-2 text-xs space-y-1.5">
          <strong class="text-stagecoach-navy block font-bold">Path Waypoint #${idx + 1}</strong>
          <p class="font-mono text-[10px] text-slate-500">${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}</p>
          <button onclick="deleteWaypoint(${idx})" class="w-full bg-red-50 hover:bg-red-100 text-red-700 text-[11px] py-1 px-2 rounded font-medium border border-red-200 transition">
            🗑️ Delete Point
          </button>
        </div>
      `);
      waypointMarkers.push(wpMarker);
    });

    routePolyline = L.polyline(latLngs, {
      color: '#002855', // Stagecoach navy
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(map);
  }

  // Plot Bus Stops & Categorized Waypoints
  (currentRoute.stops || []).forEach(stop => {
    const config = getMarkerTypeConfig(stop.type);
    const iconHtml = `
      <div class="flex items-center justify-center w-7 h-7 text-white font-bold text-xs rounded-full border-2 border-white shadow-md" style="background-color: ${config.bgCol};">
        ${stop.sequence}
      </div>
    `;
    const customIcon = L.divIcon({
      className: 'custom-stop-icon',
      html: iconHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div class="p-3 max-w-xs space-y-2">
        <div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
          <span class="font-bold text-xs text-stagecoach-navy">#${stop.sequence}: ${escapeHtml(stop.name)}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}">${config.shortLabel}</span>
        </div>
        
        <div class="text-[11px] text-slate-600 space-y-1">
          <p><strong>Classification:</strong> ${config.label}</p>
          <p><strong>Duration / Status:</strong> <span class="font-medium text-slate-800">${escapeHtml(stop.durationStatus || 'Permanent')}</span></p>
          <p><strong>Scheduled Dwell / Delay:</strong> <span class="font-bold text-stagecoach-blue">${stop.dwellSeconds}s</span></p>
          ${stop.notes ? `<p class="bg-amber-50 p-1 rounded border border-amber-200 text-amber-900 text-[10px]"><strong>Note:</strong> ${escapeHtml(stop.notes)}</p>` : ''}
          <p class="font-mono text-[10px] text-slate-400">${stop.lat.toFixed(5)}, ${stop.lng.toFixed(5)}</p>
        </div>

        <!-- Quick Type Selector Dropdown -->
        <div class="pt-1.5 border-t border-slate-100 space-y-1">
          <label class="text-[10px] font-bold uppercase text-slate-500 block">Change Marker Type:</label>
          <select onchange="changeStopType('${stop.id}', this.value)" class="w-full text-xs p-1 border border-slate-300 rounded bg-white font-medium outline-none">
            <option value="BUS_STOP" ${stop.type === 'BUS_STOP' || !stop.type ? 'selected' : ''}>🚏 Bus Stop (Permanent)</option>
            <option value="TEMP_STOP" ${stop.type === 'TEMP_STOP' ? 'selected' : ''}>🚧 Temporary Pop-up Stop</option>
            <option value="JUNCTION" ${stop.type === 'JUNCTION' ? 'selected' : ''}>🚦 Critical Junction / Turn</option>
            <option value="ROADWORKS" ${stop.type === 'ROADWORKS' ? 'selected' : ''}>🏗️ Major Roadworks (2-3 Yrs)</option>
            <option value="OTHER" ${stop.type === 'OTHER' ? 'selected' : ''}>📍 Other Waypoint</option>
          </select>
        </div>

        <!-- Action Buttons: Edit & Remove -->
        <div class="flex items-center space-x-1.5 pt-1">
          <button onclick="editStop('${stop.id}')" class="flex-1 bg-stagecoach-navy hover:bg-slate-800 text-white text-xs py-1 rounded font-medium transition text-center">
            Edit Details
          </button>
          <button onclick="deleteStop('${stop.id}')" class="bg-red-50 hover:bg-red-100 text-red-700 text-xs py-1 px-2 rounded font-medium transition border border-red-200 flex items-center space-x-0.5" title="Remove this marker">
            <span>🗑️ Remove</span>
          </button>
        </div>
      </div>
    `);
    stopMarkers.push(marker);
  });

  // Plot Geotagged Hazards
  (currentRoute.hazards || []).forEach((hazard) => {
    if (!hazard.lat || !hazard.lng) return;

    const risk = getRiskClassification(hazard.initialRisk || (hazard.initialSeverity * hazard.initialLikelihood));
    const iconColor = hazard.initialRisk >= 17 ? '#dc2626' : (hazard.initialRisk >= 10 ? '#eb680b' : '#f59e0b');

    const iconHtml = `
      <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold text-xs" style="background-color: ${iconColor};">
        ⚠
      </div>
    `;
    const customIcon = L.divIcon({
      className: 'custom-hazard-icon',
      html: iconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([hazard.lat, hazard.lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div class="p-3 max-w-xs space-y-2">
        <div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
          <span class="font-bold text-xs text-slate-900">${escapeHtml(hazard.title)}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${risk.badgeClass}">${hazard.riskRating || risk.label} (${hazard.initialRisk || hazard.initialSeverity * hazard.initialLikelihood})</span>
        </div>
        ${hazard.photoUrl ? `<img src="${hazard.photoUrl}" class="w-full h-24 object-cover rounded-md border border-slate-200 cursor-pointer" onclick="openHazardDetailModal('${hazard.id}')" alt="Hazard Photo" />` : ''}
        <p class="text-xs text-slate-600 line-clamp-2">${escapeHtml(hazard.description)}</p>
        <button onclick="openHazardDetailModal('${hazard.id}')" class="w-full text-center bg-stagecoach-navy hover:bg-slate-800 text-white text-xs py-1.5 rounded-lg font-semibold transition shadow-sm flex items-center justify-center space-x-1">
          <span>🔍 View Assessment Details</span>
        </button>
      </div>
    `);
    hazardMarkers.push(marker);
  });

  // Fit bounds if coordinates exist
  if (latLngs.length > 0) {
    map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
  } else if (currentRoute.stops && currentRoute.stops.length > 0) {
    const stopPts = currentRoute.stops.map(s => [s.lat, s.lng]);
    map.fitBounds(L.latLngBounds(stopPts), { padding: [40, 40] });
  }
}

let currentBaseTileLayer = null;
let isSatelliteLayer = false;

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
  }, 2500);
}

function setMapMode(mode) {
  mapMode = mode;

  // Update Left Sidebar tool buttons
  document.querySelectorAll('.gis-tool-btn').forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active', 'bg-stagecoach-blue', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
    } else {
      btn.classList.remove('active', 'bg-stagecoach-blue', 'text-white');
      btn.classList.add('bg-white', 'text-slate-700');
    }
  });

  const badgeEl = document.getElementById('activeModeBadge');
  const textEl = document.getElementById('mapInstructionText');
  const mapEl = document.getElementById('mapContainer');

  if (mapEl) {
    if (mode === 'draw_route' || mode.startsWith('add_')) {
      mapEl.classList.add('map-drawing-mode');
    } else {
      mapEl.classList.remove('map-drawing-mode');
    }
  }

  switch (mode) {
    case 'draw_route':
      if (badgeEl) {
        badgeEl.textContent = 'Draw Path';
        badgeEl.className = 'text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="pen-tool" class="w-3.5 h-3.5 text-stagecoach-orange"></i><span><strong>Draw Route Mode Active:</strong> Click anywhere on roads/map to append path points. Each click adds a connected waypoint.</span>`;
      }
      showToast('✏️ Draw Route Mode: Click on map to add waypoints');
      break;
    case 'add_stop':
      if (badgeEl) {
        badgeEl.textContent = 'Drop Bus Stop';
        badgeEl.className = 'text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="map-pin" class="w-3.5 h-3.5 text-stagecoach-blue"></i><span><strong>Drop Bus Stop Mode:</strong> Click anywhere on the map to place a permanent passenger stop.</span>`;
      }
      showToast('🚏 Drop Bus Stop: Click anywhere on map');
      break;
    case 'add_temp_stop':
      if (badgeEl) {
        badgeEl.textContent = 'Drop Pop-up Stop';
        badgeEl.className = 'text-[10px] bg-orange-100 text-orange-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-orange-600"></i><span><strong>Drop Temporary Stop:</strong> Click on map to place a short-term diversion/roadworks stop.</span>`;
      }
      showToast('🚧 Drop Temporary Stop: Click anywhere on map');
      break;
    case 'add_junction':
      if (badgeEl) {
        badgeEl.textContent = 'Drop Junction';
        badgeEl.className = 'text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="git-merge" class="w-3.5 h-3.5 text-purple-600"></i><span><strong>Drop Junction / Turn:</strong> Click to pin a critical turning swept-path check.</span>`;
      }
      showToast('🚦 Drop Junction: Click anywhere on map');
      break;
    case 'add_roadworks':
      if (badgeEl) {
        badgeEl.textContent = 'Drop Roadworks';
        badgeEl.className = 'text-[10px] bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="hammer" class="w-3.5 h-3.5 text-red-600"></i><span><strong>Drop Major Roadworks:</strong> Click to pin 2-3 year contraflow/construction zones.</span>`;
      }
      showToast('🏗️ Drop Roadworks: Click anywhere on map');
      break;
    case 'add_hazard':
      if (badgeEl) {
        badgeEl.textContent = 'Pin Hazard';
        badgeEl.className = 'text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="alert-octagon" class="w-3.5 h-3.5 text-amber-600"></i><span><strong>Pin Hazard Mode:</strong> Click on map to record a risk hazard with camera photo & 5×5 scoring.</span>`;
      }
      showToast('⚠ Pin Hazard: Click map to record route risk');
      break;
    case 'browse':
    default:
      if (badgeEl) {
        badgeEl.textContent = 'Browse';
        badgeEl.className = 'text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded';
      }
      if (textEl) {
        textEl.innerHTML = `<i data-lucide="mouse-pointer" class="w-3.5 h-3.5 text-slate-600"></i><span><strong>Browse Mode:</strong> Pan/zoom map and click stops or hazard markers to inspect.</span>`;
      }
      break;
  }
  if (window.lucide) lucide.createIcons();
}

function onMapClick(e) {
  const { lat, lng } = e.latlng;

  if (mapMode === 'draw_route') {
    if (!currentRoute.waypoints) currentRoute.waypoints = [];
    currentRoute.waypoints.push([lat, lng]);
    saveCurrentRoute();
    renderMapForCurrentRoute();
    renderRouteMetrics();
    showToast(`Added Point #${currentRoute.waypoints.length} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  } else if (mapMode === 'add_stop') {
    openAddStopModal(lat, lng, 'BUS_STOP');
  } else if (mapMode === 'add_temp_stop') {
    openAddStopModal(lat, lng, 'TEMP_STOP');
  } else if (mapMode === 'add_junction') {
    openAddStopModal(lat, lng, 'JUNCTION');
  } else if (mapMode === 'add_roadworks') {
    openAddStopModal(lat, lng, 'ROADWORKS');
  } else if (mapMode === 'add_hazard') {
    openAddHazardModal(lat, lng);
  }
}

function deleteWaypoint(index) {
  if (!currentRoute || !currentRoute.waypoints) return;
  currentRoute.waypoints.splice(index, 1);
  saveCurrentRoute();
  renderMapForCurrentRoute();
  renderRouteMetrics();
  showToast(`Waypoint #${index + 1} removed`);
}

// GIS Geometry Operations: Undo, Reverse, Clear, Start Over
function undoLastWaypoint() {
  if (!currentRoute || !currentRoute.waypoints || currentRoute.waypoints.length === 0) {
    showToast('⚠️ No waypoints to undo');
    return;
  }
  currentRoute.waypoints.pop();
  saveCurrentRoute();
  renderMapForCurrentRoute();
  renderRouteMetrics();
  showToast('↩ Undid last waypoint');
}

function reverseRouteDirection() {
  if (!currentRoute) return;
  if (currentRoute.waypoints && currentRoute.waypoints.length > 1) {
    currentRoute.waypoints.reverse();
  }
  if (currentRoute.stops && currentRoute.stops.length > 1) {
    currentRoute.stops.reverse();
    currentRoute.stops.forEach((s, idx) => s.sequence = idx + 1);
  }
  saveCurrentRoute();
  renderAll();
  showToast(`🔄 Reversed route direction for Service ${currentRoute.serviceNumber}`);
}

// --- Corporate Modal Confirmation System ---
let pendingConfirmCallback = null;

function showConfirmDialog({
  title = 'Confirm Route Action',
  badge = 'Warning',
  badgeClass = 'bg-amber-100 text-amber-900 border-amber-300',
  message = 'Are you sure you want to proceed?',
  subtext = '',
  icon = 'alert-triangle',
  iconColor = 'text-amber-600',
  iconBg = 'bg-amber-100',
  confirmBtnText = 'Proceed',
  confirmBtnClass = 'bg-red-600 hover:bg-red-700 text-white',
  cancelBtnText = 'Cancel',
  onConfirm = null
}) {
  pendingConfirmCallback = onConfirm;

  const titleEl = document.getElementById('confirmTitle');
  if (titleEl) titleEl.textContent = title;
  
  const badgeEl = document.getElementById('confirmBadge');
  if (badgeEl) {
    badgeEl.textContent = badge;
    badgeEl.className = `text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${badgeClass}`;
  }

  const msgEl = document.getElementById('confirmMessage');
  if (msgEl) msgEl.textContent = message;

  const subBox = document.getElementById('confirmSubtextContainer');
  const subTextEl = document.getElementById('confirmSubtext');
  if (subBox && subTextEl) {
    if (subtext) {
      subTextEl.textContent = subtext;
      subBox.classList.remove('hidden');
    } else {
      subBox.classList.add('hidden');
    }
  }

  const iconContainer = document.getElementById('confirmIconContainer');
  if (iconContainer) {
    iconContainer.className = `w-12 h-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`;
    iconContainer.innerHTML = `<i id="confirmIcon" data-lucide="${icon}" class="w-6 h-6 ${iconColor}"></i>`;
  }

  const actionBtn = document.getElementById('confirmActionBtn');
  if (actionBtn) {
    actionBtn.className = `px-4 py-2 rounded-lg ${confirmBtnClass} font-bold text-xs shadow-md transition flex items-center space-x-1.5`;
    actionBtn.innerHTML = `<span>${confirmBtnText}</span>`;
    actionBtn.onclick = () => {
      closeConfirmDialog();
      if (typeof pendingConfirmCallback === 'function') {
        pendingConfirmCallback();
        pendingConfirmCallback = null;
      }
    };
  }

  const cancelBtn = document.getElementById('confirmCancelBtn');
  if (cancelBtn) cancelBtn.textContent = cancelBtnText;

  const modalEl = document.getElementById('confirmModal');
  if (modalEl) modalEl.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeConfirmDialog() {
  const modalEl = document.getElementById('confirmModal');
  if (modalEl) modalEl.classList.add('hidden');
  pendingConfirmCallback = null;
}

function clearRoutePolyline() {
  if (!currentRoute || !currentRoute.waypoints || currentRoute.waypoints.length === 0) {
    showToast('⚠️ Route path is already empty');
    return;
  }
  showConfirmDialog({
    title: 'Clear Route Path Geometry?',
    badge: 'Polyline Only',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: 'eraser',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    message: `Clear the drawn polyline path for Service ${currentRoute.serviceNumber}?`,
    subtext: 'This will remove the drawn route lines and waypoint dots from the map. All bus stops, durations, classifications, and hazard assessments will remain intact.',
    confirmBtnText: 'Yes, Clear Path',
    confirmBtnClass: 'bg-stagecoach-orange hover:bg-orange-600 text-white',
    cancelBtnText: 'Keep Path',
    onConfirm: () => {
      currentRoute.waypoints = [];
      saveCurrentRoute();
      renderMapForCurrentRoute();
      renderRouteMetrics();
      showToast('🧹 Route path polyline cleared');
    }
  });
}

function startOverRoute() {
  showConfirmDialog({
    title: 'Start Over Route Assessment?',
    badge: 'Irreversible Reset',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    icon: 'alert-octagon',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    message: `Are you sure you want to completely reset the route mapping for Service ${currentRoute.serviceNumber}?`,
    subtext: 'This will remove all drawn GPS waypoints and all recorded bus stops, temporary stops, and junction markers for this survey.',
    confirmBtnText: 'Yes, Start Over',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    cancelBtnText: 'Cancel',
    onConfirm: () => {
      currentRoute.waypoints = [];
      currentRoute.stops = [];
      saveCurrentRoute();
      renderAll();
      showToast('🔄 Route path & stops reset to initial state');
    }
  });
}

function toggleMapLayer() {
  if (!map) return;
  const layerText = document.getElementById('layerNameText');

  if (!isSatelliteLayer) {
    if (osmLayer && map.hasLayer(osmLayer)) map.removeLayer(osmLayer);
    if (satelliteLayer && !map.hasLayer(satelliteLayer)) map.addLayer(satelliteLayer);
    isSatelliteLayer = true;
    if (layerText) layerText.textContent = 'Standard Road Map';
    showToast('🛰️ Switched to Satellite Aerial View');
  } else {
    if (satelliteLayer && map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
    if (osmLayer && !map.hasLayer(osmLayer)) map.addLayer(osmLayer);
    isSatelliteLayer = false;
    if (layerText) layerText.textContent = 'Satellite Imagery';
    showToast('🗺️ Switched to Standard Road Map');
  }
}

function fitRouteBounds() {
  if (!map || !currentRoute) return;
  const pts = [];
  if (currentRoute.waypoints && currentRoute.waypoints.length > 0) {
    currentRoute.waypoints.forEach(p => pts.push(p));
  }
  if (currentRoute.stops && currentRoute.stops.length > 0) {
    currentRoute.stops.forEach(s => pts.push([s.lat, s.lng]));
  }
  if (pts.length > 0) {
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    showToast('🎯 Map centered to route extents');
  } else {
    showToast('⚠️ No route points or stops to center');
  }
}

function scrollToHazardCard(hazardId) {
  switchTab('hazards');
  setTimeout(() => {
    const el = document.getElementById(`hazard-card-${hazardId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-stagecoach-orange');
      setTimeout(() => el.classList.remove('ring-4', 'ring-stagecoach-orange'), 2500);
    }
  }, 100);
}

// --- Live GPS Tracking & Breadcrumbs ---
function toggleGpsTracking() {
  const btn = document.getElementById('gpsTrackBtn');
  const statusEl = document.getElementById('gpsStatusIndicator');

  if (gpsWatchId !== null) {
    // Stop tracking
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    btn.innerHTML = `<i data-lucide="navigation" class="w-4 h-4"></i><span>Start GPS Tracker</span>`;
    btn.classList.remove('bg-red-600', 'hover:bg-red-700', 'gps-tracking-active');
    btn.classList.add('bg-stagecoach-orange', 'hover:bg-orange-600');
    statusEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>GPS Idle`;
    lucide.createIcons();
    return;
  }

  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  btn.innerHTML = `<i data-lucide="square" class="w-4 h-4"></i><span>Stop GPS Tracker</span>`;
  btn.classList.remove('bg-stagecoach-orange', 'hover:bg-orange-600');
  btn.classList.add('bg-red-600', 'hover:bg-red-700', 'gps-tracking-active');
  statusEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>Recording Live Breadcrumbs...`;
  lucide.createIcons();

  gpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, speed } = position.coords;
      currentGpsCoords = { lat: latitude, lng: longitude };
      
      // Update quick drop buttons
      document.getElementById('quickDropHazardBtn').disabled = false;
      document.getElementById('quickDropStopBtn').disabled = false;

      // Append waypoint to current route
      if (!currentRoute.waypoints) currentRoute.waypoints = [];
      currentRoute.waypoints.push([latitude, longitude]);
      
      map.setView([latitude, longitude], 15);
      renderMapForCurrentRoute();
      renderRouteMetrics();
      saveCurrentRoute();
    },
    (error) => {
      console.warn('GPS tracking error:', error);
      alert('Unable to retrieve GPS coordinates: ' + error.message);
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
}

// --- Route Switcher & Management ---
async function loadRoutesList() {
  const routes = await getAllRoutesFromDB();
  const select = document.getElementById('routeSelector');
  select.innerHTML = '';
  
  routes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `Service ${r.serviceNumber}: ${r.routeName}`;
    if (r.id === currentRouteId) opt.selected = true;
    select.appendChild(opt);
  });

  document.getElementById('totalRoutesCountBadge').textContent = routes.length;
}

async function switchRoute(routeId) {
  currentRouteId = routeId;
  currentRoute = await getRouteFromDB(routeId);
  renderAll();
}

async function saveCurrentRoute() {
  if (!currentRoute) return;
  await saveRouteToDB(currentRoute);
  renderRouteProfileBanner();
  renderRouteMetrics();
}

function openNewRouteModal() {
  document.getElementById('newRouteModal').classList.remove('hidden');
}

function closeNewRouteModal() {
  document.getElementById('newRouteModal').classList.add('hidden');
}

async function createNewRoute(event) {
  event.preventDefault();
  const serviceNum = document.getElementById('newServiceNumber').value.trim();
  const routeName = document.getElementById('newRouteName').value.trim();
  const depot = document.getElementById('newDepot').value.trim();
  const opCo = document.getElementById('newOpCo').value.trim();
  const assessor = document.getElementById('newAssessor').value.trim();
  const approver = document.getElementById('newApprover').value.trim();

  const newId = 'route-' + Date.now();
  const newRoute = {
    id: newId,
    serviceNumber: serviceNum || '000',
    routeName: routeName || 'New Bus Route Assessment',
    depot: depot || 'Stagecoach Depot',
    opCo: opCo || 'Stagecoach Highlands',
    documentRef: `RRA-${serviceNum || '000'}-${Date.now().toString().slice(-4)}`,
    revision: 'Rev 1.0 (Initial Survey)',
    surveyDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
    assessorName: assessor || 'Route Surveyor',
    approverName: approver || 'Operations Manager',
    assessorSignature: null,
    approverSignature: null,
    signOffDate: '',
    overallStatus: 'DRAFT',
    defaultDwellTimeSeconds: 60,
    vehicleRestrictions: {
      doubleDeckHigh: { status: 'PENDING', note: 'Bridge & tree survey required.' },
      doubleDeckLow: { status: 'PENDING', note: 'Survey required.' },
      singleDeck12m: { status: 'PENDING', note: 'Survey required.' },
      midiBus: { status: 'PERMITTED', note: 'Default compliant.' },
      optareSolo: { status: 'PERMITTED', note: 'Default compliant.' },
      electricEV: { status: 'PENDING', note: 'Survey required.' }
    },
    waypoints: [],
    stops: [],
    hazards: []
  };

  await saveRouteToDB(newRoute);
  closeNewRouteModal();
  await loadRoutesList();
  await switchRoute(newId);
}

async function duplicateCurrentRoute() {
  if (!currentRoute) return;
  const clone = JSON.parse(JSON.stringify(currentRoute));
  clone.id = 'route-' + Date.now();
  clone.serviceNumber = clone.serviceNumber + '-COPY';
  clone.routeName = clone.routeName + ' (Duplicate)';
  clone.documentRef = clone.documentRef + '-COPY';
  clone.assessorSignature = null;
  clone.approverSignature = null;
  clone.signOffDate = '';
  
  await saveRouteToDB(clone);
  await loadRoutesList();
  await switchRoute(clone.id);
  alert(`Duplicated route as Service ${clone.serviceNumber}`);
}

async function deleteCurrentRoute() {
  const routes = await getAllRoutesFromDB();
  if (routes.length <= 1) {
    showToast('⚠️ You cannot delete the only remaining route');
    return;
  }
  showConfirmDialog({
    title: 'Delete Route Assessment?',
    badge: 'Permanent Deletion',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    icon: 'trash-2',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    message: `Permanently delete Service ${currentRoute.serviceNumber}: ${currentRoute.routeName}?`,
    subtext: 'This will remove the entire route assessment, timetable dwells, vehicle restrictions, and hazard records from your local storage.',
    confirmBtnText: 'Yes, Delete Route',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    cancelBtnText: 'Cancel',
    onConfirm: async () => {
      await deleteRouteFromDB(currentRoute.id);
      const remaining = await getAllRoutesFromDB();
      await loadRoutesList();
      await switchRoute(remaining[0].id);
      showToast(`🗑️ Deleted Service ${currentRoute.serviceNumber}`);
    }
  });
}

function exportRoutesAsJson() {
  getAllRoutesFromDB().then(routes => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(routes, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Stagecoach_RRA_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  });
}

function importRoutesFromJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (Array.isArray(parsed)) {
        for (const r of parsed) {
          await saveRouteToDB(r);
        }
        showToast(`Successfully imported ${parsed.length} routes.`);
        await loadRoutesList();
        await switchRoute(parsed[0].id);
      } else if (parsed.id) {
        await saveRouteToDB(parsed);
        showToast(`Successfully imported Service ${parsed.serviceNumber}.`);
        await loadRoutesList();
        await switchRoute(parsed.id);
      }
    } catch (err) {
      alert('Failed to parse JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToMockData() {
  showConfirmDialog({
    title: 'Reset All Data to Factory Mock Data?',
    badge: 'Factory Restore',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    icon: 'rotate-ccw',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    message: 'Restore all routes and risk assessments to default Stagecoach sample data?',
    subtext: 'This will reset IndexedDB and restore sample Services 133, 11, and 55. Any custom routes or survey edits created in this session will be replaced.',
    confirmBtnText: 'Yes, Reset All Data',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    cancelBtnText: 'Cancel & Keep Data',
    onConfirm: async () => {
      try {
        if (db) {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.clear();
          await new Promise((resolve) => {
            tx.oncomplete = resolve;
            tx.onerror = resolve;
          });
        }
      } catch (err) {
        console.warn('IndexedDB clear error:', err);
      }

      localStorage.removeItem('stagecoach_rra_routes');

      for (const r of defaultRoutes) {
        await saveRouteToDB(JSON.parse(JSON.stringify(r)));
      }

      currentRouteId = 'route-133';
      await loadRoutesList();
      currentRoute = await getRouteFromDB(currentRouteId);
      renderAll();
      showToast('🔄 All routes and assessments reset to Stagecoach mock data');
    }
  });
}

// --- Render Views ---
function renderAll() {
  renderRouteProfileBanner();
  renderRouteMetrics();
  renderMapForCurrentRoute();
  renderStopsTable();
  renderHazardCards();
  render5x5Matrix();
  renderFleetCompatibility();
  renderDriverCabFlashcard();
  renderGovernanceSignOff();
  lucide.createIcons();
}

function renderRouteProfileBanner() {
  if (!currentRoute) return;
  document.getElementById('bannerServiceTitle').textContent = `Service ${currentRoute.serviceNumber}: ${currentRoute.routeName}`;
  document.getElementById('bannerRevisionBadge').textContent = currentRoute.revision || 'Rev 1.0';
  document.getElementById('bannerDepot').textContent = currentRoute.depot;
  document.getElementById('bannerSurveyors').textContent = `${currentRoute.assessorName} (Assessor) | ${currentRoute.approverName} (Approver)`;
  document.getElementById('bannerDocRef').textContent = currentRoute.documentRef;

  // Header quick badges
  const dDeckRestricted = currentRoute.vehicleRestrictions?.doubleDeckHigh?.status === 'PROHIBITED';
  const statusEl = document.getElementById('bannerStatusBadges');
  statusEl.innerHTML = `
    <div class="${dDeckRestricted ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border rounded-lg px-3 py-1.5 flex items-center space-x-2 font-medium">
      <span class="w-2.5 h-2.5 rounded-full ${dDeckRestricted ? 'bg-red-600 animate-pulse' : 'bg-emerald-600'}"></span>
      <span>Double Deck: <strong>${dDeckRestricted ? 'PROHIBITED' : 'PERMITTED'}</strong></span>
    </div>
    <div class="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-3 py-1.5 font-medium">
      OpCo: <strong>${escapeHtml(currentRoute.opCo)}</strong>
    </div>
  `;
}

function renderRouteMetrics() {
  if (!currentRoute) return;
  const metrics = computeRouteMetrics(currentRoute);

  document.getElementById('metricDistance').textContent = `${metrics.totalDistanceMiles} mi (${metrics.totalDistanceKm} km)`;
  document.getElementById('metricDriveTime').textContent = metrics.drivingTimeFormatted;
  document.getElementById('metricDwellTime').textContent = metrics.dwellTimeFormatted;
  document.getElementById('metricTotalCycle').textContent = metrics.totalCycleFormatted;
  document.getElementById('metricStopsCount').textContent = metrics.stopCount;
  document.getElementById('hazardCountBadge').textContent = metrics.hazardCount;

  // Update floating map HUD
  const hudDist = document.getElementById('hudDistance');
  if (hudDist) hudDist.textContent = `${metrics.totalDistanceMiles} mi`;
  const hudWay = document.getElementById('hudWaypoints');
  if (hudWay) hudWay.textContent = (currentRoute.waypoints || []).length;
  const hudStops = document.getElementById('hudStops');
  if (hudStops) hudStops.textContent = metrics.stopCount;

  // Update calculation breakdown line
  document.getElementById('metricFormulaText').textContent = 
    `Calculated from ${metrics.stopCount} stops using ${currentRoute.defaultDwellTimeSeconds || 60}s baseline dwell per stop + road speed limits.`;
}

// Render Bus Stops & Waypoints Tab Table
function renderStopsTable() {
  const tbody = document.getElementById('stopsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const stops = (currentRoute.stops || []).sort((a, b) => a.sequence - b.sequence);

  if (stops.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400 italic">
          No bus stops or waypoints recorded yet. Use the map "Drop Bus Stop" button or GPS tracker to log points.
        </td>
      </tr>
    `;
    return;
  }

  stops.forEach((stop, index) => {
    let interDist = 0;
    if (index > 0) {
      interDist = calculateDistanceMiles(stops[index - 1].lat, stops[index - 1].lng, stop.lat, stop.lng);
    }
    const config = getMarkerTypeConfig(stop.type);

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-200 text-xs';
    tr.innerHTML = `
      <td class="py-3 px-3 font-bold text-slate-700">${stop.sequence}</td>
      <td class="py-3 px-3">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${config.badgeClass}">
          <span class="mr-1">${config.iconEmoji}</span> ${config.shortLabel}
        </span>
      </td>
      <td class="py-3 px-3">
        <strong class="text-stagecoach-navy block">${escapeHtml(stop.name)}</strong>
        ${stop.notes ? `<span class="text-[10px] text-slate-500 italic block mt-0.5">${escapeHtml(stop.notes)}</span>` : ''}
      </td>
      <td class="py-3 px-3">
        <span class="text-[11px] font-medium ${stop.durationStatus && stop.durationStatus.includes('Temporary') ? 'text-orange-700 font-bold' : (stop.durationStatus && stop.durationStatus.includes('Long-Term') ? 'text-red-700 font-bold' : 'text-slate-600')}">
          ${escapeHtml(stop.durationStatus || 'Permanent')}
        </span>
      </td>
      <td class="py-3 px-3 font-mono text-[11px] text-slate-500">${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</td>
      <td class="py-3 px-3">
        <span class="font-medium text-slate-700">${interDist > 0 ? interDist.toFixed(2) + ' mi' : 'Start'}</span>
      </td>
      <td class="py-3 px-3">
        <div class="flex items-center space-x-1">
          <input type="number" value="${stop.dwellSeconds || 60}" min="0" step="15" 
            onchange="updateStopDwell('${stop.id}', this.value)" 
            class="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold text-stagecoach-blue bg-white focus:ring-1 focus:ring-stagecoach-orange outline-none" />
          <span class="text-slate-500 text-[10px]">sec</span>
        </div>
      </td>
      <td class="py-3 px-3 text-right space-x-1">
        <button onclick="editStop('${stop.id}')" class="text-stagecoach-blue hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition" title="Edit Marker">
          <i data-lucide="edit" class="w-3.5 h-3.5 inline"></i>
        </button>
        <button onclick="deleteStop('${stop.id}')" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition" title="Remove Marker">
          <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStopDwell(stopId, newDwellSeconds) {
  const stop = currentRoute.stops.find(s => s.id === stopId);
  if (stop) {
    stop.dwellSeconds = parseInt(newDwellSeconds, 10) || 60;
    saveCurrentRoute();
    renderRouteMetrics();
  }
}

function deleteStop(stopId) {
  const stop = currentRoute.stops.find(s => s.id === stopId);
  const name = stop ? stop.name : 'Marker';
  showConfirmDialog({
    title: 'Remove Route Marker?',
    badge: 'Remove Marker',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    icon: 'trash-2',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    message: `Remove "${name}" from Service ${currentRoute.serviceNumber}?`,
    subtext: 'Stop sequence numbers and scheduled dwell calculations will be recomputed automatically.',
    confirmBtnText: 'Yes, Remove Stop',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    cancelBtnText: 'Cancel',
    onConfirm: () => {
      currentRoute.stops = currentRoute.stops.filter(s => s.id !== stopId);
      currentRoute.stops.forEach((s, i) => s.sequence = i + 1);
      saveCurrentRoute();
      renderAll();
      showToast(`🗑️ Removed ${name}`);
    }
  });
}

// Render Hazards
function renderHazardCards(filter = 'all') {
  const container = document.getElementById('hazardsGrid');
  if (!container) return;
  container.innerHTML = '';

  let hazards = currentRoute.hazards || [];

  if (filter === 'High') {
    hazards = hazards.filter(h => (h.initialRisk || h.initialSeverity * h.initialLikelihood) >= 10);
  } else if (filter === 'Bridge') {
    hazards = hazards.filter(h => h.category.toLowerCase().includes('bridge') || h.title.toLowerCase().includes('bridge') || h.title.toLowerCase().includes('arch'));
  } else if (filter === 'Rural') {
    hazards = hazards.filter(h => h.category.toLowerCase().includes('verge') || h.category.toLowerCase().includes('tree') || h.title.toLowerCase().includes('track'));
  }

  if (hazards.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
        <i data-lucide="shield-check" class="w-12 h-12 mx-auto text-emerald-500 mb-2"></i>
        <p class="font-semibold text-slate-700 text-base">No hazards match this filter.</p>
        <p class="text-xs text-slate-500 mt-1">Click "Log New Hazard" to add visual survey points and risk scoring.</p>
      </div>
    `;
    return;
  }

  hazards.forEach(hazard => {
    const initialScore = hazard.initialRisk || (hazard.initialSeverity * hazard.initialLikelihood);
    const residualScore = hazard.residualRisk || (hazard.residualSeverity * hazard.residualLikelihood);
    const initialClass = getRiskClassification(initialScore);
    const residualClass = getRiskClassification(residualScore);

    const card = document.createElement('div');
    card.id = `hazard-card-${hazard.id}`;
    card.className = `hazard-card bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between`;
    
    card.innerHTML = `
      <div>
        <!-- Card Header -->
        <div class="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">${escapeHtml(hazard.category)}</span>
              <span class="font-mono text-[11px] text-slate-400">${hazard.lat ? `${hazard.lat.toFixed(4)}, ${hazard.lng.toFixed(4)}` : ''}</span>
            </div>
            <h3 class="text-base font-bold text-stagecoach-navy mt-0.5">${escapeHtml(hazard.title)}</h3>
          </div>
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <span class="px-2.5 py-1 rounded text-xs font-bold ${initialClass.badgeClass}">
              Initial: ${initialScore}/25
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 space-y-3">
          <!-- Visual Photo Area -->
          <div class="relative group bg-slate-100 rounded-lg overflow-hidden border border-slate-200 min-h-[160px] flex items-center justify-center">
            ${hazard.photoUrl ? `
              <img src="${hazard.photoUrl}" alt="${escapeHtml(hazard.title)}" class="w-full h-48 object-cover cursor-pointer" onclick="openPhotoModal('${hazard.photoUrl}', '${escapeHtml(hazard.title)}')"/>
              <div class="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                Click to Enlarge
              </div>
            ` : `
              <div class="text-center p-6 text-slate-400">
                <i data-lucide="image" class="w-8 h-8 mx-auto mb-1 opacity-50"></i>
                <p class="text-xs font-medium">No site photo attached</p>
                <label class="mt-2 inline-flex items-center space-x-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded cursor-pointer shadow-sm">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                  <span>Upload / Snap Photo</span>
                  <input type="file" accept="image/*" class="hidden" onchange="handleHazardPhotoUpload('${hazard.id}', event)" />
                </label>
              </div>
            `}
          </div>

          <!-- Description -->
          <div class="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong class="text-slate-900 block mb-0.5">Hazard Observation:</strong>
            <p class="leading-relaxed">${escapeHtml(hazard.description)}</p>
          </div>

          <!-- Controls Applied & Residual Rating -->
          <div class="text-xs bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 space-y-1">
            <strong class="text-stagecoach-navy block">Mitigation Controls & Rules:</strong>
            <p class="text-slate-700 whitespace-pre-line leading-relaxed">${escapeHtml(hazard.controlMeasures || 'Standard defensive driving.')}</p>
          </div>

          ${hazard.councilEscalation ? `
            <div class="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-center space-x-1.5">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 flex-shrink-0 text-amber-600"></i>
              <span><strong>Council / Authority Escalation:</strong> ${escapeHtml(hazard.councilEscalation)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Card Footer -->
      <div class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2">
          <span class="text-slate-500 font-medium">Residual Risk:</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${residualClass.badgeClass}">
            Score: ${residualScore} (${residualClass.label})
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="editHazard('${hazard.id}')" class="text-stagecoach-blue hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition">
            Edit
          </button>
          <button onclick="deleteHazard('${hazard.id}')" class="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition">
            Delete
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function handleHazardPhotoUpload(hazardId, event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const hazard = currentRoute.hazards.find(h => h.id === hazardId);
    if (hazard) {
      hazard.photoUrl = e.target.result;
      saveCurrentRoute();
      renderHazardCards();
      renderMapForCurrentRoute();
      lucide.createIcons();
    }
  };
  reader.readAsDataURL(file);
}

function deleteHazard(hazardId) {
  const hazard = currentRoute.hazards.find(h => h.id === hazardId);
  const title = hazard ? hazard.title : 'Hazard';
  showConfirmDialog({
    title: 'Remove Hazard Assessment?',
    badge: 'Remove Risk',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    icon: 'trash-2',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    message: `Remove "${title}" from the route hazard register?`,
    subtext: 'The 5x5 risk scoring, site photos, and council escalation records for this hazard will be deleted from the audit.',
    confirmBtnText: 'Yes, Remove Hazard',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    cancelBtnText: 'Cancel',
    onConfirm: () => {
      currentRoute.hazards = currentRoute.hazards.filter(h => h.id !== hazardId);
      saveCurrentRoute();
      renderAll();
      showToast(`🗑️ Removed hazard observation`);
    }
  });
}

// 5x5 Matrix Heatmap
function render5x5Matrix() {
  const tbody = document.getElementById('matrixTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const hazards = currentRoute.hazards || [];

  // Matrix rows: Severity 5 down to 1
  for (let s = 5; s >= 1; s--) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="p-2 font-bold text-slate-700 text-xs text-left bg-slate-50 border border-slate-200">Severity ${s}</td>`;

    // Columns: Likelihood 1 to 5
    for (let l = 1; l <= 5; l++) {
      const score = s * l;
      let bgCol = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      if (score >= 17) bgCol = 'bg-red-500 text-white border-red-600';
      else if (score >= 10) bgCol = 'bg-amber-400 text-slate-900 border-amber-500';
      else if (score >= 5) bgCol = 'bg-yellow-200 text-slate-900 border-yellow-300';

      // Count hazards in this cell
      const initialCount = hazards.filter(h => (h.initialSeverity === s && h.initialLikelihood === l) || (!h.initialSeverity && (h.initialRisk === score))).length;
      const residualCount = hazards.filter(h => (h.residualSeverity === s && h.residualLikelihood === l) || (!h.residualSeverity && (h.residualRisk === score))).length;

      tr.innerHTML += `
        <td class="p-3 border border-slate-200 font-bold ${bgCol} matrix-cell relative cursor-pointer" onclick="filterByMatrixScore(${score})">
          <div class="text-sm">${score}</div>
          ${(initialCount > 0 || residualCount > 0) ? `
            <div class="mt-1 flex items-center justify-center space-x-1 text-[10px]">
              ${initialCount > 0 ? `<span class="bg-slate-900 text-white px-1.5 py-0.2 rounded-full font-sans" title="Initial Hazards">Ri:${initialCount}</span>` : ''}
              ${residualCount > 0 ? `<span class="bg-white text-slate-900 px-1.5 py-0.2 rounded-full font-sans shadow" title="Residual Hazards">Rr:${residualCount}</span>` : ''}
            </div>
          ` : ''}
        </td>
      `;
    }
    tbody.appendChild(tr);
  }
}

function filterByMatrixScore(score) {
  switchTab('hazards');
  // Visual highlight
  const cards = document.querySelectorAll('.hazard-card');
  cards.forEach(card => {
    card.classList.remove('ring-4', 'ring-stagecoach-orange');
  });
}

// Vehicle Compatibility
function renderFleetCompatibility() {
  const tbody = document.getElementById('fleetTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const classes = [
    { key: 'doubleDeckHigh', name: 'Double Deck (High: 4.40m / 14\'5")', example: 'ADL Enviro400 / Scania Omnicity', defaultHeight: '4.40m / 11.5m' },
    { key: 'doubleDeckLow', name: 'Double Deck (Low Height: 4.15m / 13\'7")', example: 'ADL Enviro400 Low Variant', defaultHeight: '4.15m / 10.9m' },
    { key: 'singleDeck12m', name: 'Standard Single Deck (11.8m - 12.0m)', example: 'Volvo B8RLE / ADL Enviro200 MMC', defaultHeight: '3.15m / 11.8m' },
    { key: 'midiBus', name: 'Midi Single Deck (8.9m - 9.7m)', example: 'ADL Enviro200 Short Wheelbase', defaultHeight: '3.05m / 9.5m' },
    { key: 'optareSolo', name: 'Optare Solo / Slimline (7.8m - 8.5m)', example: 'Optare Solo SR Narrow Width', defaultHeight: '2.85m / 8.5m' },
    { key: 'electricEV', name: 'Electric Battery EV Fleet (Roof Pods)', example: 'Yutong E10 / E12 / Alexander Dennis EV', defaultHeight: '3.35m (Roof HVAC)' }
  ];

  const restrictions = currentRoute.vehicleRestrictions || {};

  classes.forEach(cls => {
    const item = restrictions[cls.key] || { status: 'PENDING', note: 'Survey required' };
    let badgeClass = 'bg-emerald-600 text-white';
    if (item.status === 'PROHIBITED') badgeClass = 'bg-red-600 text-white';
    else if (item.status === 'RESTRICTED') badgeClass = 'bg-amber-500 text-white';
    else if (item.status === 'PENDING') badgeClass = 'bg-slate-400 text-white';

    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-200 text-xs hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-800">${cls.name}</td>
      <td class="py-3 px-4 text-slate-600">${cls.example}</td>
      <td class="py-3 px-4 font-mono text-[11px] text-slate-500">${cls.defaultHeight}</td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateFleetStatus('${cls.key}', this.value)" class="font-bold text-xs px-2.5 py-1 rounded-full ${badgeClass} cursor-pointer outline-none border-none">
          <option value="PERMITTED" ${item.status === 'PERMITTED' ? 'selected' : ''} class="bg-white text-slate-800">PERMITTED</option>
          <option value="RESTRICTED" ${item.status === 'RESTRICTED' ? 'selected' : ''} class="bg-white text-slate-800">RESTRICTED</option>
          <option value="PROHIBITED" ${item.status === 'PROHIBITED' ? 'selected' : ''} class="bg-white text-slate-800">PROHIBITED</option>
          <option value="PENDING" ${item.status === 'PENDING' ? 'selected' : ''} class="bg-white text-slate-800">PENDING</option>
        </select>
      </td>
      <td class="py-3 px-4">
        <input type="text" value="${escapeHtml(item.note || '')}" 
          onchange="updateFleetNote('${cls.key}', this.value)" 
          class="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 bg-white focus:ring-1 focus:ring-stagecoach-orange outline-none" placeholder="Operational rationale or restriction..." />
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateFleetStatus(key, newStatus) {
  if (!currentRoute.vehicleRestrictions) currentRoute.vehicleRestrictions = {};
  if (!currentRoute.vehicleRestrictions[key]) currentRoute.vehicleRestrictions[key] = {};
  currentRoute.vehicleRestrictions[key].status = newStatus;
  saveCurrentRoute();
  renderFleetCompatibility();
  renderRouteProfileBanner();
}

function updateFleetNote(key, newNote) {
  if (!currentRoute.vehicleRestrictions) currentRoute.vehicleRestrictions = {};
  if (!currentRoute.vehicleRestrictions[key]) currentRoute.vehicleRestrictions[key] = {};
  currentRoute.vehicleRestrictions[key].note = newNote;
  saveCurrentRoute();
}

// Driver Cab Flashcard
function renderDriverCabFlashcard() {
  const container = document.getElementById('driverCardContent');
  if (!container) return;

  const hazards = currentRoute.hazards || [];
  const restrictions = currentRoute.vehicleRestrictions || {};

  container.innerHTML = `
    <div class="bg-white rounded-xl border-2 border-slate-800 p-6 shadow-sm">
      <!-- Flashcard Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-stagecoach-orange pb-3 mb-4 gap-2">
        <div>
          <div class="flex items-center space-x-2">
            <span class="bg-stagecoach-navy text-white text-sm font-extrabold px-3 py-1 rounded">SERVICE ${escapeHtml(currentRoute.serviceNumber)}</span>
            <span class="text-sm font-bold text-slate-900">${escapeHtml(currentRoute.routeName)}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Depot: ${escapeHtml(currentRoute.depot)} &bull; Ref: ${escapeHtml(currentRoute.documentRef)}</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-3 py-1 bg-red-100 text-red-900 border border-red-300 font-extrabold text-xs rounded">
            DOUBLE DECK: ${restrictions.doubleDeckHigh?.status || 'PROHIBITED'}
          </span>
        </div>
      </div>

      <!-- Critical Hazard Bulletins -->
      <div class="space-y-3 mb-6">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i>
          <span>Critical Turn-by-Turn Safety Bulletins:</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${hazards.map((h, i) => `
            <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
              <div class="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>${i + 1}. ${escapeHtml(h.title)}</span>
                <span class="text-[10px] px-2 py-0.5 rounded ${getRiskClassification(h.initialRisk).badgeClass}">${h.category}</span>
              </div>
              <p class="text-slate-600 mb-1">${escapeHtml(h.description)}</p>
              <div class="bg-amber-100/60 p-1.5 rounded border border-amber-200 font-semibold text-amber-900">
                Rule: ${escapeHtml(h.controlMeasures || 'Defensive road position')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Driver Defensive Speed & Clearance Rules -->
      <div class="bg-stagecoach-navy text-white p-4 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <strong class="text-amber-300 block mb-1">1. Speed Protocol</strong>
          <p class="text-slate-200 text-[11px]">Strict compliance with rural 20/30mph speed control notices in single-track sections.</p>
        </div>
        <div>
          <strong class="text-amber-300 block mb-1">2. Verge Policy</strong>
          <p class="text-slate-200 text-[11px]">Never yield onto unpaved peat verges. Reverse to designated tarmac passing places.</p>
        </div>
        <div>
          <strong class="text-amber-300 block mb-1">3. Bridge / Arch Line</strong>
          <p class="text-slate-200 text-[11px]">Center-lane arch alignment required under Castle Grant / low railway overpasses.</p>
        </div>
      </div>
    </div>
  `;
}

// Governance Sign-Off Canvas Pads
let assessorPad = null;
let approverPad = null;

function renderGovernanceSignOff() {
  if (!currentRoute) return;

  document.getElementById('govAssessorName').value = currentRoute.assessorName || '';
  document.getElementById('govApproverName').value = currentRoute.approverName || '';
  document.getElementById('govSurveyDate').value = currentRoute.surveyDate || '';
  document.getElementById('govReviewDate').value = currentRoute.reviewDate || '';
  document.getElementById('govDocRef').value = currentRoute.documentRef || '';

  initSignaturePads();
}

function initSignaturePads() {
  setupCanvasSignature('assessorCanvas', 'clearAssessorSig', (dataUrl) => {
    currentRoute.assessorSignature = dataUrl;
    saveCurrentRoute();
  }, currentRoute.assessorSignature);

  setupCanvasSignature('approverCanvas', 'clearApproverSig', (dataUrl) => {
    currentRoute.approverSignature = dataUrl;
    saveCurrentRoute();
  }, currentRoute.approverSignature);
}

function setupCanvasSignature(canvasId, clearBtnId, onSave, existingDataUrl) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Set real canvas dimensions
  canvas.width = canvas.parentElement.clientWidth || 360;
  canvas.height = 130;
  ctx.strokeStyle = '#002855';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (existingDataUrl) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = existingDataUrl;
  }

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function startDraw(x, y) {
    isDrawing = true;
    [lastX, lastY] = [x, y];
  }

  function draw(x, y) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    [lastX, lastY] = [x, y];
  }

  function stopDraw() {
    if (isDrawing) {
      isDrawing = false;
      onSave(canvas.toDataURL());
    }
  }

  // Mouse
  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    startDraw(e.clientX - rect.left, e.clientY - rect.top);
  };
  canvas.onmousemove = (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };
  canvas.onmouseup = stopDraw;
  canvas.onmouseleave = stopDraw;

  // Touch for mobile/tablet
  canvas.ontouchstart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    startDraw(touch.clientX - rect.left, touch.clientY - rect.top);
  };
  canvas.ontouchmove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };
  canvas.ontouchend = stopDraw;

  clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave(null);
  };
}

function saveGovernanceMetadata() {
  if (!currentRoute) return;
  currentRoute.assessorName = document.getElementById('govAssessorName').value.trim();
  currentRoute.approverName = document.getElementById('govApproverName').value.trim();
  currentRoute.surveyDate = document.getElementById('govSurveyDate').value;
  currentRoute.reviewDate = document.getElementById('govReviewDate').value;
  currentRoute.documentRef = document.getElementById('govDocRef').value.trim();
  currentRoute.signOffDate = new Date().toISOString().split('T')[0];
  currentRoute.overallStatus = 'APPROVED';
  saveCurrentRoute();
  alert('Governance Sign-Off details saved successfully.');
}

// --- Modals & Interactions ---

function switchTab(tabKey) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabKey) {
      btn.classList.add('bg-stagecoach-blue/50', 'text-white', 'active');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('bg-stagecoach-blue/50', 'text-white', 'active');
      btn.classList.add('text-slate-300');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('block');
  });

  const activeContent = document.getElementById(`tab-${tabKey}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
    activeContent.classList.add('block');
  }

  if (tabKey === 'map' && map) {
    setTimeout(() => map.invalidateSize(), 200);
  }
}

function openAddStopModal(lat = null, lng = null, presetType = 'BUS_STOP') {
  const nextSeq = (currentRoute.stops?.length || 0) + 1;
  const config = getMarkerTypeConfig(presetType);

  document.getElementById('stopModalTitle').textContent = `Add ${config.label}`;
  document.getElementById('stopEditId').value = '';
  document.getElementById('stopSequence').value = nextSeq;
  document.getElementById('stopName').value = `${config.shortLabel} ${nextSeq}`;
  
  if (presetType === 'TEMP_STOP') {
    document.getElementById('stopDuration').value = 'Temporary Pop-up (Days/Weeks)';
    document.getElementById('stopDwell').value = 60;
  } else if (presetType === 'ROADWORKS') {
    document.getElementById('stopDuration').value = 'Long-Term Roadworks (2-3 Years)';
    document.getElementById('stopDwell').value = 90;
  } else if (presetType === 'JUNCTION') {
    document.getElementById('stopDuration').value = 'Permanent';
    document.getElementById('stopDwell').value = 30;
  } else {
    document.getElementById('stopDuration').value = 'Permanent';
    document.getElementById('stopDwell').value = currentRoute.defaultDwellTimeSeconds || 60;
  }

  document.getElementById('stopNotes').value = '';
  document.getElementById('stopLat').value = lat !== null ? lat.toFixed(6) : (currentGpsCoords?.lat ? currentGpsCoords.lat.toFixed(6) : (currentRoute.waypoints?.[0]?.[0] || 57.34));
  document.getElementById('stopLng').value = lng !== null ? lng.toFixed(6) : (currentGpsCoords?.lng ? currentGpsCoords.lng.toFixed(6) : (currentRoute.waypoints?.[0]?.[1] || -3.55));
  
  const radio = document.querySelector(`input[name="markerType"][value="${presetType}"]`);
  if (radio) radio.checked = true;

  document.getElementById('modalRemoveStopBtn').classList.add('hidden');
  document.getElementById('addStopModal').classList.remove('hidden');
}

function editStop(stopId) {
  const stop = currentRoute.stops.find(s => s.id === stopId);
  if (!stop) return;

  document.getElementById('stopModalTitle').textContent = 'Edit Route Stop / Waypoint Marker';
  document.getElementById('stopEditId').value = stop.id;
  document.getElementById('stopSequence').value = stop.sequence;
  document.getElementById('stopName').value = stop.name;
  document.getElementById('stopDuration').value = stop.durationStatus || 'Permanent';
  document.getElementById('stopDwell').value = stop.dwellSeconds || 60;
  document.getElementById('stopNotes').value = stop.notes || '';
  document.getElementById('stopLat').value = stop.lat ? stop.lat.toFixed(6) : '';
  document.getElementById('stopLng').value = stop.lng ? stop.lng.toFixed(6) : '';

  const radio = document.querySelector(`input[name="markerType"][value="${stop.type || 'BUS_STOP'}"]`);
  if (radio) radio.checked = true;

  document.getElementById('modalRemoveStopBtn').classList.remove('hidden');
  document.getElementById('addStopModal').classList.remove('hidden');
}

function closeAddStopModal() {
  document.getElementById('addStopModal').classList.add('hidden');
}

function modalDeleteCurrentStop() {
  const editId = document.getElementById('stopEditId').value;
  if (!editId) return;
  closeAddStopModal();
  deleteStop(editId);
}

function changeStopType(stopId, newType) {
  const stop = currentRoute.stops.find(s => s.id === stopId);
  if (!stop) return;
  stop.type = newType;
  
  // Auto-adjust default duration if changing to temporary/roadworks
  if (newType === 'TEMP_STOP' && stop.durationStatus === 'Permanent') {
    stop.durationStatus = 'Temporary Pop-up (Days/Weeks)';
  } else if (newType === 'ROADWORKS' && stop.durationStatus === 'Permanent') {
    stop.durationStatus = 'Long-Term Roadworks (2-3 Years)';
  } else if (newType === 'BUS_STOP') {
    stop.durationStatus = 'Permanent';
  }

  saveCurrentRoute();
  renderAll();
}

function saveStopForm(e) {
  e.preventDefault();
  const editId = document.getElementById('stopEditId').value;
  const sequence = parseInt(document.getElementById('stopSequence').value, 10) || 1;
  const name = document.getElementById('stopName').value.trim();
  const dwell = parseInt(document.getElementById('stopDwell').value, 10) || 60;
  const durationStatus = document.getElementById('stopDuration').value;
  const notes = document.getElementById('stopNotes').value.trim();
  const lat = parseFloat(document.getElementById('stopLat').value);
  const lng = parseFloat(document.getElementById('stopLng').value);
  const type = document.querySelector('input[name="markerType"]:checked')?.value || 'BUS_STOP';

  const stopData = {
    id: editId || 'stop-' + Date.now(),
    sequence,
    type,
    name,
    durationStatus,
    notes,
    dwellSeconds: dwell,
    speedLimitMph: 30,
    lat,
    lng
  };

  if (!currentRoute.stops) currentRoute.stops = [];

  if (editId) {
    const idx = currentRoute.stops.findIndex(s => s.id === editId);
    if (idx >= 0) currentRoute.stops[idx] = stopData;
  } else {
    currentRoute.stops.push(stopData);
  }

  currentRoute.stops.sort((a, b) => a.sequence - b.sequence);
  saveCurrentRoute();
  closeAddStopModal();
  renderAll();
}

function openAddHazardModal(lat = null, lng = null) {
  document.getElementById('hazardModalTitle').textContent = 'Log New Route Hazard Assessment';
  document.getElementById('hazardEditId').value = '';
  document.getElementById('hazardTitle').value = '';
  document.getElementById('hazardCategory').value = 'Low Bridge / Overpass';
  document.getElementById('hazardLat').value = lat !== null ? lat.toFixed(6) : (currentGpsCoords?.lat || '');
  document.getElementById('hazardLng').value = lng !== null ? lng.toFixed(6) : (currentGpsCoords?.lng || '');
  document.getElementById('hazardInitialSeverity').value = 4;
  document.getElementById('hazardInitialLikelihood').value = 3;
  document.getElementById('hazardDescription').value = '';
  document.getElementById('hazardControls').value = '';
  document.getElementById('hazardResidualSeverity').value = 2;
  document.getElementById('hazardResidualLikelihood').value = 2;
  document.getElementById('hazardCouncil').value = '';
  document.getElementById('hazardPhotoPreview').src = '';
  document.getElementById('hazardPhotoPreviewContainer').classList.add('hidden');

  updateModalRiskScorePreview();
  document.getElementById('hazardModal').classList.remove('hidden');
}

function editHazard(hazardId) {
  const hazard = currentRoute.hazards.find(h => h.id === hazardId);
  if (!hazard) return;

  document.getElementById('hazardModalTitle').textContent = 'Edit Route Hazard Assessment';
  document.getElementById('hazardEditId').value = hazard.id;
  document.getElementById('hazardTitle').value = hazard.title;
  document.getElementById('hazardCategory').value = hazard.category;
  document.getElementById('hazardLat').value = hazard.lat || '';
  document.getElementById('hazardLng').value = hazard.lng || '';
  document.getElementById('hazardInitialSeverity').value = hazard.initialSeverity || 3;
  document.getElementById('hazardInitialLikelihood').value = hazard.initialLikelihood || 3;
  document.getElementById('hazardDescription').value = hazard.description || '';
  document.getElementById('hazardControls').value = hazard.controlMeasures || '';
  document.getElementById('hazardResidualSeverity').value = hazard.residualSeverity || 2;
  document.getElementById('hazardResidualLikelihood').value = hazard.residualLikelihood || 1;
  document.getElementById('hazardCouncil').value = hazard.councilEscalation || '';

  if (hazard.photoUrl) {
    document.getElementById('hazardPhotoPreview').src = hazard.photoUrl;
    document.getElementById('hazardPhotoPreviewContainer').classList.remove('hidden');
  } else {
    document.getElementById('hazardPhotoPreviewContainer').classList.add('hidden');
  }

  updateModalRiskScorePreview();
  document.getElementById('hazardModal').classList.remove('hidden');
}

function closeHazardModal() {
  document.getElementById('hazardModal').classList.add('hidden');
}

function updateModalRiskScorePreview() {
  const is = parseInt(document.getElementById('hazardInitialSeverity').value, 10) || 1;
  const il = parseInt(document.getElementById('hazardInitialLikelihood').value, 10) || 1;
  const initialScore = is * il;
  const initialClass = getRiskClassification(initialScore);
  
  const initialBadge = document.getElementById('modalInitialScoreBadge');
  initialBadge.textContent = `${initialScore} / 25 (${initialClass.label})`;
  initialBadge.className = `px-2.5 py-1 rounded text-xs font-bold ${initialClass.badgeClass}`;

  const rs = parseInt(document.getElementById('hazardResidualSeverity').value, 10) || 1;
  const rl = parseInt(document.getElementById('hazardResidualLikelihood').value, 10) || 1;
  const residualScore = rs * rl;
  const residualClass = getRiskClassification(residualScore);

  const residualBadge = document.getElementById('modalResidualScoreBadge');
  residualBadge.textContent = `${residualScore} / 25 (${residualClass.label})`;
  residualBadge.className = `px-2.5 py-1 rounded text-xs font-bold ${residualClass.badgeClass}`;
}

function handleModalPhotoSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('hazardPhotoPreview').src = event.target.result;
    document.getElementById('hazardPhotoPreviewContainer').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function saveHazardForm(e) {
  e.preventDefault();
  const editId = document.getElementById('hazardEditId').value;
  const title = document.getElementById('hazardTitle').value.trim();
  const category = document.getElementById('hazardCategory').value;
  const lat = parseFloat(document.getElementById('hazardLat').value) || null;
  const lng = parseFloat(document.getElementById('hazardLng').value) || null;
  const initialSeverity = parseInt(document.getElementById('hazardInitialSeverity').value, 10);
  const initialLikelihood = parseInt(document.getElementById('hazardInitialLikelihood').value, 10);
  const initialRisk = initialSeverity * initialLikelihood;
  const description = document.getElementById('hazardDescription').value.trim();
  const controlMeasures = document.getElementById('hazardControls').value.trim();
  const residualSeverity = parseInt(document.getElementById('hazardResidualSeverity').value, 10);
  const residualLikelihood = parseInt(document.getElementById('hazardResidualLikelihood').value, 10);
  const residualRisk = residualSeverity * residualLikelihood;
  const councilEscalation = document.getElementById('hazardCouncil').value.trim();
  const photoUrl = document.getElementById('hazardPhotoPreview').src || null;

  const hazardData = {
    id: editId || 'h-' + Date.now(),
    title,
    category,
    lat,
    lng,
    initialSeverity,
    initialLikelihood,
    initialRisk,
    riskRating: getRiskClassification(initialRisk).label,
    description,
    controlMeasures,
    residualSeverity,
    residualLikelihood,
    residualRisk,
    residualRating: getRiskClassification(residualRisk).label,
    councilEscalation,
    photoUrl: photoUrl && photoUrl.length > 50 ? photoUrl : null
  };

  if (!currentRoute.hazards) currentRoute.hazards = [];

  if (editId) {
    const idx = currentRoute.hazards.findIndex(h => h.id === editId);
    if (idx >= 0) currentRoute.hazards[idx] = hazardData;
  } else {
    currentRoute.hazards.push(hazardData);
  }

  saveCurrentRoute();
  closeHazardModal();
  renderAll();
}

function openPhotoModal(url, title) {
  document.getElementById('photoModalImage').src = url;
  document.getElementById('photoModalTitle').textContent = title;
  document.getElementById('photoModal').classList.remove('hidden');
}

function closePhotoModal() {
  document.getElementById('photoModal').classList.add('hidden');
}

// --- Hazard Full Detail Inspection Modal (over map / in-place) ---
let currentDetailHazard = null;

function openHazardDetailModal(hazardId) {
  if (!currentRoute || !currentRoute.hazards) return;
  const hazard = currentRoute.hazards.find(h => h.id === hazardId);
  if (!hazard) return;

  currentDetailHazard = hazard;

  const initScore = hazard.initialRisk || (hazard.initialSeverity * hazard.initialLikelihood);
  const residScore = hazard.residualRisk || (hazard.residualSeverity * hazard.residualLikelihood);
  const initClass = getRiskClassification(initScore);
  const residClass = getRiskClassification(residScore);

  const titleEl = document.getElementById('detailHazardTitle');
  if (titleEl) titleEl.textContent = hazard.title;

  const catEl = document.getElementById('detailCategoryBadge');
  if (catEl) catEl.textContent = hazard.category || 'Route Hazard';

  const gpsEl = document.getElementById('detailGpsCoords');
  if (gpsEl) gpsEl.textContent = (hazard.lat && hazard.lng) ? `${hazard.lat.toFixed(5)}, ${hazard.lng.toFixed(5)}` : 'GPS Not Tagged';

  const routeEl = document.getElementById('detailRouteInfo');
  if (routeEl) routeEl.textContent = `Service ${currentRoute.serviceNumber} (${currentRoute.routeName})`;

  // Badges
  const initBadge = document.getElementById('detailInitialScoreBadge');
  if (initBadge) {
    initBadge.textContent = `${initScore} / 25 (${initClass.label})`;
    initBadge.className = `px-2 py-0.5 rounded text-[11px] font-extrabold ${initClass.badgeClass}`;
  }

  const residBadge = document.getElementById('detailResidualScoreBadge');
  if (residBadge) {
    residBadge.textContent = `${residScore} / 25 (${residClass.label})`;
    residBadge.className = `px-2 py-0.5 rounded text-[11px] font-extrabold ${residClass.badgeClass}`;
  }

  const initBreakdown = document.getElementById('detailInitialBreakdown');
  if (initBreakdown) {
    const s = hazard.initialSeverity || Math.min(5, Math.ceil(initScore / 3));
    const l = hazard.initialLikelihood || Math.min(5, Math.max(1, Math.round(initScore / s)));
    initBreakdown.textContent = `Severity ${s} × Likelihood ${l}`;
  }

  const residBreakdown = document.getElementById('detailResidualBreakdown');
  if (residBreakdown) {
    const s = hazard.residualSeverity || 2;
    const l = hazard.residualLikelihood || 2;
    residBreakdown.textContent = `Severity ${s} × Likelihood ${l}`;
  }

  // Photo
  const photoCont = document.getElementById('detailPhotoContainer');
  const photoImg = document.getElementById('detailPhotoImg');
  if (photoCont && photoImg) {
    if (hazard.photoUrl) {
      photoImg.src = hazard.photoUrl;
      photoCont.classList.remove('hidden');
    } else {
      photoCont.classList.add('hidden');
    }
  }

  // Text fields
  const obsEl = document.getElementById('detailObservationText');
  if (obsEl) obsEl.textContent = hazard.description || 'No physical observation description provided.';

  const ctrlEl = document.getElementById('detailControlsText');
  if (ctrlEl) ctrlEl.textContent = hazard.controlMeasures || '1. General defensive driving standards apply.';

  // Council
  const councilBox = document.getElementById('detailCouncilBox');
  const councilText = document.getElementById('detailCouncilText');
  if (councilBox && councilText) {
    if (hazard.councilEscalation && hazard.councilEscalation.trim()) {
      councilText.textContent = hazard.councilEscalation;
      councilBox.classList.remove('hidden');
    } else {
      councilBox.classList.add('hidden');
    }
  }

  // Edit button action
  const editBtn = document.getElementById('detailEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeHazardDetailModal();
      editHazard(hazard.id);
    };
  }

  const modalEl = document.getElementById('hazardDetailModal');
  if (modalEl) modalEl.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeHazardDetailModal() {
  const modalEl = document.getElementById('hazardDetailModal');
  if (modalEl) modalEl.classList.add('hidden');
}

function openDetailPhotoLightbox() {
  if (currentDetailHazard && currentDetailHazard.photoUrl) {
    openPhotoModal(currentDetailHazard.photoUrl, currentDetailHazard.title);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Explicit window global exports for inline HTML onclick handlers
window.setMapMode = setMapMode;
window.undoLastWaypoint = undoLastWaypoint;
window.reverseRouteDirection = reverseRouteDirection;
window.clearRoutePolyline = clearRoutePolyline;
window.startOverRoute = startOverRoute;
window.showConfirmDialog = showConfirmDialog;
window.closeConfirmDialog = closeConfirmDialog;
window.toggleMapLayer = toggleMapLayer;
window.fitRouteBounds = fitRouteBounds;
window.deleteWaypoint = deleteWaypoint;
window.showToast = showToast;
window.openHazardDetailModal = openHazardDetailModal;
window.closeHazardDetailModal = closeHazardDetailModal;
window.openDetailPhotoLightbox = openDetailPhotoLightbox;
window.openAddStopModal = openAddStopModal;
window.openAddHazardModal = openAddHazardModal;
window.closeAddStopModal = closeAddStopModal;
window.closeHazardModal = closeHazardModal;
window.editStop = editStop;
window.deleteStop = deleteStop;
window.changeStopType = changeStopType;
window.saveStopForm = saveStopForm;
window.modalDeleteCurrentStop = modalDeleteCurrentStop;
window.editHazard = editHazard;
window.deleteHazard = deleteHazard;
window.saveHazardForm = saveHazardForm;
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;
window.openNewRouteModal = openNewRouteModal;
window.closeNewRouteModal = closeNewRouteModal;
window.createNewRoute = createNewRoute;
window.duplicateCurrentRoute = duplicateCurrentRoute;
window.deleteCurrentRoute = deleteCurrentRoute;
window.exportRoutesAsJson = exportRoutesAsJson;
window.importRoutesFromJson = importRoutesFromJson;
window.resetToMockData = resetToMockData;
window.toggleGpsTracking = toggleGpsTracking;
window.switchTab = switchTab;
window.switchRoute = switchRoute;
window.saveGovernanceMetadata = saveGovernanceMetadata;
window.updateStopDwell = updateStopDwell;
window.updateFleetStatus = updateFleetStatus;
window.updateFleetNote = updateFleetNote;
window.filterByMatrixScore = filterByMatrixScore;
window.scrollToHazardCard = scrollToHazardCard;
window.handleHazardPhotoUpload = handleHazardPhotoUpload;
window.handleModalPhotoSelected = handleModalPhotoSelected;

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDatabase();
    await loadRoutesList();
    currentRoute = await getRouteFromDB(currentRouteId);
    initMap();
    renderAll();
  } catch (initErr) {
    console.error('Initialization error in Stagecoach RRA app:', initErr);
  }

  // Tab button listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Filter button listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-slate-800', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.add('active', 'bg-slate-800', 'text-white');
      btn.classList.remove('bg-slate-100', 'text-slate-700');
      renderHazardCards(btn.dataset.filter);
    });
  });

  // Route switch listener
  const routeSelect = document.getElementById('routeSelector');
  if (routeSelect) {
    routeSelect.addEventListener('change', (e) => {
      switchRoute(e.target.value);
    });
  }

  // Left Sidebar GIS mode selector buttons
  document.querySelectorAll('.gis-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setMapMode(btn.dataset.mode);
    });
  });

  // Global Keyboard Shortcuts for GIS Operations
  window.addEventListener('keydown', (e) => {
    // Esc cancels drawing or drops back to browse mode
    if (e.key === 'Escape') {
      setMapMode('browse');
    }
    // Ctrl+Z or Cmd+Z triggers undo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (mapMode === 'draw_route') {
        e.preventDefault();
        undoLastWaypoint();
      }
    }
  });

  // Risk calculation reactive inputs in modal
  ['hazardInitialSeverity', 'hazardInitialLikelihood', 'hazardResidualSeverity', 'hazardResidualLikelihood'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateModalRiskScorePreview);
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Stagecoach RRA Service Worker registered:', reg.scope);
          // Check for worker updates
          reg.update();
        })
        .catch(err => console.warn('Service Worker registration failed:', err));
    });
  }

  // PWA Install Prompt Listener
  let deferredPrompt = null;
  const installBtn = document.getElementById('installAppBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA install prompt outcome: ${outcome}`);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('Stagecoach RRA app successfully installed on device.');
    if (installBtn) installBtn.classList.add('hidden');
  });

  if (window.lucide) lucide.createIcons();
});
