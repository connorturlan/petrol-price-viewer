import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { defaultStyle, lowestStyle } from "./styles";

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
