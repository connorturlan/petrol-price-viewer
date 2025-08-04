import { Feature } from "ol";
import { Circle, Geometry, Point, Polygon } from "ol/geom";
import { fromLonLat, get, getPointResolution, transform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { ENDPOINT, PROJECTION } from "../../utils/defaults";
import { boundingExtent, containsCoordinate, containsExtent } from "ol/extent";
import { distance } from "ol/coordinate";
import { getDistance } from "ol/sphere";
import { convertCoord } from "../../utils/utils";

const ROUTING_STATION_COUNT = 3;

export const getSites = async (setLoading, setStations) => {
  setLoading(true);

  const res = await fetch(ENDPOINT + "/sites");
  if (res.status != 200) {
    window.alert("site data not found.");
    return;
  }
  const json = await res.json();

  const modifiedJson = json.map((station) => {
    const coord = convertCoord([station.Lng, station.Lat]);

    return { ...station, Lng: coord.at(0), Lat: coord.at(1) };
  });

  setStations(modifiedJson);

  setLoading(false);
};

export const updateLowestPrices = async (layer, stations, fuelType) => {
  const source = new VectorSource();
  layer.setSource(source);

  const lowestPrice = stations.reduce(
    (lowest, station) => (lowest.Price < station.Price ? lowest : station),
    stations[0]
  );

  const lowestStations = stations.filter(
    (station) => station.Price <= lowestPrice.Price
  );

  const features = lowestStations.map((station) => {
    const point = new Point([station.Lng, station.Lat]);

    let price = ((station.Price || 0) / 10).toFixed(1);

    return new Feature({
      geometry: point,
      siteid: station.SiteId,
      name: station.Name,
      price: price || "loading...",
      placeid: station.GPI,
    });
  });
  source.addFeatures(features);
};

export const updateStationsWithLowestPrice = async (layer) => {
  const source = layer.getSource();

  const features = source.getFeatures();

  features.forEach((feature) => {
    feature.set("isLowest", false);
  });

  const prices = features.map((feature) => Number(feature.get("price")));

  const lowestPrice = prices.reduce(
    (lowest, current) => Math.min(lowest, current),
    prices[0]
  );

  features.forEach((feature) => {
    feature.set("isLowest", feature.get("price") <= lowestPrice);
  });
};

function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

function lerpCoord(start, end, percent) {
  return [lerp(start[0], end[0], percent), lerp(start[1], end[1], percent)];
}

export function getFeaturesOnRoute(route, stations) {
  return stations.filter((site) => {
    const coord = [site.Lng, site.Lat];

    return route.some((waypoint, index) => {
      const start = waypoint;
      const end = index < route.length - 1 && route[index + 1];

      if (end && getDistance(start, end) > 500) {
        let iters = getDistance(start, end) / 100;
        for (let i = 0; i < iters; i++) {
          const point = lerpCoord(start, end, i / iters);

          if (getDistance(point, coord) < 200) {
            return true;
          }
        }
        return false;
      }

      return getDistance(start, coord) < 200;
    });
  });
}

const MAX_DISTANCE = 200; //m
const MAX_ITERATION = 500; //m
const LERP_STEP = 100; //m
const EARTH_RADIUS = 6_371_008.8;

function pointAtDistanceAndBearing(start, bearing, distance) {
  const point = new Point(start);
  const res = getPointResolution(PROJECTION, 1, start, "m");
  const dx = (distance * Math.cos(bearing)) / res;
  const dy = (distance * Math.sin(bearing)) / res;
  point.translate(dx, dy);
  return point.getCoordinates();
}

function getExtentCorners(start, end) {
  const [long1, lat1] = transform(start, PROJECTION, "EPSG:4326");
  const [long2, lat2] = transform(end, PROJECTION, "EPSG:4326");

  const ay = Math.sin(long2 - long1) * Math.cos(lat2);
  const ax =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(long2 - long1);
  const bearing = Math.atan2(ay, ax);

  const a = pointAtDistanceAndBearing(start, bearing + Math.PI, MAX_DISTANCE);
  const b = pointAtDistanceAndBearing(end, bearing + Math.PI, MAX_DISTANCE);
  return [start, end, b, a];
}

function getExtent(start, end) {
  return new boundingExtent(getExtentCorners(start, end));
}

function getBounds(start, end) {
  const poly = new Polygon([getExtentCorners(start, end)], "XY");
  return poly;
}

function isFeatureOnRoute(start, end, coord) {
  return getBounds(start, end).intersectsCoordinate(coord);
}

// DEBUG - used for getting route bounding extent features.
export function getDebugBoundingPath(route) {
  let features = route.slice(0, -1).map((waypoint, index) => {
    const start = waypoint;
    const end = index < route.length - 1 && route[index + 1];
    return new Feature({ geometry: getBounds(start, end) });
  });
  return features;
}

export function getCorners(route, stations) {
  let points = route.slice(0, -1).map((waypoint, index) => {
    const start = waypoint;
    const end = index < route.length - 1 && route[index + 1];
    return getBounds(start, end);
  });
  return points;
}

export function getFeaturesAvailableOnRoute(route, stations) {
  const points = stations.filter((site) => {
    const coord = [site.Lng, site.Lat];

    return route.slice(0, -1).some((waypoint, index) => {
      const start = waypoint;
      const end = index < route.length - 1 && route[index + 1];
      return isFeatureOnRoute(start, end, coord);
    });
  });
  return points;
}

export const setStationsOnRoute = (layer, onRoute) => {
  const source = layer.getSource();

  const features = onRoute.map((site) => {
    const point = new Point([site.Lng, site.Lat]);

    let price = ((site.Price || 0) / 10).toFixed(1);

    return new Feature({
      geometry: point,
      siteid: site.SiteId,
      name: site.Name,
      price: price || "loading...",
      placeid: site.GPI,
    });
  });

  console.debug(
    `[ROUTING] ${features.length}/${onRoute.length} features on route.`
  );

  // show some of the lowest prices.
  const lowestPrices = features.sort((a, b) => a.get("price") - b.get("price"));
  source.addFeatures(lowestPrices.slice(0, ROUTING_STATION_COUNT));
};

export const setDebugBoundsForRoute = (layer, route) => {
  const source = layer.getSource();

  const polygons = getDebugBoundingPath(route);

  const features = polygons.map((poly) => {
    return new Feature({
      geometry: poly,
    });
  });

  console.debug(
    `[ROUTING] ${features.length}/${onRoute.length} features on route.`
  );

  // show some of the lowest prices.
  source.addFeatures(features);
};
