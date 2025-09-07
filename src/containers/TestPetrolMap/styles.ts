import { FeatureLike } from "ol/Feature";
import { Circle, Geometry } from "ol/geom";
import { toSize } from "ol/size";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style, { StyleLike } from "ol/style/Style";
import Text from "ol/style/Text";
import {
  getImageFromStationBrandId,
  getImageFromStationDetails,
} from "../../utils/utils";
import { Ref, RefObject } from "react";

export type StationFeature = {
  name: string;
  brand: string;
  price: number;
  chargers: number;
  availableChargers: number;
  isLowest: boolean;
  onRoute: boolean;
};

const DEBUG = false;
/* 
0 - standard
1 - lowest
2 - on route
3 - lowest & on route
4 - in range
5 - lowest & in range
6 - on route & in range
7 - lowest & on route & in range
*/
const FeatureText = [
  // 0 - standard
  {
    textStyle: "normal 1em sans-serif",
    textFill: "#333",
    textOutline: "#eee",
    backgroundFill: "",
    backgroudOutline: "#22222240",
    iconHeight: 32,
  },
  // 1 - lowest
  {
    textStyle: "normal 1.2em sans-serif",
    textFill: "#333",
    textOutline: "#fffb00",
    backgroundFill: "",
    backgroudOutline: "#ff7b00ff",
    iconHeight: 64,
  },
  // 2 - on route
  {
    textStyle: "normal 1em sans-serif",
    textFill: "#333",
    textOutline: "#b8dfffbb",
    backgroundFill: "",
    backgroudOutline: "#038cfcbb",
    iconHeight: 48,
  },
  // 3 - lowest & on route
  {
    textStyle: "normal 1.2em sans-serif",
    textFill: "#333",
    textOutline: "#b8fffbbb",
    backgroundFill: "",
    backgroudOutline: "#03f4fcbb",
    iconHeight: 64,
  },
  // 4 - in range
  {
    textStyle: "normal 1.2em sans-serif",
    textFill: "#333",
    textOutline: "#71b671ff",
    backgroundFill: "",
    backgroudOutline: "#97f79740",
    iconHeight: 32,
  },
  // 5 - lowest & in range
  {
    textStyle: "normal 1.2em sans-serif",
    textFill: "#333",
    textOutline: "#a6ff00ff",
    backgroundFill: "",
    backgroudOutline: "#2dcf63ff",
    iconHeight: 64,
  },
  // 6 - on route & in range
  {
    textStyle: "normal 1em sans-serif",
    textFill: "#333",
    textOutline: "#b8dfffbb",
    backgroundFill: "",
    backgroudOutline: "#038cfcbb",
    iconHeight: 48,
  },
  // 7 - lowest & on route & in range
  {
    textStyle: "normal 1.2em sans-serif",
    textFill: "#333",
    textOutline: "#b8fffbbb",
    backgroundFill: "",
    backgroudOutline: "#03f4fcbb",
    iconHeight: 64,
  },
];

const getClusterText = (feature: FeatureLike): string => {
  if (DEBUG) {
    const isLowest = Boolean(feature.get("isLowest"));
    const isInRange = Boolean(feature.get("inRange"));
    const isOnRoute = Boolean(feature.get("isOnRoute"));

    return feature.get("features")?.length <= 1
      ? `${feature.get("price") || 0}
SiteId: ${feature.get("SiteId")}
isLowest: ${isLowest}
isInRange: ${isInRange}
isOnRoute: ${isOnRoute}`
      : `${feature.get("price") || 0} +${feature.get("features").length}`;
  } else {
    return feature.get("features")?.length <= 1
      ? `${feature.get("price") || 0}`
      : `${feature.get("price") || 0} +${feature.get("features").length}`;
  }
};

const getFeatureText = (feature: FeatureLike): string => {
  return `${feature.get("price")}`;
};

export function stationStyle(feature: FeatureLike): StyleLike {
  const isCluster = !!feature.get("features");
  const isLowest = Boolean(feature.get("isLowest"));
  const isFiltered = Boolean(feature.get("lowestInRange"));
  const isOnRoute = Boolean(feature.get("isOnRoute"));

  let text = "";
  if (isCluster) {
    text = getClusterText(feature);
  } else {
    text = getFeatureText(feature);
  }

  const styleIndex =
    (isLowest ? 1 : 0) + (isOnRoute ? 2 : 0) + (isFiltered ? 4 : 0);
  const style = FeatureText.at(styleIndex);

  const iconSrc = getImageFromStationDetails(feature);

  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: iconSrc,
      height: style?.iconHeight,
    }),
    text: new Text({
      offsetY: 16,
      font: style?.textStyle,
      fill: new Fill({
        color: style?.textFill,
      }),
      stroke: new Stroke({
        color: style?.textOutline,
        width: 8,
      }),
      backgroundStroke: new Stroke({
        color: style?.backgroudOutline,
        width: 16,
        lineJoin: "round",
        lineCap: "round",
      }),
      padding: [-8, 0, -8, 0],
      text: text,
    }),
    zIndex: styleIndex,
  });
}

export function _stationStyle(feature: FeatureLike): StyleLike {
  const isLowest = Boolean(feature.get("isLowest"));
  const isOnRoute = Boolean(feature.get("isOnRoute"));

  const isCluster = !!feature.get("features");

  let text = "";
  if (isCluster) {
    text =
      feature.get("features")?.length <= 1
        ? `${feature.get("price") || 0}`
        : `${feature.get("price") || 0} +${feature.get("features").length}`;
  } else {
    text = `${feature.get("price")}`;
  }

  const font = isLowest ? "normal 1.2em sans-serif" : "normal 1em sans-serif";
  const backgroundColor = isLowest ? "darkorange" : "#555";
  const textOutline = isLowest
    ? new Stroke({
        color: "#fffb00",
        width: 4,
        miterLimit: 10,
      })
    : new Stroke({
        color: "#eee",
        width: 8,
        lineCap: "butt",
      });

  const iconSrc = getImageFromStationDetails(feature);
  const iconHeight = isLowest ? 64 : 48;
  const strokeColor = isLowest
    ? "#22222220"
    : isOnRoute
    ? "#22222220"
    : "#22222220";

  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: iconSrc,
      height: iconHeight,
    }),
    text: new Text({
      offsetY: 9,
      font: font,
      fill: new Fill({
        color: backgroundColor,
      }),
      stroke: textOutline,
      backgroundStroke: new Stroke({
        color: strokeColor,
        width: 8,
        lineJoin: "round",
        lineCap: "round",
      }),
      padding: [-4, 4, -4, 4],
      text: text,
    }),
    zIndex: isLowest ? 10 : 0,
  });
}

export const defaultStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "red-pin.svg",
    height: 24,
  }),
  text: new Text({
    offsetY: 9,
    font: "bold 9pt sans-serif",
    fill: new Fill({
      color: "#555",
    }),
    backgroundFill: new Fill({
      color: "#EEE",
    }),
    backgroundStroke: new Stroke({
      color: "#555",
      width: 1,
      lineCap: "butt",
    }),
    padding: [2, 4, 2, 4],
  }),
});

export const defaultStyleDark = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "red-pin.svg",
    height: 24,
  }),
  text: new Text({
    offsetY: 9,
    font: "bold 9pt sans-serif",
    fill: new Fill({
      color: "#eee",
    }),
    backgroundFill: new Fill({
      color: "#333",
    }),
    backgroundStroke: new Stroke({
      color: "#555",
      width: 1,
      lineCap: "butt",
    }),
    padding: [2, 4, 2, 4],
  }),
});

export const lowestStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "red-pin.svg",
    height: 40,
  }),
  text: new Text({
    offsetY: 12,
    font: "italic 12pt sans-serif",
    fill: new Fill({
      color: "#555",
    }),
    backgroundFill: new Fill({
      color: "yellow",
    }),
    backgroundStroke: new Stroke({
      color: "orange",
      width: 2,
      miterLimit: 2,
    }),
    padding: [2, 4, 2, 4],
  }),
});

export const onRouteStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "red-pin.svg",
    height: 40,
  }),
  stroke: new Stroke({
    color: "black",
    width: 1,
  }),
  fill: new Fill({
    color: "#555",
  }),
  text: new Text({
    offsetY: 12,
    font: "italic 12pt sans-serif",
    fill: new Fill({
      color: "#555",
    }),
    backgroundFill: new Fill({
      color: "#a0ebff",
    }),
    backgroundStroke: new Stroke({
      color: "#038cfc",
      width: 3,
    }),
    padding: [4, 6, 4, 6],
  }),
});

export const customStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "home_pin_24dp_FILL0_wght400_GRAD0_opsz24_dkgreen.svg",
    height: 48,
  }),
  text: new Text({
    offsetY: 12,
    font: "italic 12pt sans-serif",
    fill: new Fill({
      color: "black",
    }),
    backgroundFill: new Fill({
      color: "white",
    }),
    backgroundStroke: new Stroke({
      color: "#ccc",
      width: 2,
      miterLimit: 2,
      lineCap: "butt",
    }),
    padding: [2, 4, 2, 4],
  }),
});

export const waypointStyle = new Style({
  zIndex: 1,
  stroke: new Stroke({ color: "#038cfcbb", width: 8 }),
  fill: new Fill({
    color: "#a0ebff60",
  }),
  text: new Text({
    offsetY: 12,
    font: "bold 12pt sans-serif",
    fill: new Fill({
      color: "#555",
    }),
    backgroundFill: new Fill({
      color: "#EEE",
    }),
    backgroundStroke: new Stroke({
      color: "#555",
      width: 1,
      lineCap: "butt",
    }),
    padding: [2, 4, 2, 4],
  }),
});
