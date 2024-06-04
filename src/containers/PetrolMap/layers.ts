import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { customStyle, defaultStyle, lowestStyle } from "./styles";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

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

export const createCustomLayer = () => {
  const initialLowestSource = new VectorSource();

  const point = new Point(fromLonLat([138.599503, -34.92123], "EPSG:4326"));

  const feature = new Feature({
    geometry: point,
  });

  initialLowestSource.addFeature(feature);

  return new VectorLayer({
    source: initialLowestSource,
    style: () => {
      customStyle.getText().setText("Home");
      return customStyle;
    },
  });
};
