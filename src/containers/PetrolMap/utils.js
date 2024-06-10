import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { ENDPOINT, PROJECTION } from "../../utils/defaults";

export const getSites = async (setLoading, setStations) => {
  setLoading(true);

  const res = await fetch(ENDPOINT + "/sites");
  if (res.status != 200) {
    window.alert("site data not found.");
    return;
  }
  const json = await res.json();
  setStations(json);

  setLoading(false);
};

export const updateLowestPrices = (layer, stations) => {
  const source = new VectorSource();
  layer.setSource(source);

  const lowestPrice = stations.reduce(
    (lowest, station) => (lowest.Price < station.Price ? lowest : station),
    stations[0]
  );

  const lowestStations = stations.filter(
    (station) => station.Price <= lowestPrice.Price
  );

  const features = lowestStations.map((station) => {
    const point = new Point(fromLonLat([station.Lng, station.Lat], PROJECTION));

    let price = ((station.Price || 0) / 10).toFixed(1);

    return new Feature({
      geometry: point,
      siteid: station.SiteId,
      name: station.Name,
      price: price || "loading...",
      placeid: station.GPI,
    });
  });
  source.addFeatures(features);
};
