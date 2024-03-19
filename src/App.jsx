import React, { useState, useEffect } from "react";
import GeoJSON from "ol/format/GeoJSON";
import MapWrapper from "./components/MapWrapper";
import "./App.css";

function App() {
  // set intial state
  const [features, setFeatures] = useState([]);

  const getSites = async () => {
    const res = await fetch("http://localhost:3000/sites");
    const json = await res.json();

    console.log(json);

    setFeatures(json.map((site) => [site.Lat, site.Lng]));
  };

  // initialization - retrieve GeoJSON features from Mock JSON API get features from mock
  //  GeoJson API (read from flat .json file in public directory)
  useEffect(() => {
    getSites();
  }, []);

  return (
    <div className="App">
      <div className="app-label">
        <p>React Functional Components with OpenLayers Example</p>
        <p>Click the map to reveal location coordinate via React State</p>
      </div>

      {features.length > 0 && <MapWrapper features={features} />}

      <div className="map-label app-info">
        <p>
          Connor Turlan 2023 -{" "}
          <a href="https://github.com/connorturlan/petrol-price-viewer">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
