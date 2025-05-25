import { useContext, useEffect, useRef, useState } from "react";
import MapContainer from "../../components/MapContainer/MapContainer";
import styles from "./PetrolMap.module.scss";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {
  fromLonLat,
  getTransform,
  Projection,
  transform,
  transformWithProjections,
} from "ol/proj";
import { Point, Polygon } from "ol/geom";
import { Feature } from "ol";
import StationModal from "../../components/StationModal/StationModal";
import { containsCoordinate } from "ol/extent";
import LoadingSplash from "../../components/LoadingSplash/LoadingSplash";
import {
  createCustomLayer,
  createLowestLayer,
  createOnRouteLayer,
  createStationLayer,
  createStationLayerDark,
  createWaypointLayer,
} from "./layers";
import {
  getCorners,
  getFeaturesAvailableOnRoute,
  getFeaturesOnRoute,
  getSites,
  setStationsOnRoute,
  updateLowestPrices,
} from "./utils";
import { PROJECTION } from "../../utils/defaults";
import { AppContext } from "../../contexts/AppContext";
import { UserContext } from "../../contexts/UserContext";
import { convertCoord, ObjectIsEmpty } from "../../utils/utils";
import { getRoutesBetweenPoints } from "../../utils/navigation";
import { fromExtent } from "ol/geom/Polygon";
import { RouteContext } from "../../contexts/RouteContext";
// import { getFuelPrices } from "../../services/service";
import { getFuelPrices } from "../../services/StationPriceManager/StationPriceManager.service";
import { createDefaultStyle } from "ol/style/Style";
import { updateAllStations } from "../../services/StationPriceManager/StationPriceManager.service";

export const MODES = Object.freeze({
  DEFAULT: 0,
  ADD_HOME: 1,
  ADD_WORK: 2,
  ADD_POI: 3,
});

const MAP_CENTER = [138.599503, -34.92123];

const PetrolMap = ({ fuelType, updateStations }) => {
  const { setClickMode, clickModeOptions, selectSite, darkMode } =
    useContext(AppContext);
  const { setHome, setWork, setCustomLocation, profile, POI, getPOIs, token } =
    useContext(UserContext);
  const { origin, setOrigin, getOrigin, dest, setDest, getDest } =
    useContext(RouteContext);

  const [reload, triggerReload] = useState(false);
  const [allStations, setAllStations] = useState([]);

  const [visibleBounds, setVisibleBounds] = useState([0, 0, 0, 0]);

  const [stations, setStations] = useState([]);
  const [stationLayer, setStationsLayer] = useState(new VectorLayer());

  const [lowestLayer, setLowestLayer] = useState(new VectorLayer());
  const [onRouteLayer, setOnRouteLayer] = useState(new VectorLayer());
  const [routes, setRoutes] = useState([]);

  const [customLayer, setCustomLayer] = useState(new VectorLayer());

  const [waypointLayer, setWaypointLayer] = useState(new VectorLayer());

  const [layers, setLayers] = useState([]);

  const [loadingStations, setStationsState] = useState(true);
  const [loadingPrices, setPricesState] = useState(false);
  const [loadingRouting, setRoutingState] = useState(false);

  const newCenter =
    !ObjectIsEmpty(profile) && !ObjectIsEmpty(POI) && !ObjectIsEmpty(POI.home)
      ? [POI.home.Lat, POI.home.Lng]
      : MAP_CENTER;
  const [center, setCenter] = useState(newCenter);

  useEffect(() => {
    setStationsLayer(createStationLayer());
    setLowestLayer(createLowestLayer());
    setOnRouteLayer(createOnRouteLayer());
    setCustomLayer(createCustomLayer(POI));
    setWaypointLayer(createWaypointLayer(POI.home, POI.work));
    // getSites(setStationsState, setAllStations);
    const getAllSites = async () => {
      setStationsState(true);
      const stations = await updateAllStations();
      setAllStations(stations);
      setStationsState(false);
    };
    getAllSites();
  }, []);

  useEffect(() => {
    setLayers([
      stationLayer,
      waypointLayer,
      onRouteLayer,
      lowestLayer,
      customLayer,
    ]);
  }, [stationLayer, waypointLayer, onRouteLayer, lowestLayer, customLayer]);

  useEffect(() => {
    if (!reload) return;
    setTimeout(() => {
      triggerReload(false);
    }, 100);
  }, [reload]);

  useEffect(() => {
    triggerReload(true);
    setStationsLayer(
      darkMode ? createStationLayerDark() : createStationLayer()
    );
  }, [darkMode]);

  useEffect(() => {
    triggerReload(true);
    setCustomLayer(createCustomLayer(POI));
  }, [profile, POI, routes]);

  useEffect(() => {
    let newCenter = MAP_CENTER;
    if (!ObjectIsEmpty(profile)) {
      if (!ObjectIsEmpty(POI) && !ObjectIsEmpty(POI.home))
        newCenter = [POI.home.Lat, POI.home.Lng];

      if (!ObjectIsEmpty(origin)) newCenter = [origin.Lat, origin.Lng];
      if (!ObjectIsEmpty(origin) && !ObjectIsEmpty(dest))
        newCenter = [(origin.Lat + dest.Lat) / 2, (origin.Lng + dest.Lng) / 2];
    }

    console.log(newCenter, origin, dest);

    setCenter(newCenter);
  }, [POI, origin, dest]);

  useEffect(() => {
    const getRoutes = async () => {
      const newRoutes = await getRoutesBetweenPoints(origin, dest);
      setRoutes(newRoutes || []);
      setRoutingState(false);
    };

    triggerReload(true);
    setRoutingState(true);
    getRoutes();
  }, [POI, origin, dest]);

  useEffect(() => {
    triggerReload(true);
    setWaypointLayer(createWaypointLayer(routes));
  }, [routes]);

  useEffect(() => {
    // may be null on first render
    if (!stations || stations.length <= 0) return;

    const source = new VectorSource();
    stationLayer.setSource(source);
    const filteredstations = stations.filter(
      (feature) => feature.Price && feature.Price < 9999
    );

    const features = filteredstations.map((feature) => {
      const point = new Point([feature.Lng, feature.Lat]);

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

    console.debug(`[STATIONS] added ${filteredstations.length} stations.`);
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
    updateOnRouteStations();
  }, [routes]);

  useEffect(() => {
    resetFuelPrices();
    getSitePrices({ reload: true });
  }, [fuelType]);

  const updateOnRouteStations = async () => {
    if (!onRouteLayer || !onRouteLayer.getSource()) {
      setTimeout(updateOnRouteStations, 1_000);
      return;
    }
    setRoutingState(true);

    onRouteLayer.getSource().clear();
    const stationsOnRoute = routes.flatMap((route) => {
      return getFeaturesAvailableOnRoute(route, stations);
    });

    console.debug(
      `[ROUTING] ${stationsOnRoute.length} points added of ${routes.length} routes`
    );
    setStationsOnRoute(onRouteLayer, stationsOnRoute);
    setRoutingState(false);
  };

  const getSitePrices = async ({ reload } = {}) => {
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
      console.debug("[STATIONS] no new data to fetch.");
    } else {
      // const json = await getFuelPrices(fuelType, body);
      const json = await getFuelPrices(fuelType, body);
      setPricesState(false);

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

    console.debug(
      `[PRICES] ${filteredStations.length} prices found for ${allStations.length} sites`
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

  const onClick = (event, map) => {
    const clickMode = localStorage.getItem("clickMode") || 0;
    const clickModeOptions =
      JSON.parse(localStorage.getItem("clickModeOptions")) || {};
    const clickedCoord = transform(event.coordinate, PROJECTION, "EPSG:4326");

    if (clickMode == MODES.DEFAULT) {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        if (feature.get("siteid") !== undefined) {
          selectSite(feature.get("siteid"));
          return;
        }

        if (ObjectIsEmpty(profile)) return;

        switch (feature.get("type")) {
          case "poi":
            const poi = getPOIs();
            if (!poi[feature.get("name")]) {
              console.warn(
                `[MAP,POI] poi ${feature.get("name")} doesn't exist in the POIs`
              );
              break;
            }

            if (!getOrigin()) {
              console.debug(`[MAP,POI] setting poi as origin`);
              setOrigin(poi[feature.get("name")]);
            }

            if (getOrigin()) {
              console.debug("[MAP,POI] setting poi as destination.");
              setDest(poi[feature.get("name")]);
            }
            break;
        }
      });
    } else if (clickMode == MODES.ADD_HOME) {
      // post the new home.
      setHome(profile, clickedCoord);
      // reset the mode.
      setClickMode(MODES.DEFAULT);
      // reset the map.
      triggerReload(true);
    } else if (clickMode == MODES.ADD_WORK) {
      setWork(profile, clickedCoord);
      setClickMode(MODES.DEFAULT);
      triggerReload(true);
    } else if (clickMode == MODES.ADD_POI) {
      setCustomLocation(profile, clickModeOptions.poi_name, clickedCoord);
      setClickMode(MODES.DEFAULT);
      triggerReload(true);
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
      <LoadingSplash
        fadeIn={loadingStations || loadingPrices || loadingRouting}
      />
      <MapContainer
        layer={stationLayer}
        layers={layers}
        mapCenter={center}
        onInit={onInit}
        onClick={onClick}
        onMove={onMove}
        darkMode={darkMode}
      />
    </>
  );
};

export default PetrolMap;
