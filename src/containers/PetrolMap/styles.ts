import { FeatureLike } from "ol/Feature";
import { Circle, Geometry } from "ol/geom";
import { toSize } from "ol/size";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style, { StyleLike } from "ol/style/Style";
import Text from "ol/style/Text";
import { getImageFromStationBrandId } from "../../utils/utils";

export type StationFeature = {
  name: string;
  brand: string;
  price: number;
  chargers: number;
  availableChargers: number;
  isLowest: boolean;
  onRoute: boolean;
};

export function stationStyle(feature: FeatureLike): StyleLike {
  const isLowest = Boolean(feature.get("isLowest"));

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

  const font = isLowest ? "normal 1em sans-serif" : "italic 1em sans-serif";
  const backgroundColor = isLowest ? "darkorange" : "#555";
  const textOutline = isLowest
    ? new Stroke({
        color: "#fffb00",
        width: 4,
        miterLimit: 10,
      })
    : new Stroke({
        color: "#eee",
        width: 4,
        lineCap: "butt",
      });

  const brandId = feature.get("brandid");
  let iconSrc = brandId
    ? getImageFromStationBrandId(brandId) || "red-pin.svg"
    : "red-pin.svg";

  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: iconSrc,
      height: 48,
    }),
    text: new Text({
      offsetY: 9,
      font: font,
      fill: new Fill({
        color: backgroundColor,
      }),
      stroke: textOutline,
      backgroundStroke: new Stroke({
        color: "#22222220",
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
