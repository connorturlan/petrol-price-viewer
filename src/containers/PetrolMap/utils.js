import { Feature } from "ol";
import { Circle, Point } from "ol/geom";
import { fromLonLat, get, transform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { ENDPOINT, PROJECTION } from "../../utils/defaults";
import { containsExtent } from "ol/extent";
import { distance } from "ol/coordinate";
import { getDistance } from "ol/sphere";

export const getSites = async (setLoading, setStations) => {
  setLoading(true);

  const res = await fetch(ENDPOINT + "/sites");
  if (res.status != 200) {
    window.alert("site data not found.");
    return;
  }
  const json = await res.json();
  setStations(json);

  setLoading(false);
};

export const updateLowestPrices = async (layer, stations) => {
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
    const point = new Point(fromLonLat([station.Lng, station.Lat], PROJECTION));

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

export const updateOnRoute = (layer, route, stations) => {
  const source = layer.getSource();
  // source.clear();

  // const routeCoords = route.map((waypoint) =>
  //   waypoint.getGeometry().getCoordinates()
  // );

  const onRoute = getFeaturesOnRoute(route, stations);

  const features = onRoute.map((site) => {
    const point = new Point(fromLonLat([site.Lng, site.Lat], PROJECTION));

    let price = ((site.Price || 0) / 10).toFixed(1);

    return new Feature({
      geometry: point,
      siteid: site.SiteId,
      name: site.Name,
      price: price || "loading...",
      placeid: site.GPI,
    });
  });

  console.log(`${features.length}/${stations.length} features on route.`);

  // get the single lowest price.
  const lowestPrice = features.reduce(
    (lowest, feature) =>
      lowest.get("price") < feature.get("price") ? lowest : feature,
    features[0]
  );
  source.addFeature(lowestPrice);

  // get the 10 lowest prices.
  // const lowestPrices = features.sort((a, b) => a.get("price") - b.get("price"));
  // source.addFeatures(lowestPrices.slice(0, 4));
};
