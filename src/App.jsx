import React, { useState, useEffect, useContext, createContext } from "react";
import MapWrapper from "./components/MapWrapper/MapWrapper";
import styles from "./App.module.scss";
import fueltypes from "./assets/fueltypes.json";
import "./App.css";
import { containsCoordinate } from "ol/extent";
import PriceList from "./components/PriceList/PriceList";
import StationModal from "./components/StationModal/StationModal";
import PriceListItem from "./components/PriceList/PriceListItem/PriceListItem";
import { getCookie, setCookie } from "./utils/cookies";
import FeatureContext from "./containers/FeatureContext/FeatureContext";
import GraphModal from "./components/GraphModal/GraphModal";
import ToolBar from "./containers/ToolBar/ToolBar";

const DEFAULT_FUEL_TYPE = 1;

const endpoint =
  import.meta.env.VITE_LOCAL == "TRUE"
    ? "http://localhost:3000"
    : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod";

function App() {
  // set intial state
  const [allFeatures, setFeatures] = useState([]);
  const [mapFeatures, setMapFeatures] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState([0, 0, 0, 0]);

  const [modalSite, setModalSite] = useState(0);
  const [modalDetails, setModalDetails] = useState({});
  const [modalVisible, setModalVisibility] = useState(false);

  const [warningVisible, setWarning] = useState(false);

  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);

  const initialFuelType =
    parseInt(getCookie("fuelType")) ||
    fueltypes["Fuels"][DEFAULT_FUEL_TYPE].FuelId;
  const [fuelType, setFuelType] = useState(initialFuelType);

  const getSites = async () => {
    const res = await fetch(endpoint + "/sites");
    if (res.status != 200) {
      window.alert("site data not found.");
      return;
    }
    const json = await res.json();
    setFeatures(json);

    console.log(`updated ${json.length} features.`);

    setFeaturesLoading(false);
  };

  const getSitePrices = async ({ reload } = {}) => {
    setWarning(false);
    if (!allFeatures || allFeatures.length <= 0) {
      return;
    }

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
      return;
    }
    if (body.length >= 200) {
      console.warn("request body length exceeds 100.");
      window.alert("Search area too large, try zooming in.");
      setPricesLoading(false);
      return;
    }
    console.log(`requesting data for ${body.length} sites`);

    setPricesLoading(true);

    const req = fetch(endpoint + `/prices?fuelType=${fuelType}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const request = new Promise((accept, reject) => {
      let accepted = false;

      setTimeout(() => {
        if (accepted) return;

        window.alert("Prices request timed out, try again later.");
        setPricesLoading(false);
        reject();
        return;
      }, 5_000);

      req.then((data) => {
        accepted = true;
        accept(data);
      });
    });

    const res = await request;
    if (res.status != 200) {
      window.alert("error while handling site prices.");
      setPricesLoading(false);
      return;
    }

    const json = await res.json();

    const newFeatures = allFeatures;

    Object.entries(json).forEach((siteEntry) => {
      const [siteId, sitePrice] = siteEntry;

      const feature = allFeatures.find((feature) => {
        if (feature.SiteId == siteId) {
          return feature;
        }
      });

      if (!feature) return undefined;

      // show prices with dollar sign.
      // feature.Price = (sitePrice / 1000).toLocaleString("en-AU", {
      //   style: "currency",
      //   currency: "AUD",
      //   maximumSignificantDigits: 4,
      // });

      // show prices without dollar sign.
      feature.Price = sitePrice;

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
      setWarning(true);
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

  useEffect(() => {
    if (!allFeatures) {
      return;
    }

    const details = allFeatures.find((feature) => {
      if (feature.SiteId == modalSite) {
        return feature;
      }
    });

    setModalDetails(details);
  }, [modalSite]);

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
    getSitePrices({ reload: true });
    setCookie("fuelType", fuelType, 365);
  }, [fuelType]);

  return (
    <FeatureContext>
      <div className={styles.App}>
        <div className={styles.App_Label + " " + styles.App_FuelSelector}>
          <p>Select Fuel</p>
          <select onChange={handleFuelChange} value={fuelType}>
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

        {modalVisible && (
          <StationModal
            siteDetails={modalDetails}
            setVisible={setModalVisibility}
          />
        )}

        <MapWrapper
          features={mapFeatures}
          updateVisibleFeatures={setVisibleFeatures}
          updateModalDetails={setModalSite}
          showModal={showModal}
        />

        <div className={styles.App_Info} hidden>
          <p>
            Connor Turlan 2024 -{" "}
            <a href="https://github.com/connorturlan/petrol-price-viewer">
              GitHub
            </a>
          </p>
        </div>

        {warningVisible && (
          <div className={styles.App_Warning}>
            <p>No stations in current area</p>
          </div>
        )}

        <ToolBar>
          <PriceList>
            {mapFeatures
              .sort((a, b) => a.Price - b.Price)
              .map((feature) => (
                <PriceListItem
                  key={feature.SiteId}
                  name={feature.Name}
                  price={((feature.Price || 0) / 10).toFixed(1)}
                  showDetails={() => {
                    setModalSite(feature.SiteId);
                    showModal();
                  }}
                />
              ))}
          </PriceList>
          <GraphModal />
        </ToolBar>
      </div>
    </FeatureContext>
  );
}

export default App;
