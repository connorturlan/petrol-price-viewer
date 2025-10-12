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
import { Circle, LineString, Point, Polygon } from "ol/geom";
import { Feature } from "ol";
import StationModal from "../../components/StationModal/StationModal";
import {
  boundingExtent,
  containsCoordinate,
  containsExtent,
  getArea,
  getCenter,
  intersects,
  returnOrUpdate,
} from "ol/extent";
import LoadingSplash from "../../components/LoadingSplash/LoadingSplash";
import {
  addPOIs,
  addRoutes,
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
  getLowestStationsFromArray,
  getSites,
  setStationsOnRoute,
  updateClusterWithChargerCount,
  updateClusterWithLowestPrice,
  updateLowestPrices,
  updateStationsWithLowestPrice,
} from "./utils";
import { MAX_STATION_REQUEST, PROJECTION } from "../../utils/defaults";
import { AppContext } from "../../contexts/AppContext";
import { UserContext } from "../../contexts/UserContext";
import {
  convertCoord,
  convertCoordFromLatLon,
  ObjectIsEmpty,
} from "../../utils/utils";
import { getRoutesBetweenPoints } from "../../utils/navigation";
import { fromExtent } from "ol/geom/Polygon";
import { RouteContext } from "../../contexts/RouteContext";
// import { getFuelPrices } from "../../services/service";
import {
  getFuelPrices,
  getPricesFromSectors,
  getSectors,
} from "../../services/StationPriceManager/StationPriceManager.service";
import Style, { createDefaultStyle } from "ol/style/Style";
import { updateAllStations } from "../../services/StationPriceManager/StationPriceManager.service";
import { FitMapToExtent, MapMoveTo, UseSub } from "../../utils/pubsub";
import { getCookie } from "../../utils/cookies";
import { getDistance, getLength } from "ol/sphere";
import {
  customStyle,
  stationDefaultStyle,
  stationMinimalStyle,
  stationRoundelStyle,
} from "./styles";
import { red } from "@mui/material/colors";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import { toRadians } from "ol/math";
import FeatureFormat from "ol/format/Feature";

export const MODES = Object.freeze({
  DEFAULT: 0,
  ADD_HOME: 1,
  ADD_WORK: 2,
  ADD_POI: 3,
});

const MAP_CENTER = getCookie("mapCenter")
  ? JSON.parse(getCookie("mapCenter")) || [138.599503, -34.92123]
  : [138.599503, -34.92123];

const PetrolMap = ({ fuelType, updateStations }) => {
  const { setClickMode, clickModeOptions, selectSite, darkMode } =
    useContext(AppContext);
  const {
    setHome,
    setWork,
    setCustomLocation,
    profile,
    POI,
    getPOIs,
    loginState,
  } = useContext(UserContext);
  const { origin, setOrigin, getOrigin, dest, setDest, getDest } =
    useContext(RouteContext);

  const newCenter =
    !ObjectIsEmpty(profile) && !ObjectIsEmpty(POI) && !ObjectIsEmpty(POI.home)
      ? [POI.home.Lat, POI.home.Lng]
      : MAP_CENTER;
  const [center, setCenter] = useState(newCenter);

  const [allStations, setAllStations] = useState([]);
  const [loadingStations, setStationLoading] = useState(false);
  const [loadingPrices, setPricesLoading] = useState(false);

  const [visibleBounds, setVisibleBounds] = useState([0, 0, 0, 0]);

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const [filter, setFilter] = useState({});

  const stationLayer = useRef(undefined);
  const stationLayerDefault = useRef(undefined);
  const stationLayerMinimal = useRef(undefined);
  const stationLayerRoundel = useRef(undefined);
  const stationLayerPinPrick = useRef(undefined);
  const drawingLayer = useRef(undefined);
  const markerLayer = useRef(undefined);
  const waypointLayer = useRef(undefined);
  const debugLayer = useRef(undefined);
  const [layers, setLayers] = useState([]);

  const setupMapLayers = async () => {
    stationLayer.current = createStationLayer(
      [],
      darkMode,
      stationMinimalStyle
    );
    drawingLayer.current = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: "#97f79740",
        }),
        stroke: new Stroke({
          color: "#81c981",
          width: 4,
        }),
      }),
    });
    (debugLayer.current = new VectorLayer({
      source: new VectorSource(),
      style: (feature) => {
        return new Style({
          fill: new Fill({
            color: "#7fdfe233",
          }),
          stroke: new Stroke({
            color: "#7fdfe2ff",
            width: feature.get("insideView") ? 8 : 2,
          }),
          text: new Text({
            text: feature.get("id"),
            font: "italic 12pt sans-serif",
          }),
        });
      },
    })),
      (markerLayer.current = createCustomLayer(POI));
    waypointLayer.current = createWaypointLayer(POI.home, POI.work);

    const debug = await getSectors();
    const source = debugLayer.current.getSource();
    const features = debug.map((sector) => {
      const tl = fromLonLat(sector.tl);
      const br = fromLonLat(sector.br);
      return new Feature({
        id: sector.id,
        geometry: fromExtent([...tl, ...br]),
        insideView: containsExtent(visibleBounds, [...tl, ...br]),
      });
    });
    source.addFeatures(features);

    const layers = [
      stationLayerDefault,
      stationLayerMinimal,
      stationLayerRoundel,
      stationLayerPinPrick,
    ];
    const styles = [
      stationDefaultStyle,
      stationMinimalStyle,
      stationRoundelStyle,
      stationDefaultStyle,
    ];
    layers.forEach((layer, index) => {
      console.log("adding to layer", index);
      const newLayer = new VectorLayer({
        source: new VectorSource({}),
        style: styles.at(index),
      });

      let point = new Point(
        fromLonLat([MAP_CENTER[0] + index / 100, MAP_CENTER[1]])
      );
      if (index == 2) {
        point = new Circle(
          fromLonLat([MAP_CENTER[0] + index / 100, MAP_CENTER[1]]),
          20
        );
      }
      console.log(point.getCoordinates());
      const feature = new Feature({
        geometry: point,
        id: -1,
        BrandID: 1,
        price: 198.9,
        SiteId: -1,
      });
      const source = newLayer.getSource();
      source.addFeature(feature);
      layer.current = newLayer;
    });

    setLayers([
      drawingLayer.current,
      // debugLayer.current,
      waypointLayer.current,
      stationLayer.current,
      // stationLayerDefault.current,
      // stationLayerMinimal.current,
      // stationLayerRoundel.current,
      // stationLayerPinPrick.current,
      markerLayer.current,
    ]);
  };

  const getAllSites = async () => {
    setStationLoading(true);
    const newStations = await updateAllStations();
    setAllStations(newStations);
    setStationLoading(false);
  };

  const resetFuelPrices = () => {
    if (!allStations) return;

    const newStations = allStations.slice().map((station) => {
      return { ...station, Price: 0 };
    });

    setAllStations(newStations);
  };

  const getSitePrices = async () => {
    if (!allStations || allStations.length <= 0) {
      return;
    }

    const stationsInView = allStations.filter((station) =>
      containsCoordinate(
        visibleBounds,
        fromLonLat([station.Lng, station.Lat], PROJECTION)
      )
    );

    const stationIds = stationsInView.map((station) => station.SiteId);

    const fuelPrices = await getFuelPrices(fuelType, stationIds);

    const index = Object.keys(fuelPrices);
    const updatedStations = allStations
      .map((station) => {
        if (index.includes(`${station.SiteId}`)) {
          station.Price = fuelPrices[`${station.SiteId}`];
        }

        return station;
      })
      .sort((a, b) => a.Price - b.Price);

    console.debug(
      `[PRICES] ${updatedStations.length} prices found for ${allStations.length} sites.`
    );

    setAllStations(updatedStations);
  };

  const updateStationsLayer = () => {
    // may be null on first render
    if (!allStations || allStations.length <= 0) return;

    const clusterSource = stationLayer.current.getSource();
    const source = clusterSource.getSource();
    source.clear();

    const filteredstations = allStations.filter(
      (station) =>
        station &&
        station.Price &&
        station.Price < 9999 &&
        containsCoordinate(
          visibleBounds,
          fromLonLat([station.Lng, station.Lat])
        ) &&
        station.SiteId != 61402476
    );
    console.log(filteredstations);

    let min, max;
    console.log(filteredstations.at(0), filteredstations.length);
    min = filteredstations.at(0)?.Price || 0;
    max = filteredstations.at(0)?.Price || 0;
    filteredstations.forEach((station) => {
      min = Math.min(min, station.Price);
      max = Math.max(max, station.Price);
    });
    console.log("mM:", min, max);

    const features = filteredstations.map((station) => {
      const coord = fromLonLat([station.Lng, station.Lat], PROJECTION);
      const point = new Point(coord);

      let price;
      if (fuelType < 10_000) {
        price = ((station.Price || 0) / 10).toFixed(1);
      } else {
        price = station.Price || 0;
      }

      const normalisedRange = (station.Price - max) / (min - max);

      return new Feature({
        coord,
        geometry: point,
        ...station,
        price: price || "loading...",
        normalisedRange,
      });
    });
    source.addFeatures(features);

    source.changed();

    console.debug(`[STATIONS] added ${filteredstations.length} stations.`);

    updateMapClusterValues();
  };

  const updateMapClusterValues = () => {
    if (!stationLayer.current) return;
    if (fuelType >= 10_000) {
      updateClusterWithChargerCount(stationLayer.current.getSource());
    } else {
      updateClusterWithLowestPrice(stationLayer.current.getSource());
    }
    stationLayer.current?.getSource()?.changed();
  };

  const drawCircle = (coord, radius) => {
    if (!coord || !radius) return;
    const point = new Circle(coord, radius);
    const feature = new Feature({ geometry: point });
    const source = drawingLayer.current.getSource();
    source.addFeature(feature);
    return point;
  };

  useEffect(() => {
    setupMapLayers();
    getAllSites();
  }, []);

  useEffect(() => {
    if (!loadingPrices) {
      setPricesLoading(true);
      getSitePrices();
    } else {
      setPricesLoading(false);
      updateStationsLayer();
      updateStations(allStations);
    }
    drawCircle(fromLonLat(center, PROJECTION));
  }, [allStations, visibleBounds]);

  // useEffect(() => {
  //   if (!loadingPrices) {
  //     setPricesLoading(true);
  //     getSitePrices();
  //   } else {
  //     setPricesLoading(false);
  //   }
  // }, [visibleBounds]);

  const updateMarkerLayer = () => {
    const source = markerLayer.current.getSource();
    source.clear();
    addPOIs(source, POI);
  };

  useEffect(() => {
    updateMarkerLayer();
  }, [profile, POI]);

  useEffect(() => {
    let newCenter = MAP_CENTER;
    if (!ObjectIsEmpty(profile)) {
      if (!ObjectIsEmpty(POI) && !ObjectIsEmpty(POI.home))
        newCenter = [POI.home.Lat, POI.home.Lng];
    }

    setCenter(newCenter);
  }, [profile, POI, loginState]);

  useEffect(() => {
    const points = [];

    if (!ObjectIsEmpty(origin))
      points.push(convertCoord([origin.Lat, origin.Lng]));
    if (!ObjectIsEmpty(dest)) points.push(convertCoord([dest.Lat, dest.Lng]));

    if (points.length <= 0) return;

    const extent = boundingExtent(points);

    FitMapToExtent(extent);
  }, [origin, dest]);

  useEffect(() => {
    const getRoutes = async () => {
      const newRoutes = await getRoutesBetweenPoints(origin, dest);
      setRoutes(newRoutes || []);
      setLoadingRoutes(false);
    };

    setLoadingRoutes(true);
    setTimeout(getRoutes, 800);
    // getRoutes();
  }, [origin, dest]);

  const updateWaypointLayer = () => {
    const source = waypointLayer.current.getSource();
    source.clear();
    addRoutes(source, routes);
  };

  const updateOnRouteStations = async () => {
    setLoadingRoutes(true);
    const stationsOnRoute = routes.flatMap((route) => {
      return getFeaturesAvailableOnRoute(route, allStations);
    });

    console.debug(
      `[ROUTING] ${stationsOnRoute.length} points added of ${routes.length} routes`
    );

    const lowestFeatures = getLowestStationsFromArray(stationsOnRoute);
    const lowestIds = lowestFeatures.map((feature) => feature.SiteId);

    const updatedStations = allStations.map((station) => {
      return { ...station, isOnRoute: lowestIds.includes(station.SiteId) };
    });

    setAllStations(updatedStations);
    setLoadingRoutes(false);
  };

  useEffect(() => {
    // resetFuelPrices();
    updateMapClusterValues();
  }, [fuelType]);

  useEffect(() => {
    updateWaypointLayer();
    updateOnRouteStations();
    updateMapClusterValues();
  }, [routes, fuelType]);

  const handleFilter = () => {
    if (!filter || !filter.center) return;

    console.log("[FILTER] getting features within range");

    const filterCenter = fromLonLat(
      [filter.center.Lat, filter.center.Lng],
      PROJECTION
    );
    const filterDistance = filter.distance;

    const source = drawingLayer.current.getSource();
    source.clear();
    const circle = drawCircle(
      filterCenter,
      filterDistance * (0.9 / Math.abs(Math.cos(toRadians(filter.center.Lat))))
    );
    FitMapToExtent(circle.getExtent());

    const stationsInRange = [];

    const updatedInRangeStations = allStations.map((station) => {
      const coord = fromLonLat([station.Lng, station.Lat], PROJECTION);
      const distance = getDistance(
        [filter.center.Lat, filter.center.Lng],
        [station.Lng, station.Lat]
      );
      // const line = new LineString([filterCenter, coord]);
      // const distance = getLength(line);
      const inRange = distance < filterDistance;

      if (inRange) {
        stationsInRange.push(station);
      }

      // console.log(station.SiteId, filterCenter, coord, distance, inRange);
      return { ...station, inRange };
    });

    console.debug(`[FILTER] ${stationsInRange.length} stations in range`);

    const lowestStation = getLowestStationsFromArray(stationsInRange);
    const lowestPrice = lowestStation.at(0).Price;
    // console.log(lowestStation, lowestPrice);

    const updatedLowestStations = updatedInRangeStations.map((station) => {
      return {
        ...station,
        lowestInRange: station.inRange && station.Price <= lowestPrice,
      };
    });

    setAllStations(updatedLowestStations);
  };

  useEffect(() => {
    handleFilter(filter);
  }, [filter]);

  UseSub("UpdateDistanceFilter", (data) => {
    setFilter(data);
  });

  const updateInViewSectors = async (bounds) => {
    if (!debugLayer.current) return;

    const source = debugLayer.current.getSource();
    const sectors = source
      .getFeatures()
      .filter((sector) => {
        const extent = sector.get("geometry").getExtent();
        const insideBounds = intersects(bounds, extent);
        sector.set("insideView", insideBounds);
        return insideBounds;
      })
      .map((sector) => sector.get("id"));
    source.changed();

    const uniqueSet = new Set(sectors);
    const uniqueArray = [...uniqueSet];

    await getPricesFromSectors(uniqueArray);

    await getSitePrices();
  };

  const onInit = (map) => {
    if (!map) return;

    const extent = map.getView().calculateExtent(map.getSize());
    setVisibleBounds(extent);

    updateMapClusterValues();
    updateInViewSectors(extent);
  };

  const onMove = (event, map) => {
    if (!map) return;

    const extent = map.getView().calculateExtent(map.getSize());
    setVisibleBounds(extent);

    updateMapClusterValues();
    updateInViewSectors(extent);
  };

  const onClick = (event, map) => {
    if (!map) return;

    const clickMode = localStorage.getItem("clickMode") || 0;
    const clickModeOptions =
      JSON.parse(localStorage.getItem("clickModeOptions")) || {};
    const clickedCoord = transform(event.coordinate, PROJECTION, "EPSG:4326");

    if (clickMode == MODES.DEFAULT) {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        if (feature.get("SiteId") !== undefined) {
          MapMoveTo({ coord: feature.get("coord") });
          selectSite(feature.get("SiteId"));
          console.log(feature.get("SiteId"));
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
      // triggerReload(true);
    } else if (clickMode == MODES.ADD_WORK) {
      setWork(profile, clickedCoord);
      setClickMode(MODES.DEFAULT);
      // triggerReload(true);
    } else if (clickMode == MODES.ADD_POI) {
      setCustomLocation(profile, clickModeOptions.poi_name, clickedCoord);
      setClickMode(MODES.DEFAULT);
      // triggerReload(true);
    }
  };

  const isLoading = loadingStations || loadingPrices || loadingRoutes;

  return (
    <div className={styles.PetrolMap}>
      <LoadingSplash fadeIn={isLoading} />
      <MapContainer
        layers={layers}
        mapCenter={center}
        onInit={onInit}
        onClick={onClick}
        onMove={onMove}
        darkMode={darkMode}
      />
    </div>
  );
};

export default PetrolMap;
