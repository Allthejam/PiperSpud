import { TravelExpensesConfig } from '@/types/spud';

// Representative latitude / longitude coordinates for UK/Scottish Postcode Areas
// and popular Scottish wedding / castle / Highland locations
const UK_POSTCODE_COORDINATES: Record<string, { lat: number; lng: number; isIsland?: boolean; name: string }> = {
  // Edinburgh & Lothians
  'EH': { lat: 55.9533, lng: -3.1883, name: 'Edinburgh & Lothians' },
  'EH1': { lat: 55.9533, lng: -3.1883, name: 'Edinburgh City Centre' },
  'EH30': { lat: 55.9890, lng: -3.4020, name: 'South Queensferry / Dundas Castle' },
  'EH49': { lat: 55.9780, lng: -3.6060, name: 'Linlithgow Palace' },

  // Glasgow & Clyde
  'G': { lat: 55.8642, lng: -4.2518, name: 'Glasgow' },
  'G1': { lat: 55.8642, lng: -4.2518, name: 'Glasgow City Centre' },
  'G63': { lat: 56.0720, lng: -4.4360, name: 'Loch Lomond & The Trossachs' },
  'PA': { lat: 55.8450, lng: -4.4230, name: 'Paisley / Argyll' },

  // Stirling & Central
  'FK': { lat: 56.1165, lng: -3.9369, name: 'Stirling & Falkirk' },
  'FK8': { lat: 56.1200, lng: -3.9400, name: 'Stirling Castle' },

  // Fife & Dundee
  'KY': { lat: 56.1110, lng: -3.1610, name: 'Fife & St Andrews' },
  'KY16': { lat: 56.3398, lng: -2.7967, name: 'St Andrews' },
  'DD': { lat: 56.4620, lng: -2.9707, name: 'Dundee & Angus' },
  'DD8': { lat: 56.6430, lng: -2.8880, name: 'Glamis Castle' },

  // Aberdeen & Grampian
  'AB': { lat: 57.1497, lng: -2.0943, name: 'Aberdeen & Aberdeenshire' },
  'AB35': { lat: 57.0060, lng: -3.3980, name: 'Braemar / Balmoral' },

  // Highlands & Inverness
  'IV': { lat: 57.4778, lng: -4.2247, name: 'Inverness & Scottish Highlands' },
  'IV1': { lat: 57.4778, lng: -4.2247, name: 'Inverness' },
  'IV40': { lat: 57.2750, lng: -5.5130, name: 'Eilean Donan Castle / Kyle' },
  'IV41': { lat: 57.2500, lng: -5.8500, isIsland: true, name: 'Isle of Skye (Broadford)' },
  'IV51': { lat: 57.4120, lng: -6.1960, isIsland: true, name: 'Isle of Skye (Portree)' },
  'IV55': { lat: 57.4470, lng: -6.6570, isIsland: true, name: 'Isle of Skye (Dunvegan)' },

  // Perthshire & Badenoch
  'PH': { lat: 56.3950, lng: -3.4308, name: 'Perth & Kinross' },
  'PH15': { lat: 56.6210, lng: -3.8710, name: 'Aberfeldy / Castle Menzies' },
  'PH18': { lat: 56.7640, lng: -3.8600, name: 'Blair Atholl / Blair Castle' },
  'PH22': { lat: 57.1983, lng: -3.8291, name: 'Aviemore & Cairngorms' },
  'PH33': { lat: 56.8198, lng: -5.1052, name: 'Fort William / Ben Nevis' },

  // Borders & Dumfries
  'TD': { lat: 55.6020, lng: -2.7820, name: 'Scottish Borders (Melrose/Kelso)' },
  'DG': { lat: 55.0700, lng: -3.6060, name: 'Dumfries & Galloway' },
  'DG16': { lat: 54.9960, lng: -3.0720, name: 'Gretna Green (Famous Wedding Forge)' },

  // Ayrshire & Lanarkshire
  'KA': { lat: 55.4586, lng: -4.6292, name: 'Ayrshire & Burns Country' },
  'KA27': { lat: 55.5780, lng: -5.1500, isIsland: true, name: 'Isle of Arran' },
  'ML': { lat: 55.7760, lng: -3.9870, name: 'Motherwell & Lanarkshire' },

  // Scottish Islands & Outer Hebrides
  'PA20': { lat: 55.8360, lng: -5.0560, isIsland: true, name: 'Isle of Bute' },
  'PA42': { lat: 55.6320, lng: -6.1980, isIsland: true, name: 'Isle of Islay' },
  'PA60': { lat: 55.9120, lng: -5.9220, isIsland: true, name: 'Isle of Jura' },
  'PA65': { lat: 56.4440, lng: -5.9920, isIsland: true, name: 'Isle of Mull' },
  'PA76': { lat: 56.3310, lng: -6.4020, isIsland: true, name: 'Isle of Iona' },
  'PA77': { lat: 56.5020, lng: -6.8770, isIsland: true, name: 'Isle of Tiree' },
  'KW': { lat: 58.4410, lng: -3.0950, name: 'Caithness & Wick' },
  'KW15': { lat: 58.9810, lng: -2.9600, isIsland: true, name: 'Orkney Islands (Kirkwall)' },
  'KW16': { lat: 58.9560, lng: -3.2980, isIsland: true, name: 'Orkney Islands (Stromness)' },
  'KW17': { lat: 59.2000, lng: -2.6000, isIsland: true, name: 'Orkney North Isles' },
  'ZE': { lat: 60.1550, lng: -1.1450, isIsland: true, name: 'Shetland Islands (Lerwick)' },
  'HS': { lat: 58.2090, lng: -6.3860, isIsland: true, name: 'Outer Hebrides (Isle of Lewis / Stornoway)' },
  'HS3': { lat: 57.8980, lng: -6.8040, isIsland: true, name: 'Isle of Harris' },
  'HS6': { lat: 57.5960, lng: -7.2280, isIsland: true, name: 'North Uist' },
  'HS8': { lat: 57.2830, lng: -7.3480, isIsland: true, name: 'South Uist' },
  'HS9': { lat: 56.9560, lng: -7.4890, isIsland: true, name: 'Isle of Barra' },

  // Key UK / England Hubs
  'NE': { lat: 54.9783, lng: -1.6178, name: 'Newcastle upon Tyne' },
  'DH': { lat: 54.7761, lng: -1.5733, name: 'Durham' },
  'CA': { lat: 54.8925, lng: -2.9329, name: 'Carlisle & Cumbria' },
  'LA': { lat: 54.0470, lng: -2.8010, name: 'Lancaster & Lake District' },
  'YO': { lat: 53.9590, lng: -1.0815, name: 'York' },
  'LS': { lat: 53.8008, lng: -1.5491, name: 'Leeds' },
  'M': { lat: 53.4808, lng: -2.2426, name: 'Manchester' },
  'L': { lat: 53.4084, lng: -2.9916, name: 'Liverpool' },
  'B': { lat: 52.4862, lng: -1.8904, name: 'Birmingham' },
  'SW': { lat: 51.4990, lng: -0.1419, name: 'London (Westminster / SW)' },
  'W': { lat: 51.5150, lng: -0.1420, name: 'London (West End / Mayfair)' },
  'EC': { lat: 51.5170, lng: -0.0900, name: 'City of London' },
  'E': { lat: 51.5400, lng: -0.0200, name: 'East London' },
  'CF': { lat: 51.4816, lng: -3.1791, name: 'Cardiff, Wales' },
  'BT': { lat: 54.5973, lng: -5.9301, isIsland: true, name: 'Belfast, Northern Ireland' }
};

// Popular Named Scottish Venues & Castles Coordinates
const NAMED_VENUE_COORDINATES: Record<string, { lat: number; lng: number; isIsland?: boolean; name: string }> = {
  'dundas castle': { lat: 55.9890, lng: -3.4020, name: 'Dundas Castle, South Queensferry' },
  'edinburgh castle': { lat: 55.9486, lng: -3.1999, name: 'Edinburgh Castle' },
  'stirling castle': { lat: 56.1200, lng: -3.9400, name: 'Stirling Castle' },
  'eilean donan castle': { lat: 57.2750, lng: -5.5130, name: 'Eilean Donan Castle, Dornie' },
  'blair castle': { lat: 56.7640, lng: -3.8600, name: 'Blair Castle, Pitlochry' },
  'glamis castle': { lat: 56.6430, lng: -2.8880, name: 'Glamis Castle, Angus' },
  'culzean castle': { lat: 55.3547, lng: -4.7890, name: 'Culzean Castle, Ayrshire' },
  'inveraray castle': { lat: 56.2330, lng: -5.0740, name: 'Inveraray Castle, Argyll' },
  'gretna green': { lat: 54.9960, lng: -3.0720, name: 'Gretna Green Famous Blacksmiths Shop' },
  'loch ness': { lat: 57.3229, lng: -4.4244, name: 'Loch Ness / Urquhart Castle' },
  'loch lomond': { lat: 56.0720, lng: -4.4360, name: 'Loch Lomond' },
  'isle of skye': { lat: 57.4120, lng: -6.1960, isIsland: true, name: 'Isle of Skye' },
  'aviemore': { lat: 57.1983, lng: -3.8291, name: 'Aviemore, Cairngorms' },
  'cairngorms': { lat: 57.1983, lng: -3.8291, name: 'Cairngorms National Park' }
};

export interface TravelCostResult {
  distanceMiles: number;
  isWithinFreeRadius: boolean;
  chargeableMiles: number;
  mileageCost: number;
  isOvernightTriggered: boolean;
  overnightCost: number;
  isIslandOrFerry: boolean;
  islandSurcharge: number;
  totalTravelExpense: number;
  isOverseasOrMaxDistance: boolean;
  explanationText: string;
  matchedLocationName: string;
}

/**
 * Calculates straight line distance (Haversine Formula) in miles,
 * augmented with an empirical driving winding factor (1.28x) for Scottish / UK roads.
 */
export function calculateHaversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Real-world road distance multiplier for Scottish Highlands and UK road networks
  const roadFactor = straightLine > 5 ? 1.28 : 1.1;
  return Math.round(straightLine * roadFactor);
}

/**
 * Extract postcode prefix or clean string to find coordinates
 */
export function findCoordinatesForLocation(
  venuePostcode: string,
  venueName?: string,
  venueAddress?: string
): { lat: number; lng: number; isIsland?: boolean; name: string } | null {
  const combinedText = `${venuePostcode || ''} ${venueName || ''} ${venueAddress || ''}`.toLowerCase();

  // Check named venues first
  for (const [nameKey, coord] of Object.entries(NAMED_VENUE_COORDINATES)) {
    if (combinedText.includes(nameKey)) {
      return coord;
    }
  }

  // Clean Postcode
  const cleanPostcode = (venuePostcode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleanPostcode) {
    // Try full outward code (e.g. "EH30", "IV41", "PH22")
    for (let len = 4; len >= 2; len--) {
      const sub = cleanPostcode.substring(0, len);
      if (UK_POSTCODE_COORDINATES[sub]) {
        return UK_POSTCODE_COORDINATES[sub];
      }
    }

    // Try 2-letter area prefix (e.g. "EH", "IV", "PH", "AB", "G")
    const twoLetter = cleanPostcode.replace(/[0-9].*$/, '');
    if (UK_POSTCODE_COORDINATES[twoLetter]) {
      return UK_POSTCODE_COORDINATES[twoLetter];
    }
    const oneLetter = cleanPostcode.substring(0, 1);
    if (UK_POSTCODE_COORDINATES[oneLetter]) {
      return UK_POSTCODE_COORDINATES[oneLetter];
    }
  }

  // Check island names in text
  const islandKeywords = ['skye', 'orkney', 'shetland', 'lewis', 'harris', 'mull', 'islay', 'jura', 'barra', 'uist', 'arran', 'bute', 'iona', 'tiree'];
  for (const island of islandKeywords) {
    if (combinedText.includes(island)) {
      return { lat: 57.4120, lng: -6.1960, isIsland: true, name: `Scottish Island (${island.toUpperCase()})` };
    }
  }

  return null;
}

/**
 * Comprehensive Travel Cost & Additional Expenses Calculation
 */
export function calculateTravelCosts(
  venuePostcode: string,
  venueName: string = '',
  venueAddress: string = '',
  config: TravelExpensesConfig
): TravelCostResult {
  const cleanPostcode = venuePostcode.trim().toUpperCase();
  const lowerText = `${cleanPostcode} ${venueName} ${venueAddress}`.toLowerCase();

  // Check if explicitly overseas / international (e.g. USA, Canada, Germany, Netherlands, France, Spain, Australia, etc.)
  const overseasKeywords = [
    'usa', 'united states', 'america', 'netherlands', 'holland', 'germany', 'deutschland', 
    'france', 'spain', 'italy', 'dubai', 'uae', 'canada', 'australia', 'switzerland', 
    'austria', 'singapore', 'new zealand', 'japan', 'international', 'overseas'
  ];
  const isExplicitlyOverseas = overseasKeywords.some(keyword => lowerText.includes(keyword));

  const targetCoords = findCoordinatesForLocation(venuePostcode, venueName, venueAddress);

  if (isExplicitlyOverseas || (!targetCoords && venuePostcode.length > 0 && !venuePostcode.match(/^[A-Z]{1,2}[0-9]/i))) {
    return {
      distanceMiles: 999,
      isWithinFreeRadius: false,
      chargeableMiles: 0,
      mileageCost: 0,
      isOvernightTriggered: true,
      overnightCost: 0,
      isIslandOrFerry: false,
      islandSurcharge: 0,
      totalTravelExpense: 0,
      isOverseasOrMaxDistance: true,
      explanationText: 'Overseas / International Destination. Bespoke travel logistics quote required (Flights, Transfers & Accommodation).',
      matchedLocationName: 'International / Overseas'
    };
  }

  // Default coordinate fallback if unrecognised UK postcode (approx 35 miles from base)
  const coords = targetCoords || {
    lat: config.baseLatitude + 0.3,
    lng: config.baseLongitude + 0.3,
    name: venuePostcode || venueName || 'UK Destination'
  };

  const oneWayDistance = calculateHaversineDistanceMiles(
    config.baseLatitude,
    config.baseLongitude,
    coords.lat,
    coords.lng
  );

  // Check if distance exceeds Spud's maximum radius
  if (oneWayDistance > config.maxBookingRadiusMiles) {
    return {
      distanceMiles: oneWayDistance,
      isWithinFreeRadius: false,
      chargeableMiles: oneWayDistance - config.freeRadiusMiles,
      mileageCost: 0,
      isOvernightTriggered: true,
      overnightCost: 0,
      isIslandOrFerry: !!coords.isIsland,
      islandSurcharge: 0,
      totalTravelExpense: 0,
      isOverseasOrMaxDistance: true,
      explanationText: `Distance exceeds standard ${config.maxBookingRadiusMiles}-mile radius (${oneWayDistance} miles). Submitted as a Bespoke Expedition Enquiry for Spud to review personally.`,
      matchedLocationName: coords.name
    };
  }

  // Zone 1: Free Radius Check (e.g. <= 50 miles)
  if (oneWayDistance <= config.freeRadiusMiles) {
    return {
      distanceMiles: oneWayDistance,
      isWithinFreeRadius: true,
      chargeableMiles: 0,
      mileageCost: 0,
      isOvernightTriggered: false,
      overnightCost: 0,
      isIslandOrFerry: !!coords.isIsland,
      islandSurcharge: coords.isIsland ? config.islandFerrySurcharge : 0,
      totalTravelExpense: coords.isIsland ? config.islandFerrySurcharge : 0,
      isOverseasOrMaxDistance: false,
      explanationText: `Included for FREE (Venue is ${oneWayDistance} miles from Spud's base, within the ${config.freeRadiusMiles}-mile free travel radius).`,
      matchedLocationName: coords.name
    };
  }

  // Zone 2 & 3: Distance beyond free radius
  const chargeableOneWay = oneWayDistance - config.freeRadiusMiles;
  const multiplier = config.chargeType === 'return' ? 2 : 1;
  const totalChargeableMiles = chargeableOneWay * multiplier;
  const mileageCost = Math.round(totalChargeableMiles * config.costPerMileAboveFree);

  // Overnight check (e.g. > 120 miles)
  const isOvernightTriggered = config.enableOvernightStay && (oneWayDistance >= config.overnightThresholdMiles);
  const overnightCost = isOvernightTriggered ? config.overnightFee : 0;

  // Island ferry surcharge check
  const isIsland = !!coords.isIsland;
  const islandSurcharge = isIsland ? config.islandFerrySurcharge : 0;

  const totalTravelExpense = mileageCost + overnightCost + islandSurcharge;

  let breakdownParts = [
    `£${mileageCost} mileage (${totalChargeableMiles} chargeable miles @ £${config.costPerMileAboveFree.toFixed(2)}/mi)`
  ];
  if (isOvernightTriggered) {
    breakdownParts.push(`£${overnightCost} overnight stay allowance (> ${config.overnightThresholdMiles} miles)`);
  }
  if (isIsland) {
    breakdownParts.push(`£${islandSurcharge} island ferry transit surcharge`);
  }

  const explanationText = `${oneWayDistance} miles from base (${config.freeRadiusMiles} miles free). Additional expenses: ${breakdownParts.join(' + ')}.`;

  return {
    distanceMiles: oneWayDistance,
    isWithinFreeRadius: false,
    chargeableMiles: totalChargeableMiles,
    mileageCost,
    isOvernightTriggered,
    overnightCost,
    isIslandOrFerry: isIsland,
    islandSurcharge,
    totalTravelExpense,
    isOverseasOrMaxDistance: false,
    explanationText,
    matchedLocationName: coords.name
  };
}
