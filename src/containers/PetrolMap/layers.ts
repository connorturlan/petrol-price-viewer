import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
  customStyle,
  defaultStyle,
  lowestStyle,
  onRouteStyle,
  waypointStyle,
} from "./styles";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { fromLonLat, getPointResolution } from "ol/proj";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { ENDPOINT, PROJECTION } from "../../utils/defaults";
import { Capitalize, ObjectIsEmpty } from "../../utils/utils";
import {
  getRoutesBetweenPoints,
  getWaypointsBetweenPoints,
} from "../../utils/navigation";
import Stroke from "ol/style/Stroke";

export const createStationLayer = () => {
  const initialSource = new VectorSource();

  return new VectorLayer({
    source: initialSource,
    style: (feature) => {
      defaultStyle
        .getText()
        .setText([`${feature.get("price")}`, "italic 12pt sans-serif"]);
      return defaultStyle;
    },
  });
};

export const createLowestLayer = () => {
  const initialLowestSource = new VectorSource();

  return new VectorLayer({
    source: initialLowestSource,
    style: (feature) => {
      lowestStyle.getText().setText([`${feature.get("price")}`, ""]);
      return lowestStyle;
    },
  });
};

export const createOnRouteLayer = () => {
  const source = new VectorSource();

  return new VectorLayer({
    source: source,
    style: (feature) => {
      onRouteStyle.getText().setText([`${feature.get("price")}`, ""]);
      return onRouteStyle;
    },
  });
};

// addDefaultHome will add adelaide city center as home.
const addDefaultHome = (source) => {
  const point = new Point(fromLonLat([138.599503, -34.92123], "EPSG:4326"));
  const feature = new Feature({
    geometry: point,
  });
  source.addFeature(feature);
};

// addPOIs will add all user defined POIs.
export const addPOIs = async (source, profile) => {
  if (ObjectIsEmpty(profile)) {
    addDefaultHome(source);
    return;
  }

  // get the user's POIS.
  const res = await fetch(`${ENDPOINT}/poi?userid=${profile.id}`);
  if (res.status != 200) {
    addDefaultHome(source);
    return;
  }

  const json = (await res.json()) as object;
  Array.from(Object.values(json)).forEach((obj) => {
    const point = new Point(fromLonLat([obj.Lat, obj.Lng], "EPSG:4326"));
    const feature = new Feature({
      geometry: point,
      name: obj.Name,
    });
    source.addFeature(feature);
  });
};

// createCustomLayer creates the POI layer
export const createCustomLayer = (profile) => {
  console.log("creating custom layer");

  const initialLowestSource = new VectorSource();

  addPOIs(initialLowestSource, profile);

  return new VectorLayer({
    source: initialLowestSource,
    style: (feature) => {
      customStyle
        .getText()
        .setText([`${Capitalize(feature.get("name") || "POI")}`, ""]);
      return customStyle;
    },
  });
};

const addRoute = (source, waypoints) => {
  waypoints.forEach((coord) => {
    const [lat, lng] = coord;
    const point = new Point(fromLonLat([lng, lat], "EPSG:4326"));
    const feature = new Feature({
      geometry: point,
    });
    source.addFeature(feature);
  });

  const points = waypoints.map((coord) => {
    const [lat, lng] = coord;
    // const point = new Point(fromLonLat([lng, lat], "EPSG:4326"));
    return [lng, lat];
  });

  const feature = new Feature({
    geometry: new LineString(points),
  });

  source.addFeature(feature);
};

// addPOIs will add all user defined POIs.
export const addWaypoints = async (source, start, finish) => {
  const waypoints = await getWaypointsBetweenPoints(start, finish);
  console.log(`${waypoints.length} waypoints found`);
  addRoute(source, waypoints);
};

// addPOIs will add all user defined POIs.
export const addRoutes = async (source, start, finish) => {
  const routes = await getRoutesBetweenPoints(start, finish);
  console.log(`${routes.length} routes found`);
  routes.forEach((waypoints) => {
    console.log(waypoints);
    console.log(`${waypoints.length} waypoints found`);
    addRoute(source, waypoints);
  });
};

// createWaypointLayer creates the POI layer
export const createWaypointLayer = (start, finish) => {
  console.log("creating waypoint layer");

  const source = new VectorSource();

  // addWaypoints(source, start, finish);
  addRoutes(source, start, finish);

  const test = new VectorLayer();

  return new VectorLayer({
    source: source,
    style: (feature, resolution) => {
      {
        // if (feature === undefined) return waypointStyle;
        const extent = feature.getGeometry().getExtent();

        const pointResolution =
          getPointResolution(PROJECTION, resolution, extent) * 180_000;

        console.log(pointResolution);
        const stroke = waypointStyle.getStroke();
        stroke.setWidth(500 / pointResolution);
        waypointStyle.setStroke(stroke);
        // Resolution = number of meters for a pixel (at least for EPSG 3857)
        return waypointStyle;
      }
    },
  });
};
