import polyline from "polyline";
import { convertCoordFromLatLon, ObjectIsEmpty } from "./utils";
import { fromLonLat } from "ol/proj";
import { PROJECTION } from "./defaults";
import { parseLocation } from "australia-address-parser";

const ALTERNATIVES = true;

async function getRoutes(start, finish) {
  if (ObjectIsEmpty(start) || ObjectIsEmpty(finish)) return {};

  console.debug("[ROUTING] getting routes.");

  // submit to OSRM
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start.Lat},${start.Lng};${finish.Lat},${finish.Lng}?alternatives=${ALTERNATIVES}`
  );
  if (res.status != 200) {
    console.warn(`[ROUTING] unable to get data from OSRM, code:${res.status}`);
    return {};
  }
  return res.json();
}

export async function getRoutesBetweenPoints(start, finish) {
  if (ObjectIsEmpty(start) || ObjectIsEmpty(finish)) return [];

  const body = await getRoutes(start, finish);

  if (ObjectIsEmpty(body)) return [];

  // extract geometry
  const geometries = body["routes"] || [];

  // convert to routes
  const routes = geometries.map((route) => {
    const points = polyline
      .decode(route["geometry"])
      .map(convertCoordFromLatLon);
    return points;
  });

  // return routes
  return routes;
}

const GEOCODING_API = `https://nominatim.openstreetmap.org/search`;

export async function getCoordinatesOfAddress(address) {
  console.debug(`[ROUTING] getting geocoding result for ${address}.`);

  const locationData = parseLocation(address);

  const { streetNumber, street, streetType, suburb, state, postcode } =
    locationData;

  console.log(locationData);

  const unsafeParams = {
    state: `${state}`,
    postalcode: `${postcode}`,
    city: `${suburb}`,
    street: `${streetNumber} ${street} ${streetType || ""}`,
  };

  const paramString = Array.from(Object.entries(unsafeParams))
    .filter((entry) => {
      const [_, v] = entry;
      return v != "undefined" && !v.includes("undefined");
    })
    .map((entry, params) => {
      const [k, v] = entry;
      return `${k}=${v}`;
    })
    .join("&");

  if (!paramString) return {};

  console.log(locationData, unsafeParams, paramString);

  // submit to OSRM
  // const res = await fetch(
  //   `${GEOCODING_API}?format=json&country=australia&state=south australia&street=${address}`
  // );
  const res = await fetch(
    `${GEOCODING_API}?format=json&country=australia&${paramString}`
  );
  if (res.status != 200) {
    console.warn(
      `[ROUTING] unable to get data from geocoding service, code:${res.status} message:code:${res.statusText}`
    );
    return {};
  }
  return res.json();
}
