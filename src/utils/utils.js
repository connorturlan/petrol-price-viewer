import { fromLonLat } from "ol/proj";
import { PROJECTION } from "./defaults";
import brands from "../assets/brands-indev.json";

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

let brandMap;

const constructBrandMap = () => {
  const brandEntries = brands.Brands.map((brand) => {
    return [
      brand.BrandId,
      { brandId: brand.BrandId, name: brand.Name, image: brand.Image },
    ];
  });
  brandMap = Object.fromEntries(brandEntries);
};

export const getImageFromStationBrandId = (brandId) => {
  if (!brandMap) constructBrandMap();
  if (!brandId) return "red-pin.svg";
  return brandMap[brandId].image || "red-pin.svg";
};
