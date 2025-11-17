import { ENDPOINT, MAX_STATION_REQUEST } from "../../utils/defaults";
import { convertCoord } from "../../utils/utils";
import {
  FuelPrice,
  MapSector,
  StationDetails,
  StationInterface,
} from "./StationPriceManager.types";
import * as defaults from "./StationPriceManager.defaults";

// allStations is all stations that have been filtered, and that haven't expired in the cache.
const allStations = [];
// allPrices is all prices that haven't expired in the cache.
const allPrices = [];
// stations refers to the subset of filtered stations.
const stations = [];
// filters is the currently applied filters, such as petrolType,
const filters: any = {
  // PetrolType: (station: Station): boolean => {
  //   return station.FuelIds === petrolType;
  // },
};

var petrolType = 0;

var readInProgress = false;

// getAllStations returns all requested stations.
export async function updateAllStations() {
  while (readInProgress) {
    console.debug("[STATIONS] awaiting timeout...");
    return new Promise((resolve) => {
      setTimeout(async () => {
        resolve(await updateAllStations());
      }, 1_000);
    });
  }
  readInProgress = true;

  const oldStations = getAllStationsFromCache();
  const oldStationIds = oldStations.map((station) => station.SiteId);
  const newStations = await getAllStationsFromAPI(oldStationIds);
  const stations = [
    ...oldStations,
    ...newStations.filter((newStation) => oldStations.includes(newStation)),
    // ...newStations,
  ];
  updateStationsCache(stations);

  readInProgress = false;
  return stations;
}

// getAllStationsFromCache will get all stations from local storage.
function getAllStationsFromCache(): StationInterface[] {
  const allStations: StationInterface[] =
    JSON.parse(localStorage.getItem(defaults.STATIONS_CACHE) ?? "[]") || [];

  console.debug(
    `[STATIONS] getting stations from cache, ${allStations.length} found`
  );
  return filterExpiredStations(allStations);
}

// filterExpiredStations filters out all stations that have exceeded the time to live.
function filterExpiredStations(
  stations: StationInterface[]
): StationInterface[] {
  const filteredStations = stations.filter((station) => {
    return Date.now() < station.Fetched;
  });
  console.debug(
    `[STATIONS] filtering stations from cache, ${filteredStations.length} remain`
  );
  return filteredStations;
}

// getAllStationsFromAPI will get all station information from the API.
async function getAllStationsFromAPI(
  knownSiteIds: number[]
): Promise<StationInterface[]> {
  let json: any[];
  try {
    const res = await fetch(`${ENDPOINT}${defaults.STATIONS_API}`);
    if (res.status != 200) {
      window.alert("site data not found.");
      return [];
    }
    json = await res.json();
  } catch (error) {
    console.error(`error while fetching sites: ${error}`);
    return [];
  }

  // TODO: change this to the station type.
  const modifiedJson = json.map((station: any) => {
    const coord = [station.Lng, station.Lat];
    // const coord = convertCoord([station.Lng, station.Lat]);

    return {
      ...station,
      Lng: coord.at(0),
      Lat: coord.at(1),
      Fetched: Date.now() + defaults.STATIONS_TIME_TO_LIVE,
    };
  });

  console.debug(
    `[STATIONS] getting stations from API, ${modifiedJson.length} stations fetched`
  );
  return modifiedJson;
}

// updateStationsCache will populate the cache with the new information from the API.
function updateStationsCache(stations: StationInterface[]) {
  localStorage.setItem(defaults.STATIONS_CACHE, JSON.stringify(stations));
  console.debug(
    `[STATIONS] updating stations in cache, ${stations.length} items stored`
  );
}

// updateFilteredStations will update the filteredStations.
function updateFilteredStations() {}

// getFilteredStations will return the filteredStations.
export async function getFilteredStations() {}

// getFuelPrices
export async function getFuelPrices(
  fuelType: number,
  stationIDs: number[]
): Promise<[number, number][]> {
  return convertFuelPrice(getFuelPricesFromSectors(fuelType, stationIDs));

  while (readInProgress) {
    console.debug("[PRICES] awaiting timeout...");
    return new Promise((resolve) => {
      setTimeout(async () => {
        readInProgress = false;
        resolve(await getFuelPrices(fuelType, stationIDs));
      }, 1_000);
    });
  }
  readInProgress = true;
  setTimeout(async () => {
    readInProgress = false;
  }, 2_000);
  console.debug(`[PRICES] ${stationIDs.length} sites requested`);

  petrolType = fuelType;

  const allCachedPrices = getPricesFromCache();
  const filteredCachedPrices = allCachedPrices.filter(
    (price) =>
      price.Type == petrolType &&
      stationIDs.some((siteId) => siteId == price.SiteId)
  );
  console.debug(
    `[PRICES] ${filteredCachedPrices.length} matching sites found in cache`
  );

  const cachedPricesIds = filteredCachedPrices.map((price) => price.SiteId);
  const missingPriceIds = stationIDs.filter(
    (siteId) => !cachedPricesIds.some((cachedSiteId) => cachedSiteId == siteId)
  );

  if (missingPriceIds.length <= 0) {
    console.debug(`[PRICES] skipping API fetch.`);
    readInProgress = false;
    return uncachePrices(filteredCachedPrices);
  }

  // if (missingPriceIds.length >= MAX_STATION_REQUEST) {
  //   readInProgress = false;
  //   console.warn(
  //     `[PRICES] request body length exceeds ${MAX_STATION_REQUEST}.`
  //   );
  //   window.alert("Search area too large, try zooming in.");
  //   return uncachePrices(filteredCachedPrices);
  // }

  // TODO: paginate the request
  const newApiPrices = await getPricesFromAPI(missingPriceIds);

  const newPrices = cachePrices(newApiPrices);
  updatePricesCache([...allCachedPrices, ...newPrices]);
  readInProgress = false;

  const allPrices = [...filteredCachedPrices, ...newPrices];
  return uncachePrices(allPrices);
}

function uncachePrices(prices: any[]): any {
  const allPrices = {};
  prices.forEach((price) => {
    allPrices[price.SiteId] = price.Price;
  });
  return allPrices;
}

function convertFuelPrice(prices: FuelPrice[]): any {
  const allPrices: any = {};
  prices.forEach((price) => {
    allPrices[price.SiteID] = price.Price;
  });
  return allPrices;
}

function cachePrices(prices: any): any[] {
  const pack = Array.from(Object.entries(prices)).map((entry) => {
    const [siteId, price] = entry;
    return {
      SiteId: siteId,
      Price: price,
      Type: petrolType,
      Fetched: Date.now() + defaults.PRICES_TIME_TO_LIVE,
    };
  });
  return pack;
}

// getPricesFromCache will get prices from the local storage.
// TODO: change any for prices type.
function getPricesFromCache(): any[] {
  const allPrices: any[] =
    JSON.parse(localStorage.getItem(defaults.PRICES_CACHE) ?? "[]") || [];

  console.debug(
    `[PRICES] getting prices from cache, ${allPrices.length} found`
  );
  return filterExpiredPrices(allPrices);
}

// filterExpiredPrices will remove prices that have exceeded the time to live.
// TODO: change any for prices type.
function filterExpiredPrices(prices: any[]): any[] {
  const filteredPrices = prices.filter((price) => {
    return Date.now() < price.Fetched;
  });
  console.debug(
    `[PRICES] filtering prices from cache, ${filteredPrices.length} remain`
  );
  return filteredPrices;
}

// getPricesFromAPI will get refreshed prices from the API.
// TODO: change any for prices type.
async function getPricesFromAPI(
  siteIds: string[],
  timeout: number = 5_000
): Promise<[number, number][]> {
  const req = fetch(
    `${ENDPOINT}${defaults.PRICES_API}?fuelType=${petrolType}`,
    {
      method: "POST",
      body: JSON.stringify(siteIds),
    }
  );

  if (siteIds.length <= 0) {
    return [];
  }

  const request = new Promise<Response>((accept, reject) => {
    let accepted = false;

    setTimeout(() => {
      if (accepted) return;

      window.alert("Prices request timed out, try again later.");
      reject();
      return [];
    }, timeout);

    req.then((data) => {
      accepted = true;
      accept(data);
    });
  });

  const res = await request;
  if (res.status != 200) {
    window.alert("error while handling site prices. please try again later");
    return [];
  }

  const prices = await res.json();
  if (!prices || prices.length <= 0) return [];
  // const priceData = prices.map((price: any) => {
  //   return { ...price, Fetched: Date.now() + defaults.PRICES_TIME_TO_LIVE };
  // });

  console.debug(
    `[PRICES] getting stations from API, ${
      Object.keys(prices).length
    } stations fetched`
  );

  const allPrices = [] as [number, number][];
  siteIds.forEach((siteid) => {
    allPrices[siteid] = prices[siteid] || 0;
  });

  return allPrices;
}

// updatePricesCache will update the prices in the local storage.
// TODO: change any for prices type.
function updatePricesCache(prices: any[]) {
  localStorage.setItem(defaults.PRICES_CACHE, JSON.stringify(prices));
  console.debug(
    `[PRICES] updating stations in cache, ${prices.length} items stored`
  );
}

// setPetrolType will update the petrol type.
export function setPetrolType(newType: number) {
  petrolType = newType;
}

function remapFuelPrice(id: number, o: any): FuelPrice {
  return {
    SiteID: id,
    // FuelID (id)
    FuelID: o.id,
    // CollectionMethod (c)
    CollectionMethod: o.c,
    // TransactionDateUTC (t)
    TransactionDateUTC: o.t,
    // Price (p)
    Price: o.p,
  };
}

function remapStationDetails(o: any): StationDetails {
  const fuelTypes = new Map<number, FuelPrice>();
  Array.from(Object.entries(o.t)).forEach(([k, v]: [string, any]) => {
    return fuelTypes.set(Number(k), remapFuelPrice(o.id, v));
  });
  return {
    // SiteID (id)
    SiteID: o.id,
    // Name (n)
    Name: o.n,
    // Lat (lt)
    Lat: o.lt,
    // Lng (lg)
    Lng: o.lg,
    // GooglePlaceID (gi)
    GooglePlaceID: o.gi,
    // Address (a)
    Address: o.a,
    // BrandID (b)
    BrandID: o.b,
    // Postcode (p)
    Postcode: o.p,
    // LastUpdated (u)
    LastUpdated: o.u,
    // FuelTypes (t)
    FuelTypes: fuelTypes,
  } as StationDetails;
}

const SectorDictionary = new Map<number, MapSector>();
const StationDictionary = new Map<number, StationDetails>();

function addSectorsToSectorStationMap(sectors: MapSector[]) {
  sectors.forEach((sector) => {
    SectorDictionary.set(sector.id, sector);
    Array.from(Object.entries(sector.st.s)).forEach(
      ([stationID, station]: [string, StationDetails]) => {
        StationDictionary.set(Number(stationID), remapStationDetails(station));
      }
    );
  });
}

function getStationDetails(stationIDs: number[]): StationDetails[] {
  const details = stationIDs
    .map((stationID) => StationDictionary.get(stationID))
    .filter((station) => station != undefined);

  return details;
}

function getFuelPricesFromSectors(
  fuelID: number,
  stationIDs: number[]
): FuelPrice[] {
  const prices = getStationDetails(stationIDs)
    // .filter((station) => station.FuelTypes.has(fuelID))
    .map((station) => {
      return (
        station.FuelTypes.get(fuelID) ||
        ({ SiteID: station.SiteID, Price: 0 } as FuelPrice)
      );
    });

  return prices;
}

function getSectorsFromCache(): MapSector[] {
  const fetched = Number(localStorage.getItem("_sectors"));
  if (fetched > Date.now()) {
    return [];
  }

  // try the cache first!
  const json = localStorage.getItem("sectors");
  if (!json || json == "") {
    return [];
  }

  return JSON.parse(json);
}

function updateSectorsInCache(sectors: MapSector[]) {
  // try the cache first!
  const json = JSON.stringify(sectors);
  localStorage.setItem(
    "_sectors",
    String(Date.now() + defaults.STATIONS_TIME_TO_LIVE)
  );
  localStorage.setItem("sectors", json);
}

export async function getSectors(): Promise<MapSector[]> {
  let sectors: MapSector[];

  const maybeSectors = getSectorsFromCache();
  if (maybeSectors.length > 0) {
    return maybeSectors;
  }

  try {
    const res = await fetch(`${ENDPOINT}${defaults.SECTORS_API_V1}`);
    if (res.status != 200) {
      window.alert("sector data not found.");
      return [];
    }
    sectors = await res.json();
  } catch (error) {
    console.error(`error while fetching sectors: ${error}`);
    return [];
  }

  updateSectorsInCache(sectors);

  return sectors || [];
}

export async function getPricesFromSectors(
  SectorIDs: number[]
): Promise<MapSector[]> {
  const newSectors: MapSector[] = [];
  const sectors: MapSector[] = [];

  // get sectors from cache.
  const cached = SectorIDs.map((sectorID) =>
    SectorDictionary.get(sectorID)
  ).filter((sector) => sector != undefined);
  sectors.push(...cached);

  // get sectors from api.
  const uncached = SectorIDs.filter(
    (sectorID) => !SectorDictionary.has(sectorID)
  );
  if (uncached.length > 0) {
    try {
      const res = await fetch(
        `${ENDPOINT}${defaults.SECTORS_API_V1}?id=${uncached.join(",")}`
      );
      if (res.status != 200) {
        window.alert("sector data not found.");
        return [];
      }
      newSectors.push(...(await res.json()));
      newSectors.forEach((sector) => (sector.ft = Date.now()));
      // update cache.
      addSectorsToSectorStationMap(newSectors);

      // update sectors.
      sectors.push(...newSectors);
    } catch (error) {
      console.error(`error while fetching sectors: ${error}`);
      return [];
    }
  }

  console.log(
    `[SECTORS] ${cached.length} cached, and ${uncached.length} uncached sectors found. ${sectors.length} sectors found.`
  );

  return sectors;
}

export async function getStationsFromSectors(
  SectorIDs: number[]
): Promise<StationDetails[]> {
  const newSectors: MapSector[] = [];
  const sectors: MapSector[] = [];

  // get sectors from cache.
  const cached = SectorIDs.map((sectorID) =>
    SectorDictionary.get(sectorID)
  ).filter((sector) => sector != undefined);
  sectors.push(...cached);

  // get sectors from api.
  const uncached = SectorIDs.filter(
    (sectorID) => !SectorDictionary.has(sectorID)
  );
  if (uncached.length > 0) {
    try {
      const res = await fetch(
        `${ENDPOINT}${defaults.SECTORS_API_V1}?id=${uncached.join(",")}`
      );
      if (res.status != 200) {
        window.alert("sector data not found.");
        return [];
      }
      newSectors.push(...(await res.json()));
      newSectors.forEach((sector) => (sector.ft = Date.now()));
      // update cache.
      addSectorsToSectorStationMap(newSectors);

      // update sectors.
      sectors.push(...newSectors);
    } catch (error) {
      console.error(`error while fetching sectors: ${error}`);
      return [];
    }
  }

  console.log(
    `[SECTORS] ${cached.length} cached, and ${uncached.length} uncached sectors found. ${sectors.length} sectors found.`
  );

  const stations = sectors.reduce((reduced, sector) => {
    const values = Object.values(sector.st.s || {}).map(remapStationDetails);
    reduced.push(...values);
    return reduced;
  }, [] as StationDetails[]);

  return stations;
}
