import React, { useState, useEffect } from "react";
import MapWrapper from "./components/MapWrapper";
import "./App.css";

function App() {
  // set intial state
  const [features, setFeatures] = useState();

  const getSites = async () => {
    let endpoint =
      import.meta.env.VITE_LOCAL == "TRUE"
        ? "http://localhost:3000/sites"
        : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod/sites";

    const res = await fetch(endpoint);
    if (res.status != 200) {
      window.alert("site data not found.");
      return;
    }
    console.log("data found, parsing.");
    const json = await res.json();
    const coords = json.map((site) => [site.Lng, site.Lat]);
    setFeatures(json);
  };

  const dummyGetSites = async () => {
    setTimeout(() => {
      setFeatures([
        [0, 0],
        [1, 1],
      ]);
    }, 1000);
  };

  useEffect(() => {
    getSites();
    // dummyGetSites();
  }, []);

  return (
    <div className="App">
      <div className="app-label">
        <p>React Functional Components with OpenLayers Example</p>
        <p>Click the map to reveal location coordinate via React State</p>
      </div>

      <MapWrapper features={features} />

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
