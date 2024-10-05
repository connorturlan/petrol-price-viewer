import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";

export const defaultStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: "red-pin.svg",
    height: 24,
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
  text: new Text({
    offsetY: 12,
    font: "italic 12pt sans-serif",
    fill: new Fill({
      color: "#555",
    }),
    backgroundFill: new Fill({
      color: "#CEC",
    }),
    backgroundStroke: new Stroke({
      color: "#555",
      width: 2,
      miterLimit: 2,
    }),
    padding: [2, 4, 2, 4],
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
      color: "green",
      width: 2,
      miterLimit: 2,
      lineCap: "butt",
    }),
    padding: [2, 4, 2, 4],
  }),
});

export const waypointStyle = new Style({
  stroke: new Stroke({ color: "#038cfc60", width: 100 }),
  fill: new Fill({
    color: "#038cfc",
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
