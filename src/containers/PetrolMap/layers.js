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
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";

export const createStationLayer = () => {
  const initialSource = new VectorSource();

  return new VectorLayer({
    source: initialSource,
    // declutter: true,
    style: (feature) => {
      defaultStyle
        .getText()
        .setText([`${feature.get("price")}`, "italic 12pt sans-serif"]);
      return defaultStyle;
    },
    zIndex: 0,
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
    zIndex: 1,
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
    zIndex: 1,
  });
};

// addDefaultHome will add adelaide city center as home.
const addDefaultHome = (source) => {
  const point = new Point(fromLonLat([138.599503, -34.92123], PROJECTION));
  const feature = new Feature({
    geometry: point,
  });
  source.addFeature(feature);
};

// addPOIs will add all user defined POIs.
export const addPOIs = async (source, profile) => {
  if (ObjectIsEmpty(profile)) {
    // addDefaultHome(source);
    return;
  }

  // get the user's POIS.
  const res = await fetch(`${ENDPOINT}/poi?userid=${profile.id}`);
  if (res.status != 200) {
    addDefaultHome(source);
    return;
  }

  const json = (await res.json()) || {};
  Array.from(Object.values(json)).forEach((obj) => {
    const point = new Point(fromLonLat([obj.Lat, obj.Lng], PROJECTION));
    const feature = new Feature({
      geometry: point,
      name: obj.Name,
    });
    source.addFeature(feature);
  });
};

const handleCustomLayer = (name, source) => {
  const style = new Style({
    text: customStyle.getText(),
    image: new Icon({
      anchor: [0.5, 1],
      src: source,
      height: 48,
      rotateWithView: true,
    }),
  });
  style.getText().setText([`${Capitalize(name || "POI")}`, ""]);
  return style;
};

// createCustomLayer creates the POI layer
export const createCustomLayer = (profile) => {
  console.log("creating custom layer");

  const initialLowestSource = new VectorSource();

  addPOIs(initialLowestSource, profile);

  return new VectorLayer({
    source: initialLowestSource,
    style: (feature) => {
      switch (feature.get("name")) {
        case "home":
          return handleCustomLayer(
            "home",
            "home_pin_24dp_FILL0_wght400_GRAD0_opsz24_dkgreen.svg"
          );
        case "work":
          return handleCustomLayer(
            "work",
            "person_pin_circle_24dp_255290_FILL0_wght400_GRAD0_opsz24.svg"
          );
        default:
          return handleCustomLayer(
            feature.get("name"),
            "location_on_24dp_8C1A10_FILL0_wght400_GRAD0_opsz24.svg"
          );
      }
    },
  });
};

const addRoute = (source, waypoints) => {
  waypoints.forEach((coord) => {
    const point = new Point(fromLonLat(coord, PROJECTION));
    const feature = new Feature({
      geometry: point,
    });
    source.addFeature(feature);
  });

  const feature = new Feature({
    geometry: new LineString(waypoints),
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

        const stroke = waypointStyle.getStroke();
        stroke.setWidth(500 / pointResolution);
        waypointStyle.setStroke(stroke);
        // Resolution = number of meters for a pixel (at least for EPSG 3857)
        return waypointStyle;
      }
    },
  });
};
