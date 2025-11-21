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

let brandIdMap, brandNameMap;

const constructBrandMaps = () => {
  const brandIdEntries = brands.Brands.map((brand) => {
    return [
      brand.BrandId,
      { brandId: brand.BrandId, name: brand.Name, image: brand.Image },
    ];
  });
  const brandNameEntries = brands.Brands.map((brand) => {
    return [
      brand.Name,
      { brandId: brand.BrandId, name: brand.Name, image: brand.Image },
    ];
  });
  brandIdMap = Object.fromEntries(brandIdEntries);
  brandNameMap = Object.fromEntries(brandNameEntries);
};

export const getImageFromStationBrandId = (brandId) => {
  if (!brandIdMap) constructBrandMaps();
  if (!brandId) return "red-pin.svg";
  if (!brandIdMap[brandId]) return "red-pin.svg";
  return brandIdMap[brandId].image || "red-pin.svg";
};

export const getNameFromStationBrandId = (brandId) => {
  if (!brandIdMap) constructBrandMaps();
  if (!brandId) return "red-pin.svg";
  if (!brandIdMap[brandId]) return "red-pin.svg";
  return brandIdMap[brandId].name || "unknown";
};

export const getImageFromStationName = (name) => {
  if (!brandNameMap) constructBrandMaps();
  if (!name) return "red-pin.svg";
  return brandNameMap[name]?.image || "red-pin.svg";
};

export const getImageFromStationDetails = (feature) => {
  const brandId = feature.get("BrandID");
  return brandId == 0
    ? getImageFromStationName(feature.get("Name"))
    : getImageFromStationBrandId(brandId);
};
