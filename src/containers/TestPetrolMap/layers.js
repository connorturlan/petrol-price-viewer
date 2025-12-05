import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
  customStyle,
  defaultStyle,
  defaultStyleDark,
  lowestStyle,
  onRouteStyle,
  stationStyle,
  waypointStyle,
} from "./styles";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import { fromLonLat, getPointResolution } from "ol/proj";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { PROJECTION } from "../../utils/defaults";
import { capitalize, ObjectIsEmpty } from "../../utils/utils";
import { getRoutesBetweenPoints } from "../../utils/navigation";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { getPointsOfInterest } from "../../utils/api";
import { getDebugBoundingPath } from "./utils";
import zIndex from "@mui/material/styles/zIndex";
import Cluster from "ol/source/Cluster.js";

export const createStationLayer = (styleOverride = stationStyle) => {
  const initialSource = new VectorSource();

  const clusterSource = new Cluster({
    distance: 90,
    // minDistance: 200,
    source: initialSource,
  });

  return new VectorLayer({
    source: clusterSource,
    style: styleOverride,
  });
};

export const createStationLayerDark = () => {
  const layer = createStationLayer();

  layer.setStyle((feature) => {
    defaultStyleDark
      .getText()
      .setText([`${feature.get("price")}`, "italic 12pt sans-serif"]);
    return defaultStyleDark;
  });

  return layer;
};

export const createLowestLayer = () => {
  const initialLowestSource = new VectorSource();

  return new VectorLayer({
    source: initialLowestSource,
    // declutter: "obstacle",
    zIndex: 20,
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
    // declutter: true,
    zIndex: 30,
    style: (feature) => {
      onRouteStyle.getText().setText([`${feature.get("price")}`, ""]);
      onRouteStyle.setZIndex(-feature.get("price") * 10);
      return onRouteStyle;
    },
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
      type: "poi",
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
  style.getText().setText([`${capitalize(name || "POI")}`, ""]);
  return style;
};

// createCustomLayer creates the POI layer
export const createCustomLayer = (POI) => {
  console.debug("[POI] creating custom layer");

  const source = new VectorSource();

  addPOIs(source, POI);

  return new VectorLayer({
    source: source,
    declutter: false,
    style: (feature) => {
      switch (feature.get("style") || feature.get("name")) {
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

  // DEBUG - show bounding paths.
  // const bounds = getDebugBoundingPath(waypoints);
  // source.addFeatures(bounds);
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
  routes?.forEach((waypoints) => {
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
        if (feature === undefined) return waypointStyle;
        const extent = feature.getGeometry().getExtent();

        const pointResolution = getPointResolution(
          PROJECTION,
          resolution,
          extent
        );
        // const stroke = waypointStyle.getStroke();
        // Resolution = number of meters for a pixel (at least for EPSG 3857)
        // stroke.setWidth(20 / pointResolution);
        // waypointStyle.setStroke(stroke);

        return waypointStyle;
      }
    },
  });
};
