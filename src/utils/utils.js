import { fromLonLat } from "ol/proj";
import { PROJECTION } from "./defaults";

export const ObjectIsEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertCoord = (coord) => {
  return fromLonLat(coord, PROJECTION);
};

export const convertCoordFromLatLon = (coord) => {
  return convertCoord([coord.at(1), coord.at(0)]);
};
