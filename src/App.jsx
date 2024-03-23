import React, { useState, useEffect } from "react";
import MapWrapper from "./components/MapWrapper/MapWrapper";
import styles from "./App.module.scss";
import fueltypes from "./assets/fueltypes.json";
import "./App.css";
import { containsCoordinate } from "ol/extent";

const endpoint =
  import.meta.env.VITE_LOCAL == "TRUE"
    ? "http://localhost:3000"
    : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod";

function App() {
  // set intial state
  const [featureIndex, setFeatureIndex] = useState({});
  const [allFeatures, setFeatures] = useState([]);
  const [mapFeatures, setMapFeatures] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState([0, 0, 0, 0]);

  const [modalDetails, setModalDetails] = useState({});
  const [modalVisible, setModalVisibility] = useState(false);

  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);

  const [fuelType, setFuelType] = useState(2);

  const getSites = async () => {
    const res = await fetch(endpoint + "/sites");
    if (res.status != 200) {
      window.alert("site data not found.");
      return;
    }
    const json = await res.json();
    const index = json.reduce((siteindex, site, i) => {
      siteindex[site.SiteId] = i;
      return siteindex;
    }, {});

    setFeatures(json);
    setFeatureIndex(index);

    console.log(
      `updated ${json.length} features, added ${
        Object.keys(index).length
      } features to index.`
    );

    setFeaturesLoading(false);
  };

  const getSitePrices = async () => {
    if (!allFeatures) {
      return;
    }

    setPricesLoading(true);

    const body = allFeatures
      .filter((feature) => {
        return feature.Price === undefined;
      })
      .filter((feature) => {
        return containsCoordinate(visibleFeatures, [feature.Lng, feature.Lat]);
      })
      .map((feature) => feature.SiteId);

    if (body.length <= 0) {
      console.log("no new data to fetch.");
      setPricesLoading(false);
      return;
    }
    console.log(`requesting data for ${body.length} sites`);

    const res = await fetch(endpoint + `/prices?fuelType=${fuelType}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.status != 200) {
      window.alert("error while handling site prices.");
      return;
    }

    const json = await res.json();

    const newFeatures = allFeatures;

    Object.entries(json).forEach((siteEntry) => {
      const [siteId, sitePrice] = siteEntry;
      const siteIndex = featureIndex[siteId];
      if (!siteIndex) {
        return undefined;
      }

      const feature = newFeatures[siteIndex];
      feature.Price = (sitePrice / 1000).toLocaleString("en-AU", {
        style: "currency",
        currency: "AUD",
      });

      return feature;
    });

    const filteredFeatures = newFeatures
      .sort((a, b) => a.Price - b.Price)
      .filter((feature) => feature.Price)
      .filter((feature) => {
        return (
          !visibleFeatures ||
          containsCoordinate(visibleFeatures, [feature.Lng, feature.Lat])
        );
      });

    console.log(
      `${filteredFeatures.length} prices found for ${allFeatures.length} sites`
    );

    if (filteredFeatures.length <= 0) {
      window.alert(`no site returned for fuel type ${fuelType}`);
    }

    setMapFeatures(filteredFeatures);

    setPricesLoading(false);
  };

  const resetFuelPrices = () => {
    if (!allFeatures) {
      return;
    }

    const newFeatures = allFeatures.map((feature) => {
      feature.Price = undefined;
      return feature;
    });
    setMapFeatures(newFeatures);
  };

  const handleFuelChange = (event) => {
    setFuelType(event.target.value);
  };

  const getModalDetails = () => {
    if (!allFeatures) {
      return;
    }

    const siteId = modalDetails;
    const index = featureIndex[siteId];
    if (!index) {
      return;
    }
    const siteDetails = allFeatures[index];

    return (
      <div className={styles.App_Modal__Blackout}>
        <div className={styles.App_Modal}>
          <p>{siteDetails.Name}</p>
          <p>{siteDetails.Price}</p>
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${siteDetails.GPI}`}
            target="_blank"
          >
            Navigate
          </a>

          <button
            onClick={() => {
              setModalVisibility(false);
            }}
          >
            hide
          </button>
        </div>
      </div>
    );
  };

  const showModal = () => {
    setModalVisibility(true);
  };

  useEffect(() => {
    getSites();
  }, []);

  useEffect(() => {
    if (featuresLoading || !allFeatures) {
      return;
    }
    getSitePrices();
  }, [allFeatures, visibleFeatures, featuresLoading]);

  useEffect(() => {
    resetFuelPrices();
    getSitePrices();
  }, [fuelType]);

  return (
    <div className={styles.App}>
      <div className={styles.App_Label + " " + styles.App_FuelSelector}>
        <p>Select Fuel</p>
        <select onChange={handleFuelChange}>
          {fueltypes["Fuels"].map((t) => {
            return (
              <option key={t.FuelId} value={t.FuelId}>
                {t.Name}
              </option>
            );
          })}
        </select>
      </div>

      {featuresLoading || pricesLoading ? (
        <div className={styles.App_Loader + " " + styles.App_Loader__FadeIn}>
          <div className={styles.lds_dual_ring}></div>
          <p>loading...</p>
        </div>
      ) : (
        <div
          className={styles.App_Loader + " " + styles.App_Loader__FadeOut}
        ></div>
      )}

      {modalVisible && getModalDetails()}

      <MapWrapper
        features={mapFeatures}
        updateVisibleFeatures={setVisibleFeatures}
        updateModalDetails={setModalDetails}
        showModal={showModal}
      />

      <div className={styles.App_Info}>
        <p>
          Connor Turlan 2024 -{" "}
          <a href="https://github.com/connorturlan/petrol-price-viewer">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
