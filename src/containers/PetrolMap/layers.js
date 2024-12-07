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
import { PROJECTION } from "../../utils/defaults";
import { Capitalize, ObjectIsEmpty } from "../../utils/utils";
import {
  getRoutesBetweenPoints,
  getWaypointsBetweenPoints,
} from "../../utils/navigation";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { getPointsOfInterest } from "../../utils/api";

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
export const addPOIs = async (source, POI) => {
  Array.from(Object.values(POI)).forEach((obj) => {
    const point = new Point(fromLonLat([obj.Lat, obj.Lng], PROJECTION));
    const feature = new Feature({
      geometry: point,
      name: obj.Name,
    });
    source.addFeature(feature);
  });
};

const handleCustomLayerStyles = (name, source) => {
  const style = new Style({
    text: customStyle.getText(),
    image: new Icon({
      anchor: [0.5, 1],
      src: source,
      height: 48,
    }),
  });
  style.getText().setText([`${Capitalize(name || "POI")}`, ""]);
  return style;
};

// createCustomLayer creates the POI layer
export const createCustomLayer = (POI) => {
  console.debug("[POI] creating custom layer");

  const source = new VectorSource();

  addPOIs(source, POI);

  return new VectorLayer({
    source: source,
    style: (feature) => {
      switch (feature.get("name")) {
        case "home":
          return handleCustomLayerStyles(
            "home",
            "home_pin_24dp_FILL0_wght400_GRAD0_opsz24_dkgreen.svg"
          );
        case "work":
          return handleCustomLayerStyles(
            "work",
            "person_pin_circle_24dp_255290_FILL0_wght400_GRAD0_opsz24.svg"
          );
        default:
          return handleCustomLayerStyles(
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
  console.debug(`[ROUTING] ${waypoints.length} waypoints found`);
  addRoute(source, waypoints);
};

// addPOIs will add all user defined POIs.
export const addRoutes = async (source, routes) => {
  console.debug(`[ROUTING] ${routes.length} routes found`);
  if (!routes) {
    console.warn(
      `[ROUTING] routes weren't provided as an array, got: ${routes}`
    );
    return;
  }
  routes.forEach((waypoints) => {
    addRoute(source, waypoints);
  });
};

// createWaypointLayer creates the routing layer between the two selected POIs
export const createWaypointLayer = (routes) => {
  console.debug("[ROUTING] creating waypoint layer");

  const source = new VectorSource();

  if (routes) {
    addRoutes(source, routes);
  }

  return new VectorLayer({
    source: source,
    style: (feature, resolution) => {
      {
        // if (feature === undefined) return waypointStyle;
        const extent = feature.getGeometry().getExtent();

        const pointResolution =
          getPointResolution(PROJECTION, resolution, extent) * 180_000;

        const stroke = waypointStyle.getStroke();
        stroke.setWidth(10);
        waypointStyle.setStroke(stroke);
        // Resolution = number of meters for a pixel (at least for EPSG 3857)
        return waypointStyle;
      }
    },
  });
};
