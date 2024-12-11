import polyline from "polyline";
import { ObjectIsEmpty } from "./utils";

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
    const points = polyline.decode(route["geometry"]).map(([lat, lng]) => {
      return [lng, lat];
    });
    return points;
  });

  // return routes
  return routes;
}
