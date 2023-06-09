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
import { transform } from "ol/proj";
import { toStringXY } from "ol/coordinate";

const mapCenter = [138.599503, -34.92123];

function MapWrapper(props) {
	// set intial state
	const [map, setMap] = useState();
	const [featuresLayer, setFeaturesLayer] = useState();
	const [selectedCoord, setSelectedCoord] = useState();

	// pull refs
	const mapElement = useRef();

	// create state ref that can be accessed in OpenLayers onclick callback function
	//  https://stackoverflow.com/a/60643670
	const mapRef = useRef();
	mapRef.current = map;

	// initialize map on first render - logic formerly put into componentDidMount
	useEffect(() => {
		// create and add vector source layer
		const initalFeaturesLayer = new VectorLayer({
			source: new VectorSource(),
		});

		// create map
		const initialMap = new Map({
			target: mapElement.current,
			layers: [
				// // OSM Topo
				// new TileLayer({
				// 	source: new OSM({
				// 		// url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
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
				projection: "EPSG:4326",
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
		if (props.features.length) {
			// may be null on first render

			// set features to map
			featuresLayer.setSource(
				new VectorSource({
					features: props.features, // make sure features is an array
				})
			);

			// fit map to feature extent (with 100px of padding)
			// map.getView().fit(featuresLayer.getSource().getExtent(), {
			// 	padding: [100, 100, 100, 100],
			// });
		}
	}, [props.features]);

	// map click handler
	const handleMapClick = (event) => {
		// get clicked coordinate using mapRef to access current React state inside OpenLayers callback
		//  https://stackoverflow.com/a/60643670
		const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

		// transform coord to EPSG 4326 standard Lat Long
		const transormedCoord = transform(
			clickedCoord,
			"EPSG:3857",
			"EPSG:4326"
		);

		// set React state
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
