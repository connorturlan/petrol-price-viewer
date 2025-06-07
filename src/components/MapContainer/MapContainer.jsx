import { useEffect, useRef, useState } from "react";
import styles from "./MapContainer.module.scss";

// openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { PROJECTION } from "../../utils/defaults";
import { fromLonLat, transform } from "ol/proj";
import { convertCoord } from "../../utils/utils";
import Style from "ol/style/Style";
import { UseSub } from "../../utils/pubsub";
import { duration } from "@mui/material";

const mapLayer = new TileLayer({
  source: new XYZ({
    url: "https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
    transition: 0,
  }),
});

const darkMapLayer = new TileLayer({
  source: new XYZ({
    url: "https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=xENXsVIdAZcfTT1E5DpW",
    transition: 0,
  }),
});

const MapContainer = ({
  layers,
  onInit,
  onClick,
  onMove,
  mapCenter,
  darkMode,
}) => {
  const [map, setMap] = useState();
  // const [mapLayers, setMapLayers] = useState();

  const renderCount = useRef(0);
  const mapElement = useRef();
  const viewRef = useRef(null);

  const mapRef = useRef();
  mapRef.current = map;

  const mapLayers = useRef([]);
  mapLayers.current = [darkMode ? darkMapLayer : mapLayer, ...layers];

  UseSub("MapMoveTo", (data) => {
    mapRef.current.getView().animate({
      center: data,
      duration: 1000,
    });
  });

  useEffect(() => {
    if (renderCount.current > 0) return;
    renderCount.current = 1;

    const view = new View({
      projection: PROJECTION,
      center: transform(mapCenter, "EPSG:4326", PROJECTION),
      zoom: 13,
    });
    viewRef.current = view;

    const initialMap = new Map({
      target: mapElement.current,
      layers: mapLayers.current,
      view,
      controls: [],
    });

    initialMap.on("singleclick", (event) => {
      onClick && onClick(event, mapRef.current);
    });

    initialMap.on("pointermove", function (e) {
      const pixel = initialMap.getEventPixel(e.originalEvent);
      const hit = initialMap.hasFeatureAtPixel(pixel);
      initialMap.getTarget().style.cursor = hit ? "pointer" : "";
    });

    initialMap.on("moveend", (event) => {
      onMove && onMove(event, mapRef.current);
    });

    setMap(initialMap);
    mapRef.current = initialMap;
    onInit && onInit(initialMap);
  }, []);

  useEffect(() => {
    console.debug("[MAP] updating layers");
    if (!map) return;
    map.setLayers(mapLayers.current);
  }, [layers]);

  useEffect(() => {
    console.debug("[MAP] updating center");
    if (!map) return;
    map.getView().animate({
      center: convertCoord(mapCenter),
      duration: 1000,
    });
  }, [mapCenter]);

  useEffect(() => {
    console.debug("[MAP] updating dark mode");
    if (!map) return;
    mapLayers.current = [darkMode ? darkMapLayer : mapLayer, ...layers];
    map.setLayers(mapLayers.current);
  }, [darkMode]);

  return <div ref={mapElement} className={styles.MapContainer}></div>;
};

export default MapContainer;
