import { Feature } from "ol";
import { PROJECTION } from "../../utils/defaults";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { getSectors } from "../../services/StationPriceManager/StationPriceManager.service";
import { fromExtent } from "ol/geom/Polygon";
import { intersects } from "ol/extent";

export function convertStationToFeature(station) {
  const coord = fromLonLat([station.Lng, station.Lat], PROJECTION);
  const point = new Point(coord);

  let price;
  if (station.FuelID < 10_000) {
    price = ((station.Price || 0) / 10).toFixed(1);
  } else {
    price = station.Price || 0;
  }

  return new Feature({
    coord,
    geometry: point,
    ...station,
    price: price || "loading...",
    normalisedRange: 0,
  });
}

export async function getSectorsInRange(bounds, allSectors = []) {
  if (allSectors.length <= 0) {
    allSectors = await getSectors();
  }
  const filteredSectors = allSectors
    .filter((sector) => {
      const tl = fromLonLat(sector.tl);
      const br = fromLonLat(sector.br);
      const geom = fromExtent([...tl, ...br]);
      const extent = geom.getExtent();
      const insideBounds = intersects(extent, bounds);
      return insideBounds;
    })
    .map((sector) => sector.id);

  const uniqueSet = new Set(filteredSectors);
  return [...uniqueSet];
}
