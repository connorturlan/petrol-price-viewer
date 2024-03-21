// react
import React, { useState, useEffect, useRef } from "react";

// openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import OSM from "ol/source/OSM";
import { fromLonLat, transform } from "ol/proj";
import { toStringXY } from "ol/coordinate";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Feature } from "ol";
import { Point } from "ol/geom";

const mapCenter = [138.599503, -34.92123];
const projection = "EPSG:4326";

function MapWrapper({ features }) {
  // set intial state
  const [map, setMap] = useState();
  const [featuresLayer, setFeaturesLayer] = useState();
  const [selectedCoord, setSelectedCoord] = useState();

  const renderCount = useRef(0);

  // pull refs
  const mapElement = useRef();

  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef();
  mapRef.current = map;

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    if (renderCount.current > 0) {
      return;
    }
    renderCount.current += 1;

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "vite.svg",
        }),
      }),
    });

    let marker = new Feature(new Point(fromLonLat(mapCenter, projection)));
    initalFeaturesLayer.getSource().addFeature(marker);

    let marker2 = new Feature(
      new Point(fromLonLat([138.499503, -34.92123], projection))
    );
    initalFeaturesLayer.getSource().addFeature(marker2);

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        // // OSM Topo
        // new TileLayer({
        // 	source: new OSM({
        //    url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        // 	}),
        // }),

        // Google Maps Terrain
        new TileLayer({
          source: new XYZ({
            url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
          }),
        }),

        initalFeaturesLayer,
      ],
      view: new View({
        projection: projection,
        center: mapCenter,
        zoom: 13,
      }),
      controls: [],
    });

    // set map onclick handler
    initialMap.on("click", handleMapClick);

    // save map and vector layer references to state
    setMap(initialMap);
    setFeaturesLayer(initalFeaturesLayer);
  }, []);

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {
    // may be null on first render
    if (!map || !features || features.length <= 0) {
      return;
    }

    const source = new VectorSource();

    features.forEach((feature) => {
      const point = new Point(fromLonLat(feature, projection));
      const marker = new Feature({
        geometry: point,
        name: "fuel station",
      });
      source.addFeature(marker);
    });

    featuresLayer.setSource(source);

    console.log(`updated ${features.length} features.`);
  }, [features]);

  const handleMapClick = (event) => {
    const clickedCoord = event.coordinate;
    setSelectedCoord(clickedCoord);
  };

  // render component
  return (
    <>
      <div ref={mapElement} className="map-container"></div>

      <div className="map-label clicked-coord-label">
        <p>{selectedCoord ? toStringXY(selectedCoord, 5) : ""}</p>
      </div>
    </>
  );
}

export default MapWrapper;
