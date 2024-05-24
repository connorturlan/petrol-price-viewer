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
import Stroke from "ol/style/Stroke";
import { containsCoordinate } from "ol/extent";

const mapCenter = [138.599503, -34.92123];
const projection = "EPSG:4326";

function MapWrapper({
  features,
  updateVisibleFeatures,
  updateModalDetails,
  showModal,
}) {
  // set intial state
  const [map, setMap] = useState();
  const [view, setView] = useState();
  const [featuresLayer, setFeaturesLayer] = useState();
  const [lowestLayer, setLowestFeaturesLayer] = useState();
  const [selectedCoord, setSelectedCoord] = useState();

  const renderCount = useRef(0);

  // pull refs
  const mapElement = useRef();

  const mapRef = useRef();
  mapRef.current = map;

  const viewRef = useRef();
  viewRef.current = view;

  const featureRef = useRef();
  featureRef.current = featuresLayer;

  const lowestRef = useRef();
  lowestRef.current = lowestLayer;

  const featuresRef = useRef();
  featuresRef.current = features;

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    if (renderCount.current > 0) {
      return;
    }
    renderCount.current += 1;

    const defaultStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "red-pin.svg",
        height: "32",
      }),
      text: new Text({
        offsetY: "12",
        font: "bold 12pt sans-serif",
        fill: new Fill({
          color: "#555",
        }),
        backgroundFill: new Fill({
          color: "#EEE",
        }),
        backgroundStroke: new Stroke({
          color: "#555",
          width: "1",
          lineCap: "butt",
        }),
        padding: [2, 4, 2, 4],
      }),
    });

    const initialSource = new VectorSource();

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: initialSource,
      style: (feature) => {
        defaultStyle
          .getText()
          .setText([`${feature.get("price")}`, "italic 12pt sans-serif"]);
        return defaultStyle;
      },
    });

    const lowestStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "red-pin.svg",
        height: "48",
      }),
      text: new Text({
        offsetY: "12",
        font: "italic 12pt sans-serif",
        fill: new Fill({
          color: "#555",
        }),
        backgroundFill: new Fill({
          color: "yellow",
        }),
        backgroundStroke: new Stroke({
          color: "orange",
          width: "2",
          miterLimit: 2,
        }),
        padding: [2, 4, 2, 4],
      }),
    });
    const initialLowestSource = new VectorSource();

    // create and add vector source layer
    const initalLowestLayer = new VectorLayer({
      source: initialLowestSource,
      style: (feature) => {
        lowestStyle.getText().setText([`${feature.get("price")}`, ""]);
        return lowestStyle;
      },
    });

    // let marker = new Feature({
    //   geometry: new Point(fromLonLat(mapCenter, projection)),
    //   name: "hello, world!",
    // });
    // initalLowestLayer.getSource().addFeature(marker);

    // create the map view.
    const view = new View({
      projection: projection,
      center: mapCenter,
      zoom: 13,
    });

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        // // OSM Topo
        // new TileLayer({
        //   source: new OSM({
        //     url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        //   }),
        // }),

        // Google Maps Terrain
        new TileLayer({
          source: new XYZ({
            url: "https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
          }),
        }),

        initalFeaturesLayer,
        initalLowestLayer,
      ],
      view,
      controls: [],
    });

    // set map onclick handler
    initialMap.on("singleclick", handleMapClick);

    initialMap.on("pointermove", function (e) {
      const pixel = initialMap.getEventPixel(e.originalEvent);
      const hit = initialMap.hasFeatureAtPixel(pixel);
      initialMap.getTarget().style.cursor = hit ? "pointer" : "";
    });

    initialMap.on("moveend", handleMapMove);
    handleMapMove();

    // save map and vector layer references to state
    setMap(initialMap);
    setView(view);
    setFeaturesLayer(initalFeaturesLayer);
    setLowestFeaturesLayer(initalLowestLayer);
  }, []);

  const updateFeatures = () => {
    // may be null on first render
    if (!map || !featureRef.current || !features || features.length <= 0) {
      return;
    }

    const source = new VectorSource();
    featureRef.current.setSource(source);
    const filteredFeatures = features.filter((feature) => feature.Price);

    filteredFeatures.forEach((feature) => {
      const point = new Point(
        fromLonLat([feature.Lng, feature.Lat], projection)
      );

      let price = ((feature.Price || 0) / 10).toFixed(1);

      const marker = new Feature({
        geometry: point,
        siteid: feature.SiteId,
        name: feature.Name,
        price: price || "loading...",
        placeid: feature.GPI,
      });
      source.addFeature(marker);
      return marker;
    });
    console.log(`added ${filteredFeatures.length} features.`);

    const lowestSource = new VectorSource();
    lowestRef.current.setSource(lowestSource);

    const lowestPrice = features.reduce(
      (currentLowest, site) =>
        currentLowest.Price < site.Price ? currentLowest : site,
      features[0]
    );

    const lowestSites = features.filter(
      (currentSite) => currentSite.Price <= lowestPrice.Price
    );

    lowestSites.forEach((feature) => {
      const point = new Point(
        fromLonLat([feature.Lng, feature.Lat], projection)
      );

      let price = ((feature.Price || 0) / 10).toFixed(1);

      const marker = new Feature({
        geometry: point,
        siteid: feature.SiteId,
        name: feature.Name,
        price: price || "loading...",
        placeid: feature.GPI,
      });

      console.log("lowest site found:", feature);
      lowestSource.addFeature(marker);
    });
  };

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {
    updateFeatures();
  }, [features]);

  const handleMapClick = (event) => {
    mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => {
      updateModalDetails(feature.get("siteid"));
      console.log(feature);
      showModal();

      viewRef.current.setCenter(feature.get("geometry").getCoordinates());
    });
  };

  const handleMapMove = (event) => {
    if (!featureRef.current) {
      return;
    }

    const extent = mapRef.current
      .getView()
      .calculateExtent(mapRef.current.getSize());

    updateVisibleFeatures(extent);
  };

  // render component
  return (
    <>
      <div ref={mapElement} className={styles.Map_Container}></div>
    </>
  );
}

export default MapWrapper;
