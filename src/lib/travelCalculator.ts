import { TravelExpensesConfig } from '@/types/spud';
import { initialTravelConfig } from '@/lib/initialData';

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

  // Highlands, Inverness & Moray
  'IV': { lat: 57.4778, lng: -4.2247, name: 'Inverness & Scottish Highlands' },
  'IV1': { lat: 57.4778, lng: -4.2247, name: 'Inverness City Centre' },
  'IV2': { lat: 57.4600, lng: -4.1900, name: 'Inverness East / Culloden' },
  'IV3': { lat: 57.4800, lng: -4.2500, name: 'Inverness West' },
  'IV4': { lat: 57.4800, lng: -4.4600, name: 'Beauly / Muir of Ord' },
  'IV5': { lat: 57.4600, lng: -4.3800, name: 'Kirkhill' },
  'IV6': { lat: 57.5400, lng: -4.5000, name: 'Strathpeffer' },
  'IV7': { lat: 57.5800, lng: -4.3500, name: 'Culbokie / Black Isle' },
  'IV8': { lat: 57.5700, lng: -4.2500, name: 'Munlochy' },
  'IV9': { lat: 57.5900, lng: -4.2000, name: 'Avoch' },
  'IV10': { lat: 57.5800, lng: -4.1300, name: 'Fortrose / Rosemarkie' },
  'IV11': { lat: 57.6900, lng: -4.0900, name: 'Cromarty' },
  'IV12': { lat: 57.5800, lng: -3.8700, name: 'Nairn & Cawdor Castle' },
  'IV13': { lat: 57.3400, lng: -3.9800, name: 'Tomatin / Findhorn Valley' },
  'IV14': { lat: 57.5900, lng: -4.5400, name: 'Strathpeffer / Castle Leod' },
  'IV15': { lat: 57.6000, lng: -4.4300, name: 'Dingwall' },
  'IV16': { lat: 57.6900, lng: -4.3200, name: 'Alness / Foulis Castle' },
  'IV17': { lat: 57.7100, lng: -4.2500, name: 'Invergordon' },
  'IV18': { lat: 57.7800, lng: -4.0000, name: 'Tain' },
  'IV19': { lat: 57.8100, lng: -3.8500, name: 'Fearn / Portmahomack' },
  'IV20': { lat: 57.7300, lng: -4.0800, name: 'Balintore' },
  'IV21': { lat: 57.7300, lng: -5.6900, name: 'Gairloch / Wester Ross' },
  'IV22': { lat: 57.7800, lng: -5.3500, name: 'Aultbea / Poolewe' },
  'IV23': { lat: 57.8900, lng: -5.1600, name: 'Dundonnell' },
  'IV24': { lat: 57.8900, lng: -4.3300, name: 'Ardgay / Bonar Bridge' },
  'IV25': { lat: 57.9000, lng: -4.0300, name: 'Dornoch / Dornoch Castle' },
  'IV26': { lat: 57.9000, lng: -5.1600, name: 'Ullapool' },
  'IV27': { lat: 58.4400, lng: -4.7500, name: 'Lairg / Durness' },
  'IV28': { lat: 58.0100, lng: -3.9400, name: 'Golspie / Dunrobin Castle' },
  'IV30': { lat: 57.6500, lng: -3.3200, name: 'Elgin' },
  'IV31': { lat: 57.7100, lng: -3.2800, name: 'Lossiemouth' },
  'IV32': { lat: 57.6500, lng: -3.1000, name: 'Fochabers' },
  'IV36': { lat: 57.6100, lng: -3.6200, name: 'Forres & Brodie Castle' },
  'IV40': { lat: 57.2750, lng: -5.5130, name: 'Eilean Donan Castle / Kyle' },
  'IV41': { lat: 57.2500, lng: -5.8500, isIsland: true, name: 'Isle of Skye (Broadford)' },
  'IV42': { lat: 57.2200, lng: -5.9900, isIsland: true, name: 'Isle of Skye (Sleat)' },
  'IV43': { lat: 57.3000, lng: -6.1500, isIsland: true, name: 'Isle of Skye (Carbost / Talisker)' },
  'IV44': { lat: 57.3200, lng: -6.2500, isIsland: true, name: 'Isle of Skye (Struan)' },
  'IV45': { lat: 57.3800, lng: -6.3200, isIsland: true, name: 'Isle of Skye (Bracadale)' },
  'IV47': { lat: 57.3800, lng: -6.4800, isIsland: true, name: 'Isle of Skye (Dunvegan)' },
  'IV49': { lat: 57.2200, lng: -5.7300, isIsland: true, name: 'Isle of Skye (Kyleakin)' },
  'IV51': { lat: 57.4120, lng: -6.1960, isIsland: true, name: 'Isle of Skye (Portree)' },
  'IV52': { lat: 57.5800, lng: -6.2500, isIsland: true, name: 'Isle of Skye (Uig)' },
  'IV53': { lat: 57.3500, lng: -6.4000, isIsland: true, name: 'Isle of Skye (Staffin)' },
  'IV54': { lat: 57.4100, lng: -5.6200, name: 'Strathcarron / Applecross' },
  'IV55': { lat: 57.4470, lng: -6.6570, isIsland: true, name: 'Isle of Skye (Dunvegan Castle)' },
  'IV56': { lat: 57.5100, lng: -6.4500, isIsland: true, name: 'Isle of Skye (Edinbane)' },
  'IV63': { lat: 57.3300, lng: -4.4800, name: 'Drumnadrochit / Loch Ness' },

  // Badenoch, Strathspey, Aviemore & Perthshire
  'PH': { lat: 57.1955, lng: -3.8350, name: 'Aviemore & Cairngorms Highlands' },
  'PH1': { lat: 56.3950, lng: -3.4308, name: 'Perth City Centre' },
  'PH2': { lat: 56.3950, lng: -3.4000, name: 'Perth East / Scone Palace' },
  'PH3': { lat: 56.2800, lng: -3.7000, name: 'Auchterarder / Gleneagles' },
  'PH4': { lat: 56.3300, lng: -3.6500, name: 'Blackford' },
  'PH5': { lat: 56.3700, lng: -3.8300, name: 'Crieff' },
  'PH6': { lat: 56.4000, lng: -3.9800, name: 'Comrie' },
  'PH7': { lat: 56.3500, lng: -3.7500, name: 'Crieff & Muthill' },
  'PH8': { lat: 56.5600, lng: -3.5900, name: 'Dunkeld & Birnam' },
  'PH9': { lat: 56.6500, lng: -3.6500, name: 'Ballinluig / Logierait' },
  'PH10': { lat: 56.5900, lng: -3.3400, name: 'Blairgowrie' },
  'PH11': { lat: 56.6800, lng: -3.1500, name: 'Alyth' },
  'PH12': { lat: 56.6600, lng: -3.0500, name: 'Meigle' },
  'PH13': { lat: 56.5100, lng: -3.2700, name: 'Coupar Angus' },
  'PH14': { lat: 56.4400, lng: -3.2300, name: 'Inchture' },
  'PH15': { lat: 56.6210, lng: -3.8710, name: 'Aberfeldy / Castle Menzies' },
  'PH16': { lat: 56.7040, lng: -3.7300, name: 'Pitlochry & Atholl Palace' },
  'PH17': { lat: 56.6800, lng: -4.3000, name: 'Rannoch / Kinloch Rannoch' },
  'PH18': { lat: 56.7640, lng: -3.8600, name: 'Blair Atholl / Blair Castle' },
  'PH19': { lat: 56.9300, lng: -4.2400, name: 'Dalwhinnie' },
  'PH20': { lat: 57.0600, lng: -4.1200, name: 'Newtonmore & Laggan' },
  'PH21': { lat: 57.0800, lng: -4.0500, name: 'Kingussie & Insh' },
  'PH22': { lat: 57.1955, lng: -3.8350, name: 'Aviemore & Cairngorms' },
  'PH221UJ': { lat: 57.1955, lng: -3.8350, name: 'Aviemore, Highlands (Base)' },
  'PH23': { lat: 57.2800, lng: -3.8100, name: 'Carrbridge & Dulnain Bridge' },
  'PH24': { lat: 57.2480, lng: -3.7500, name: 'Boat of Garten' },
  'PH25': { lat: 57.2650, lng: -3.6500, name: 'Nethy Bridge' },
  'PH26': { lat: 57.3300, lng: -3.6100, name: 'Grantown-on-Spey' },
  'PH30': { lat: 56.7600, lng: -4.6800, name: 'Corrour' },
  'PH31': { lat: 56.8900, lng: -4.8300, name: 'Roy Bridge' },
  'PH32': { lat: 57.0700, lng: -4.6800, name: 'Fort Augustus / Loch Ness' },
  'PH33': { lat: 56.8198, lng: -5.1052, name: 'Fort William & Ben Nevis' },
  'PH34': { lat: 56.9000, lng: -4.9600, name: 'Spean Bridge' },
  'PH35': { lat: 57.0700, lng: -4.8000, name: 'Invergarry' },
  'PH36': { lat: 56.7400, lng: -5.7900, name: 'Acharacle / Ardnamurchan' },
  'PH37': { lat: 56.8700, lng: -5.4400, name: 'Glenfinnan Monument' },
  'PH38': { lat: 56.8700, lng: -5.6700, name: 'Lochailort' },
  'PH39': { lat: 56.9100, lng: -5.8400, name: 'Arisaig' },
  'PH40': { lat: 56.9700, lng: -5.8200, name: 'Morar' },
  'PH41': { lat: 57.0050, lng: -5.8270, name: 'Mallaig' },
  'PH49': { lat: 56.6800, lng: -5.0000, name: 'Glencoe & Ballachulish' },
  'PH50': { lat: 56.7100, lng: -4.9600, name: 'Kinlochleven' },

  // Speyside, Royal Deeside & Grampian
  'AB34': { lat: 57.0700, lng: -2.7800, name: 'Aboyne & Royal Deeside' },
  'AB35': { lat: 57.0060, lng: -3.3980, name: 'Braemar / Balmoral Castle' },
  'AB36': { lat: 57.1800, lng: -3.0500, name: 'Strathdon' },
  'AB37': { lat: 57.3400, lng: -3.3800, name: 'Ballindalloch Castle & Glenlivet' },
  'AB38': { lat: 57.4700, lng: -3.2200, name: 'Aberlour & Speyside Distilleries' },
  'AB55': { lat: 57.5400, lng: -2.9600, name: 'Keith & Strathisla' },

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

// Popular Named Scottish Venues & Towns Coordinates
const NAMED_VENUE_COORDINATES: Record<string, { lat: number; lng: number; isIsland?: boolean; name: string }> = {
  // Local Badenoch & Strathspey (Spud's Immediate Catchment)
  'aviemore': { lat: 57.1955, lng: -3.8350, name: 'Aviemore, Cairngorms' },
  'high burnside': { lat: 57.1955, lng: -3.8350, name: 'High Burnside, Aviemore' },
  'lodge lane': { lat: 57.1955, lng: -3.8350, name: 'Lodge Lane, Aviemore' },
  'coylumbridge': { lat: 57.1800, lng: -3.7900, name: 'Coylumbridge / Cairngorm Road' },
  'rothiemurchus': { lat: 57.1700, lng: -3.8300, name: 'Rothiemurchus Estate' },
  'inshriach': { lat: 57.1300, lng: -3.8800, name: 'Inshriach, Speyside' },
  'kincraig': { lat: 57.1300, lng: -3.9300, name: 'Kincraig / Loch Insh' },
  'loch insh': { lat: 57.1300, lng: -3.9300, name: 'Loch Insh Watersports' },
  'insh': { lat: 57.1100, lng: -3.9500, name: 'Insh Village' },
  'kingussie': { lat: 57.0800, lng: -4.0500, name: 'Kingussie, Badenoch' },
  'newtonmore': { lat: 57.0600, lng: -4.1200, name: 'Newtonmore, Badenoch' },
  'laggan': { lat: 57.0100, lng: -4.2700, name: 'Laggan / Strathmashie' },
  'dalwhinnie': { lat: 56.9300, lng: -4.2400, name: 'Dalwhinnie Distillery' },
  'boat of garten': { lat: 57.2480, lng: -3.7500, name: 'Boat of Garten (Osprey Village)' },
  'carrbridge': { lat: 57.2800, lng: -3.8100, name: 'Carrbridge (Landmark Forest)' },
  'dulnain bridge': { lat: 57.2900, lng: -3.6700, name: 'Dulnain Bridge' },
  'nethy bridge': { lat: 57.2650, lng: -3.6500, name: 'Nethy Bridge' },
  'grantown': { lat: 57.3300, lng: -3.6100, name: 'Grantown-on-Spey' },
  'grantown-on-spey': { lat: 57.3300, lng: -3.6100, name: 'Grantown-on-Spey' },
  'cairngorms': { lat: 57.1983, lng: -3.8291, name: 'Cairngorms National Park' },
  'glenmore': { lat: 57.1700, lng: -3.7000, name: 'Glenmore / Loch Morlich' },
  'loch morlich': { lat: 57.1700, lng: -3.7000, name: 'Loch Morlich Beach' },
  'cairngorm mountain': { lat: 57.1330, lng: -3.6700, name: 'Cairngorm Mountain' },
  'tomatin': { lat: 57.3400, lng: -3.9800, name: 'Tomatin / Findhorn' },
  'moy': { lat: 57.3800, lng: -4.0500, name: 'Moy Estate' },
  'daviot': { lat: 57.4200, lng: -4.1200, name: 'Daviot / Strathnairn' },

  // Inverness, Moray & Loch Ness
  'inverness': { lat: 57.4778, lng: -4.2247, name: 'Inverness City' },
  'culloden': { lat: 57.4780, lng: -4.0950, name: 'Culloden Battlefield' },
  'nairn': { lat: 57.5800, lng: -3.8700, name: 'Nairn Coast' },
  'cawdor castle': { lat: 57.5240, lng: -3.9260, name: 'Cawdor Castle, Nairn' },
  'brodie castle': { lat: 57.5980, lng: -3.7060, name: 'Brodie Castle, Forres' },
  'forres': { lat: 57.6100, lng: -3.6200, name: 'Forres' },
  'elgin': { lat: 57.6500, lng: -3.3200, name: 'Elgin & Cathedral' },
  'lossiemouth': { lat: 57.7100, lng: -3.2800, name: 'Lossiemouth' },
  'loch ness': { lat: 57.3229, lng: -4.4244, name: 'Loch Ness / Urquhart Castle' },
  'urquhart castle': { lat: 57.3240, lng: -4.4420, name: 'Urquhart Castle, Drumnadrochit' },
  'drumnadrochit': { lat: 57.3300, lng: -4.4800, name: 'Drumnadrochit, Loch Ness' },
  'fort augustus': { lat: 57.1450, lng: -4.6800, name: 'Fort Augustus, Loch Ness' },

  // Famous Scottish Castles & Wedding Venues
  'dundas castle': { lat: 55.9890, lng: -3.4020, name: 'Dundas Castle, South Queensferry' },
  'edinburgh castle': { lat: 55.9486, lng: -3.1999, name: 'Edinburgh Castle' },
  'stirling castle': { lat: 56.1200, lng: -3.9400, name: 'Stirling Castle' },
  'eilean donan castle': { lat: 57.2750, lng: -5.5130, name: 'Eilean Donan Castle, Dornie' },
  'blair castle': { lat: 56.7640, lng: -3.8600, name: 'Blair Castle, Pitlochry' },
  'glamis castle': { lat: 56.6430, lng: -2.8880, name: 'Glamis Castle, Angus' },
  'culzean castle': { lat: 55.3547, lng: -4.7890, name: 'Culzean Castle, Ayrshire' },
  'inveraray castle': { lat: 56.2330, lng: -5.0740, name: 'Inveraray Castle, Argyll' },
  'gretna green': { lat: 54.9960, lng: -3.0720, name: 'Gretna Green Famous Blacksmiths Shop' },
  'loch lomond': { lat: 56.0720, lng: -4.4360, name: 'Loch Lomond' },
  'isle of skye': { lat: 57.4120, lng: -6.1960, isIsland: true, name: 'Isle of Skye' }
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
  config?: Partial<TravelExpensesConfig>
): TravelCostResult {
  const safeConfig: TravelExpensesConfig = {
    ...initialTravelConfig,
    ...(config || {})
  };

  const cleanPostcode = (venuePostcode || '').trim().toUpperCase();
  const lowerText = `${cleanPostcode} ${venueName || ''} ${venueAddress || ''}`.toLowerCase();

  // Check if explicitly overseas / international (e.g. USA, Canada, Germany, Netherlands, France, Spain, Australia, etc.)
  const overseasKeywords = [
    'usa', 'united states', 'america', 'netherlands', 'holland', 'germany', 'deutschland', 
    'france', 'spain', 'italy', 'dubai', 'uae', 'canada', 'australia', 'switzerland', 
    'austria', 'singapore', 'new zealand', 'japan', 'international', 'overseas'
  ];
  const isExplicitlyOverseas = overseasKeywords.some(keyword => lowerText.includes(keyword));

  const targetCoords = findCoordinatesForLocation(venuePostcode, venueName, venueAddress);

  if (isExplicitlyOverseas || (!targetCoords && venuePostcode && venuePostcode.length > 0 && !venuePostcode.match(/^[A-Z]{1,2}[0-9]/i))) {
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

  // Default coordinate fallback if unrecognised UK postcode (defaults to Spud's base location)
  const coords = targetCoords || {
    lat: safeConfig.baseLatitude,
    lng: safeConfig.baseLongitude,
    name: venuePostcode || venueName || 'Local / Highland Venue'
  };

  const oneWayDistance = calculateHaversineDistanceMiles(
    safeConfig.baseLatitude,
    safeConfig.baseLongitude,
    coords.lat,
    coords.lng
  );

  // Check if distance exceeds Spud's maximum radius
  if (oneWayDistance > safeConfig.maxBookingRadiusMiles) {
    return {
      distanceMiles: oneWayDistance,
      isWithinFreeRadius: false,
      chargeableMiles: Math.max(0, oneWayDistance - safeConfig.freeRadiusMiles),
      mileageCost: 0,
      isOvernightTriggered: true,
      overnightCost: 0,
      isIslandOrFerry: !!coords.isIsland,
      islandSurcharge: 0,
      totalTravelExpense: 0,
      isOverseasOrMaxDistance: true,
      explanationText: `Distance exceeds standard ${safeConfig.maxBookingRadiusMiles}-mile radius (${oneWayDistance} miles). Submitted as a Bespoke Expedition Enquiry for Spud to review personally.`,
      matchedLocationName: coords.name
    };
  }

  // Zone 1: Free Radius Check (e.g. <= 50 miles)
  if (oneWayDistance <= safeConfig.freeRadiusMiles) {
    return {
      distanceMiles: oneWayDistance,
      isWithinFreeRadius: true,
      chargeableMiles: 0,
      mileageCost: 0,
      isOvernightTriggered: false,
      overnightCost: 0,
      isIslandOrFerry: !!coords.isIsland,
      islandSurcharge: coords.isIsland ? safeConfig.islandFerrySurcharge : 0,
      totalTravelExpense: coords.isIsland ? safeConfig.islandFerrySurcharge : 0,
      isOverseasOrMaxDistance: false,
      explanationText: `Included for FREE (Venue is ${oneWayDistance} miles from Spud's base, within the ${safeConfig.freeRadiusMiles}-mile free travel radius).`,
      matchedLocationName: coords.name
    };
  }

  // Check if distance falls within any intermediate Custom Travel Zones
  const matchingCustomZone = (safeConfig.customZones || []).find(
    (zone) => oneWayDistance >= zone.minMiles && oneWayDistance <= zone.maxMiles
  );

  const effectiveRate = matchingCustomZone?.ratePerMile !== undefined 
    ? matchingCustomZone.ratePerMile 
    : safeConfig.costPerMileAboveFree;

  const fixedZoneSurcharge = matchingCustomZone?.fixedSurcharge || 0;

  // Distance beyond free radius
  const chargeableOneWay = Math.max(0, oneWayDistance - safeConfig.freeRadiusMiles);
  const multiplier = safeConfig.chargeType === 'return' ? 2 : 1;
  const totalChargeableMiles = chargeableOneWay * multiplier;
  const mileageCost = Math.round(totalChargeableMiles * effectiveRate);

  // Overnight check (checks custom zone override or global threshold)
  let isOvernightTriggered = false;
  let overnightCost = 0;

  if (matchingCustomZone?.enableOvernight !== undefined) {
    if (matchingCustomZone.enableOvernight) {
      isOvernightTriggered = true;
      overnightCost = matchingCustomZone.overnightFee ?? safeConfig.overnightFee;
    }
  } else if (safeConfig.enableOvernightStay && (oneWayDistance >= safeConfig.overnightThresholdMiles)) {
    isOvernightTriggered = true;
    overnightCost = safeConfig.overnightFee;
  }

  // Island ferry surcharge check
  const isIsland = !!coords.isIsland;
  const islandSurcharge = isIsland ? safeConfig.islandFerrySurcharge : 0;

  const totalTravelExpense = mileageCost + overnightCost + fixedZoneSurcharge + islandSurcharge;

  let breakdownParts = [
    `£${mileageCost} mileage (${totalChargeableMiles} chargeable miles @ £${effectiveRate.toFixed(2)}/mi)`
  ];
  if (fixedZoneSurcharge > 0) {
    breakdownParts.push(`£${fixedZoneSurcharge} ${matchingCustomZone?.name || 'zone'} surcharge`);
  }
  if (isOvernightTriggered) {
    breakdownParts.push(`£${overnightCost} overnight stay allowance`);
  }
  if (isIsland) {
    breakdownParts.push(`£${islandSurcharge} island ferry transit surcharge`);
  }

  const zoneLabel = matchingCustomZone ? ` (${matchingCustomZone.name})` : '';
  const explanationText = `${oneWayDistance} miles from base${zoneLabel} (${safeConfig.freeRadiusMiles} miles free). Additional expenses: ${breakdownParts.join(' + ')}.`;

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
