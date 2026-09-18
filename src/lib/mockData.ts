import { RouteAssessment } from '@/types/route';

export const initialMockRoutes: RouteAssessment[] = [
  {
    id: 'SC-RRA-007-MAN',
    routeNumber: '7',
    routeTitle: 'Manchester Piccadilly - Ashton-under-Lyne Interchange',
    depot: 'Hyde Road Depot (Greater Manchester)',
    operatingCompany: 'Stagecoach Manchester',
    assessorName: 'David H. (Senior RRA Lead)',
    assessmentDate: '2026-03-15',
    reviewDate: '2027-03-15',
    status: 'Approved',
    totalDistanceKm: 10.45,
    estimatedRunningTimeMin: 42,
    averageSpeedKph: 21,
    pathCoordinates: [
      [53.4774, -2.2309], // Piccadilly Rail Station
      [53.4795, -2.2212], // Pin Mill Brow
      [53.4811, -2.2045], // Every Street / Pollard St
      [53.4830, -2.1890], // Ashton Old Road / Pottery Lane
      [53.4822, -2.1650], // Openshaw High Street
      [53.4845, -2.1380], // Higher Openshaw / Fairfield
      [53.4870, -2.1120], // Audenshaw Snipe Retail Park
      [53.4900, -2.0945], // Ashton Moss
      [53.4905, -2.0880]  // Ashton Interchange Bus Station
    ],
    stops: [
      {
        id: 'stop-1',
        name: 'Manchester Piccadilly (Stand D)',
        stopType: 'bus_stop',
        lat: 53.4774,
        lng: -2.2309,
        dwellMinutes: 2,
        notes: 'High passenger boarding volume / timing point.',
        order: 1
      },
      {
        id: 'stop-2',
        name: 'Every Street Tram Crossing',
        stopType: 'junction',
        lat: 53.4811,
        lng: -2.2045,
        dwellMinutes: 0.5,
        notes: 'Metrolink level tram tracks interface. Caution on wet rails.',
        order: 2
      },
      {
        id: 'stop-3',
        name: 'Openshaw St Peter’s Church (Temp Stop)',
        stopType: 'popup_stop',
        lat: 53.4822,
        lng: -2.1650,
        dwellMinutes: 1,
        notes: 'Temporary stop for gas main replacement diversion.',
        order: 3
      },
      {
        id: 'stop-4',
        name: 'Snipe Commercial Park Roadworks',
        stopType: 'roadworks',
        lat: 53.4870,
        lng: -2.1120,
        dwellMinutes: 1,
        notes: 'Long-term roundabout junction remodeling (2025-2027).',
        order: 4
      },
      {
        id: 'stop-5',
        name: 'Ashton-under-Lyne Interchange',
        stopType: 'bus_stop',
        lat: 53.4905,
        lng: -2.0880,
        dwellMinutes: 3,
        notes: 'Terminus layover & crew relief point.',
        order: 5
      }
    ],
    hazards: [
      {
        id: 'haz-1',
        title: 'Bridge Clearance Height Check (Fairfield Railway Arch)',
        category: 'Low Bridge',
        lat: 53.4845,
        lng: -2.1380,
        locationName: 'Ashton Old Rd / Fairfield Arch',
        severity: 5,
        likelihood: 3,
        initialScore: 15,
        residualSeverity: 4,
        residualLikelihood: 1,
        residualScore: 4,
        controlMeasures: 'Vehicle height strictly restricted to 4.30m. Laser height gauge active at depot exit. Mandatory center carriageway arch alignment sign.',
        speedLimitMph: 20,
        vehicleRestrictions: ['Standard Double Deck Max 4.30m', 'High-bridge Alexander Dennis Enviro400 prohibited'],
        assessorNotes: 'Arch is arched at sides (3.9m curb clearance). Drivers must straddle center marking.',
        timestamp: '2026-03-15T09:30:00Z'
      },
      {
        id: 'haz-2',
        title: 'High-Risk Tree Canopy Strike Corridor',
        category: 'Tree Strike / Overhanging Foliage',
        lat: 53.4822,
        lng: -2.1650,
        locationName: 'Openshaw Eastern Approach',
        severity: 4,
        likelihood: 4,
        initialScore: 16,
        residualSeverity: 3,
        residualLikelihood: 2,
        residualScore: 6,
        controlMeasures: 'Council tree lopping logged ref #TR-9941. Speed reduced to 15 mph in spring/summer leafing season.',
        speedLimitMph: 15,
        assessorNotes: 'Overhanging oak branch on nearside curb strikes double deck windscreen.',
        timestamp: '2026-03-15T10:15:00Z'
      },
      {
        id: 'haz-3',
        title: 'Primary School Crossing & Congested Parent Drop-Off',
        category: 'School Zone / Pedestrian Density',
        lat: 53.4811,
        lng: -2.2045,
        locationName: 'Pollard Street Junction',
        severity: 4,
        likelihood: 4,
        initialScore: 16,
        residualSeverity: 3,
        residualLikelihood: 2,
        residualScore: 6,
        controlMeasures: 'Mandatory 15 mph advisory 08:15-09:00 and 15:00-15:45. Left-turn blind spot camera check mandatory.',
        speedLimitMph: 15,
        assessorNotes: 'High volume of crossing children between parked parent SUVs.',
        timestamp: '2026-03-15T11:00:00Z'
      }
    ],
    vehicleRestrictions: {
      maxVehicleHeightM: 4.30,
      doubleDeckerAllowed: true,
      coachAllowed: true,
      evAllowed: true,
      minTurningRadiusM: 12.5,
      maxAxleWeightTonnes: 18.0,
      notes: 'Standard E400 MMC double deckers cleared. High-spec 4.5m sightseeing open-top prohibited.'
    },
    governance: {
      assessorName: 'David H.',
      assessorRole: 'Senior Route Risk Assessor',
      assessorSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%23002D62">David H.</text></svg>',
      assessorDate: '2026-03-15',
      managerName: 'Sarah Jenkins',
      managerRole: 'Head of Operations & Safety',
      managerSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%23002D62">S. Jenkins</text></svg>',
      managerDate: '2026-03-16',
      status: 'APPROVED',
      reviewComments: 'Annual review complete. Tree trimming request filed with council.'
    },
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-16T14:20:00Z'
  },
  {
    id: 'SC-RRA-X4-CAM',
    routeNumber: 'X4',
    routeTitle: 'Cambridge City Centre - St Neots - Northampton Express',
    depot: 'Cowley Road Depot (Stagecoach East)',
    operatingCompany: 'Stagecoach East',
    assessorName: 'Michael Brown',
    assessmentDate: '2026-02-10',
    reviewDate: '2027-02-10',
    status: 'Approved',
    totalDistanceKm: 68.2,
    estimatedRunningTimeMin: 95,
    averageSpeedKph: 45,
    pathCoordinates: [
      [52.2053, 0.1218],
      [52.2201, -0.0102],
      [52.2310, -0.1500],
      [52.2280, -0.2650],
      [52.2405, -0.9027]
    ],
    stops: [
      {
        id: 'x4-stop-1',
        name: 'Cambridge Drummer St Bus Station',
        stopType: 'bus_stop',
        lat: 52.2053,
        lng: 0.1218,
        dwellMinutes: 5,
        order: 1
      },
      {
        id: 'x4-stop-2',
        name: 'St Neots Market Square',
        stopType: 'bus_stop',
        lat: 52.2280,
        lng: -0.2650,
        dwellMinutes: 2,
        order: 2
      },
      {
        id: 'x4-stop-3',
        name: 'Northampton North Gate Interchange',
        stopType: 'bus_stop',
        lat: 52.2405,
        lng: -0.9027,
        dwellMinutes: 5,
        order: 3
      }
    ],
    hazards: [
      {
        id: 'x4-haz-1',
        title: 'Single-Lane Bridge Signal Delay',
        category: 'Traffic Congestion / Unsignalised Junction',
        lat: 52.2280,
        lng: -0.2650,
        locationName: 'St Neots River Ouse Bridge',
        severity: 3,
        likelihood: 3,
        initialScore: 9,
        residualSeverity: 2,
        residualLikelihood: 2,
        residualScore: 4,
        controlMeasures: 'Defensive following distance, give-way priority adherence.',
        speedLimitMph: 20,
        timestamp: '2026-02-10T10:00:00Z'
      }
    ],
    vehicleRestrictions: {
      maxVehicleHeightM: 4.40,
      doubleDeckerAllowed: true,
      coachAllowed: true,
      evAllowed: true,
      notes: 'Express coaches and double-deckers cleared.'
    },
    governance: {
      assessorName: 'Michael Brown',
      assessorRole: 'RRA Inspector',
      assessorDate: '2026-02-10',
      managerName: 'Eleanor Vance',
      managerRole: 'Safety Director',
      managerDate: '2026-02-12',
      status: 'APPROVED'
    },
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z'
  }
];
