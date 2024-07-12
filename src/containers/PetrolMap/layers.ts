import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { customStyle, defaultStyle, lowestStyle } from "./styles";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { ENDPOINT } from "../../utils/defaults";
import { ObjectIsEmpty } from "../../utils/utils";

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

// createCustomLayer creates the POI layer.
export const createCustomLayer = (profile) => {
  console.log("creating custom layer");

  const initialLowestSource = new VectorSource();

  addPOIs(initialLowestSource, profile);

  return new VectorLayer({
    source: initialLowestSource,
    style: () => {
      customStyle.getText().setText("Home");
      return customStyle;
    },
  });
};
