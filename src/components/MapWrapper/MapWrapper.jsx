// react
import React, { useState, useEffect, useRef } from "react";
import styles from "./MapWrapper.module.scss";

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
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import MapRenderer from "ol/renderer/Map";

const mapCenter = [138.599503, -34.92123];
const projection = "EPSG:4326";

function MapWrapper({ features, updateVisibleFeatures }) {
  // set intial state
  const [map, setMap] = useState();
  const [featuresLayer, setFeaturesLayer] = useState();
  const [selectedCoord, setSelectedCoord] = useState();

  const renderCount = useRef(0);

  // pull refs
  const mapElement = useRef();

  const mapRef = useRef();
  mapRef.current = map;

  const featureRef = useRef();
  featureRef.current = featuresLayer;

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    if (renderCount.current > 0) {
      return;
    }
    renderCount.current += 1;

    const style = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "red-pin.svg",
        height: "48",
      }),
      text: new Text({
        offsetY: "24",
        font: "bold 12pt sans-serif",
        fill: new Fill({
          color: "#555",
        }),
      }),
    });

    const initialSource = new VectorSource();

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: initialSource,
      style: (feature) => {
        style
          .getText()
          .setText([
            `${feature.get("name")}`,
            "bold 12pt sans-serif",
            "\n",
            "",
            `${feature.get("price")}`,
            "italic 12pt sans-serif",
          ]);
        return style;
      },
    });

    // let marker = new Feature(new Point(fromLonLat(mapCenter, projection)));
    // initalFeaturesLayer.getSource().addFeature(marker);

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

    // initialMap.on("singleclick", (event) => {
    // 	initialMap.forEachFeatureAtPixel(event.pixel, (feature) => {
    // 	  console.log(feature);
    // 	});
    // });

    initialMap.on("pointermove", function (e) {
      const pixel = initialMap.getEventPixel(e.originalEvent);
      const hit = initialMap.hasFeatureAtPixel(pixel);
      initialMap.getTarget().style.cursor = hit ? "pointer" : "";
    });

    // save map and vector layer references to state
    setMap(initialMap);
    setFeaturesLayer(initalFeaturesLayer);

    initialMap.on("moveend", updatePricesWithinMap);
  }, []);

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {
    // may be null on first render
    if (!map || !features || features.length <= 0) {
      return;
    }

    const source = new VectorSource();

    const filteredFeatures = features.filter((feature) => feature.Price);

    filteredFeatures.forEach((feature) => {
      const point = new Point(
        fromLonLat([feature.Lng, feature.Lat], projection)
      );
      const marker = new Feature({
        geometry: point,
        siteid: feature.SiteId,
        name: feature.Name,
        price: feature.Price || "loading...",
        placeid: feature.GPI,
      });
      source.addFeature(marker);
    });

    featuresLayer.setSource(source);
    setFeaturesLayer(featuresLayer);

    console.log(`added ${filteredFeatures.length} features.`);
  }, [features]);

  const handleMapClick = (event) => {
    const clickedCoord = event.coordinate;
    setSelectedCoord(clickedCoord);

    mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => {
      console.log(feature);
      console.log(feature.get("siteid"));

      window.open(
        `https://www.google.com/maps/place/?q=place_id:${feature.get(
          "placeid"
        )}`,
        "_blank"
      );
    });
  };

  const updatePricesWithinMap = (event) => {
    if (!featureRef.current) {
      return;
    }

    const extent = mapRef.current
      .getView()
      .calculateExtent(mapRef.current.getSize());

    updateVisibleFeatures(extent);

    console.log("updated extent");
  };

  // render component
  return (
    <>
      <div ref={mapElement} className={styles.Map_Container}></div>

      <div className={styles.Map_Coord}>
        <p>{selectedCoord ? toStringXY(selectedCoord, 5) : ""}</p>
      </div>
    </>
  );
}

export default MapWrapper;
