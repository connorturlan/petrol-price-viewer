import { useEffect, useRef, useState } from "react";
import styles from "./MapContainer.module.scss";

// openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { PROJECTION } from "../../utils/defaults";

const MapContainer = ({
  layers,
  onInit,
  onClick,
  onMove,
  mapCenter,
  darkMode,
}) => {
  const [map, setMap] = useState();

  const renderCount = useRef(0);
  const mapElement = useRef();

  const mapRef = useRef();
  mapRef.current = map;

  useEffect(() => {
    if (renderCount.current > 0) return;
    renderCount.current = 1;

    const view = new View({
      projection: PROJECTION,
      center: mapCenter,
      zoom: 13,
    });

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        // Google Maps Terrain
        new TileLayer({
          source: new XYZ({
            url: !darkMode
              ? "https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}"
              : "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          }),
        }),
        ...(layers || []),
      ],
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
    onInit && onInit(initialMap);
  }, []);

  return <div ref={mapElement} className={styles.MapContainer}></div>;
};

export default MapContainer;
