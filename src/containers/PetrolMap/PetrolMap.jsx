import { useEffect, useRef, useState } from "react";
import MapContainer from "../../components/MapContainer/MapContainer";
import styles from "./PetrolMap.module.scss";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { Feature } from "ol";
import StationModal from "../../components/StationModal/StationModal";
import { containsCoordinate } from "ol/extent";
import LoadingSplash from "../../components/LoadingSplash/LoadingSplash";
import {
  createCustomLayer,
  createLowestLayer,
  createStationLayer,
} from "./layers";
import { getSites, updateLowestPrices } from "./utils";
import { ENDPOINT, PROJECTION } from "../../utils/defaults";

export const MODES = Object.freeze({
  DEFAULT: 0,
  ADD_HOME: 1,
});

const PetrolMap = ({ fuelType, updateStations, setClickMode, setHome }) => {
  const [allStations, setAllStations] = useState([]);

  const [visibleBounds, setVisibleBounds] = useState([0, 0, 0, 0]);

  const [stations, setStations] = useState([]);
  const [stationLayer, setStationsLayer] = useState(new VectorLayer());

  const [lowestLayer, setLowestLayer] = useState(new VectorLayer());

  const [customLayer, setCustomLayer] = useState(new VectorLayer());

  const [modalDetails, setModalDetails] = useState({});
  const [modalVisible, setModalVisibility] = useState(false);

  const [loadingStations, setStationsState] = useState(true);
  const [loadingPrices, setPricesState] = useState(false);

  useEffect(() => {
    setStationsLayer(createStationLayer());
    setLowestLayer(createLowestLayer());
    setCustomLayer(createCustomLayer());
    getSites(setStationsState, setAllStations);
  }, []);

  useEffect(() => {
    // may be null on first render
    if (!stations || stations.length <= 0) return;

    const source = new VectorSource();
    stationLayer.setSource(source);
    const filteredstations = stations.filter(
      (feature) => feature.Price && feature.Price < 9999
    );

    const features = filteredstations.map((feature) => {
      const point = new Point(
        fromLonLat([feature.Lng, feature.Lat], PROJECTION)
      );

      let price = ((feature.Price || 0) / 10).toFixed(1);

      return new Feature({
        geometry: point,
        siteid: feature.SiteId,
        name: feature.Name,
        price: price || "loading...",
        placeid: feature.GPI,
      });
    });
    source.addFeatures(features);

    // console.log(`added ${filteredstations.length} stations.`);
  }, [stations, allStations]);

  useEffect(() => {
    if (loadingStations || !allStations || loadingPrices) return;
    getSitePrices();
  }, [loadingStations, allStations, visibleBounds]);

  useEffect(() => {
    if (!stations || !visibleBounds) return;
    updateLowestPrices(lowestLayer, stations);
    updateStations && updateStations(stations);
  }, [stations, visibleBounds]);

  useEffect(() => {
    resetFuelPrices();
    getSitePrices({ reload: true });
  }, [fuelType]);

  const getSitePrices = async ({ reload } = {}) => {
    // setWarning(false);
    if (!allStations || allStations.length <= 0) {
      return;
    }

    const body = allStations
      .filter((station) => {
        return !station.Price;
      })
      .filter((station) => {
        return containsCoordinate(visibleBounds, [station.Lng, station.Lat]);
      })
      .map((feature) => feature.SiteId);

    if (body.length >= 200) {
      console.warn("request body length exceeds 200.");
      window.alert("Search area too large, try zooming in.");
      setPricesState(false);
      return;
    }

    setPricesState(true);

    const newStations = allStations;
    if (body.length <= 0) {
      console.log("no new data to fetch.");
    } else {
      // console.log(`requesting data for ${body.length} sites`);
      const req = fetch(ENDPOINT + `/prices?fuelType=${fuelType}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const request = new Promise((accept, reject) => {
        let accepted = false;

        setTimeout(() => {
          if (accepted) return;

          window.alert("Prices request timed out, try again later.");
          setPricesState(false);
          reject();
          return;
        }, 5_000);

        req.then((data) => {
          accepted = true;
          accept(data);
        });
      });

      const res = await request;
      if (res.status != 200) {
        window.alert(
          "error while handling site prices. please try again later"
        );
        setPricesState(false);
        return;
      }

      const json = await res.json();

      Object.entries(json).forEach((site) => {
        const [siteId, sitePrice] = site;

        const station = allStations.find((station) => {
          if (station.SiteId == siteId) {
            return station;
          }
        });

        if (!station) return undefined;

        // show prices without dollar sign.
        station.Price = sitePrice;

        return station;
      });
    }

    const filteredStations = newStations
      .sort((a, b) => a.Price - b.Price)
      .filter((station) => station.Price)
      .filter((station) => {
        return containsCoordinate(visibleBounds, [station.Lng, station.Lat]);
      });

    console.log(
      `${filteredStations.length} prices found for ${allStations.length} sites`
    );

    // if (filteredStations.length <= 0) {
    //   setWarning(true);
    // }

    setStations(filteredStations);
    setPricesState(false);
  };

  const resetFuelPrices = () => {
    if (!stations) return;

    const newStations = allStations.slice().map((station) => {
      station.Price = undefined;
      return station;
    });

    setStations([]);
  };

  const createHomeFeature = (event) => {
    const source = new VectorSource();
    const point = new Point(event.coordinate, "EPSG:4326");
    const feature = new Feature({
      geometry: point,
    });

    source.addFeature(feature);
    customLayer.setSource(source);
  };

  const onClick = (event, map) => {
    const clickMode = localStorage.getItem("clickMode") || 0;

    if (clickMode == MODES.DEFAULT) {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const details = allStations.find((station) => {
          if (station.SiteId == feature.get("siteid")) {
            return station;
          }
        });
        setModalDetails(details);

        setModalVisibility(true);
      });
    } else if (clickMode == MODES.ADD_HOME) {
      createHomeFeature(event);
      // post the new home.
      setHome(event.coordinate);
      // reset the mode.
      setClickMode(0);
    }
  };

  const onInit = (map) => {
    const extent = map.getView().calculateExtent(map.getSize());
    setVisibleBounds(extent);
  };

  const onMove = (event, map) => {
    if (!map) return;

    const extent = map.getView().calculateExtent(map.getSize());
    setVisibleBounds(extent);
  };

  if (!stationLayer || !lowestLayer || !allStations || allStations.length <= 0)
    return;

  return (
    <>
      <LoadingSplash fadeIn={loadingStations || loadingPrices} />
      {modalVisible && (
        <StationModal
          siteDetails={modalDetails}
          setVisible={setModalVisibility}
        />
      )}
      <MapContainer
        layer={stationLayer}
        layers={[stationLayer, lowestLayer, customLayer]}
        onInit={onInit}
        onClick={onClick}
        onMove={onMove}
      />
    </>
  );
};

export default PetrolMap;
