import polyline from "polyline";
import { ObjectIsEmpty } from "./utils";

const ALTERNATIVES = true;

export async function getWaypointsBetweenPoints(start, finish) {
  if (ObjectIsEmpty(start) || ObjectIsEmpty(finish)) return [];

  // submit to OSRM
  const res = await fetch(
    `http://router.project-osrm.org/route/v1/driving/${start.Lat},${start.Lng};${finish.Lat},${finish.Lng}`
  );
  if (res.status != 200) {
    console.warn(`unable to get data from OSRM, code:${res.status}`);
    return [];
  }
  const body = await res.json();

  // extract geometry
  const geometry = body["routes"][0]["geometry"];

  // convert to points
  const points = polyline.decode(geometry).map(([lat, lng]) => {
    return [lng, lat];
  });
  console.log(points);

  // return points
  return points;
}

export async function getRoutesBetweenPoints(start, finish) {
  if (ObjectIsEmpty(start) || ObjectIsEmpty(finish)) return [];

  console.log("getting routes.");

  // submit to OSRM
  const res = await fetch(
    `http://router.project-osrm.org/route/v1/driving/${start.Lat},${start.Lng};${finish.Lat},${finish.Lng}?alternatives=${ALTERNATIVES}`
  );
  if (res.status != 200) {
    console.warn(`unable to get data from OSRM, code:${res.status}`);
    return [];
  }
  const body = await res.json();

  // extract geometry
  const geometries = body["routes"];

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
