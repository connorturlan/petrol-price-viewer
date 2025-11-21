import { useEffect, useRef, useState } from "react";
import styles from "./MapContainer.module.scss";

// openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { PROJECTION } from "../../utils/defaults";
import { fromLonLat, transform } from "ol/proj";
import { convertCoord, ObjectIsEmpty } from "../../utils/utils";
import Style from "ol/style/Style";
import { UseSub } from "../../utils/pubsub";
import { duration } from "@mui/material";

// https://gist.github.com/bokub/dd85ffe1368bb10396f871111dff7201 - free map tiles
const lightMapLayers = [
  "https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png",
  "http://c.tile.opentopomap.org/{z}/{x}/{y}.png",
  "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
  "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
];

const mapLayer = new TileLayer({
  source: new XYZ({
    url: lightMapLayers.at(5),
    transition: 0,
  }),
});

const darkMapLayer = new TileLayer({
  source: new XYZ({
    url: lightMapLayers.at(6),
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

  UseSub("MapMoveTo", (newView) => {
    if (ObjectIsEmpty(newView) || !newView.coord || newView.coord.length <= 0) {
      console.error(
        `[MAP]<event> map move triggered to invalid position:`,
        newView
      );
      return;
    }
    console.log(`[MAP]<event> map move to ${newView.coord}`);
    const zoom = newView.zoom || 16;
    mapRef.current.getView().animate({
      center: newView.coord,
      duration: 400,
      zoom: zoom,
    });
  });

  UseSub("MapFitTo", (newExtent) => {
    if (ObjectIsEmpty(newExtent)) {
      console.error(
        `[MAP]<event> map move triggered to invalid position. ${newExtent}`
      );
      return;
    }

    console.log(`[MAP]<event> map move to ${newExtent}`);
    mapRef.current.getView().fit(newExtent, {
      size: mapRef.current.getSize(),
      minResolution: 2,
      duration: 800,
      padding: [48, 48, 48, 48],
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

    initialMap.on("zoomend", (event) => {
      onMove && onMove(event, mapRef.current);
    });

    setMap(initialMap);
    mapRef.current = initialMap;
    onInit && onInit(initialMap);
  }, []);

  useEffect(() => {
    console.debug("[MAP] updating layers");
    if (!map) return;
    // mapLayers.current = [darkMode ? darkMapLayer : mapLayer, ...layers];
    map.setLayers(mapLayers.current);
    console.log(mapLayers.current);
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
