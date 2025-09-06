import { ENDPOINT, MAX_STATION_REQUEST } from "../../utils/defaults";
import { convertCoord } from "../../utils/utils";
import { Station } from "./StationPriceManager.types";
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
    // ...oldStations,
    // ...newStations.filter((newStation) => oldStations.includes(newStation)),
    ...newStations,
  ];
  updateStationsCache(stations);

  readInProgress = false;
  return stations;
}

// getAllStationsFromCache will get all stations from local storage.
function getAllStationsFromCache(): Station[] {
  const allStations: Station[] =
    JSON.parse(localStorage.getItem(defaults.STATIONS_CACHE) ?? "[]") || [];

  console.debug(
    `[STATIONS] getting stations from cache, ${allStations.length} found`
  );
  return filterExpiredStations(allStations);
}

// filterExpiredStations filters out all stations that have exceeded the time to live.
function filterExpiredStations(stations: Station[]): Station[] {
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
): Promise<Station[]> {
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
function updateStationsCache(stations: Station[]) {
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
  siteIds: string[]
): Promise<[number, number][]> {
  while (readInProgress) {
    console.debug("[PRICES] awaiting timeout...");
    return new Promise((resolve) => {
      setTimeout(async () => {
        readInProgress = false;
        resolve(await getFuelPrices(fuelType, siteIds));
      }, 1_000);
    });
  }
  readInProgress = true;
  setTimeout(async () => {
    readInProgress = false;
  }, 2_000);
  console.debug(`[PRICES] ${siteIds.length} sites requested`);

  petrolType = fuelType;

  const allCachedPrices = getPricesFromCache();
  const filteredCachedPrices = allCachedPrices.filter(
    (price) =>
      price.Type == petrolType &&
      siteIds.some((siteId) => siteId == price.SiteId)
  );
  console.debug(
    `[PRICES] ${filteredCachedPrices.length} matching sites found in cache`
  );

  const cachedPricesIds = filteredCachedPrices.map((price) => price.SiteId);
  const missingPriceIds = siteIds.filter(
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
