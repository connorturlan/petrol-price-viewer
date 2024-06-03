import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";

const ENDPOINT =
  import.meta.env.VITE_LOCAL == "TRUE" ||
  import.meta.env.VITE_LOCAL_API == "TRUE"
    ? "http://localhost:3000"
    : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod";
const PROJECTION = "EPSG:4326";

export const getSites = async (setLoading, setStations) => {
  setLoading(true);

  const res = await fetch(ENDPOINT + "/sites");
  if (res.status != 200) {
    window.alert("site data not found.");
    return;
  }
  const json = await res.json();
  setStations(json);

  console.log(`updated ${json.length} stations.`);

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

  lowestStations.forEach((station) => {
    const point = new Point(fromLonLat([station.Lng, station.Lat], PROJECTION));

    let price = ((station.Price || 0) / 10).toFixed(1);

    const marker = new Feature({
      geometry: point,
      siteid: station.SiteId,
      name: station.Name,
      price: price || "loading...",
      placeid: station.GPI,
    });

    source.addFeature(marker);
  });
};
