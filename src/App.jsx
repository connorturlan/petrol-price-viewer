import React, { useState, useEffect, useContext } from "react";
import styles from "./App.module.scss";
import fueltypes from "./assets/fueltypes.json";
import "./App.css";
import PriceList from "./components/PriceList/PriceList";
import StationModal from "./components/StationModal/StationModal";
import PriceListItem from "./components/PriceList/PriceListItem/PriceListItem";
import { setCookie } from "./utils/cookies";
import GraphModal from "./components/GraphModal/GraphModal";
import ToolBar from "./containers/ToolBar/ToolBar";
import LoginControl from "./components/LoginControl/LoginControl";
import PetrolMap, { MODES } from "./containers/PetrolMap/PetrolMap";
import SettingsModal from "./containers/SettingsModal/SettingsModal";
import { AppContext } from "./contexts/AppContext";
import WelcomeSplash from "./components/WelcomeSplash/WelcomeSplash";
import RoutePlanner from "./components/RoutePlanner/RoutePlanner";
import { capitalize } from "./utils/utils";
import Toolbox from "./containers/Toolbox/Toolbox";
import FuelSelector from "./components/FuelSelector/FuelSelector";
import ToolboxTester from "./components/ToolboxTester/ToolboxTester";
import { MapMoveTo, usePub } from "./utils/pubsub";

function App() {
  // set intial state
  const [mapFeatures, setMapFeatures] = useState([]);
  const [warningVisible, setWarning] = useState(false);
  const {
    clickMode,
    setClickMode,
    clickModeOptions,
    selectSite,
    fuelType,
    setFuelType,
    darkMode,
  } = useContext(AppContext);

  const handleFuelChange = (event) => {
    setFuelType(event.target.value);
  };

  const clickModeTip = () => {
    switch (clickMode) {
      default:
      case 0:
        return "Nothing... you shouldn't be seeing this";
      case 1:
        return "Setting Home...";
      case 2:
        return "Placing Work...";
      case 3:
        return `Placing ${capitalize(clickModeOptions.poi_name)}`;
    }
  };

  useEffect(() => {
    setCookie("fuelType", fuelType, 365);
  }, [fuelType]);

  useEffect(() => {
    console.debug("[MODE] setting mode", clickMode);
    localStorage.setItem("clickMode", clickMode);
  }, [clickMode]);

  useEffect(() => {
    console.debug("[MODE] setting mode options", clickModeOptions);
    localStorage.setItem("clickModeOptions", JSON.stringify(clickModeOptions));
  }, [clickModeOptions]);

  return (
    <div
      className={`${styles.App} ${
        darkMode ? styles.App__Dark : styles.App__Light
      }`}
    >
      <WelcomeSplash />

      {/* <div className={styles.App_Label + " " + styles.App_FuelSelector}>
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
      </div> */}

      <StationModal />

      <div className={styles.App_Layout}>
        <Toolbox>
          <LoginControl />
          <FuelSelector />
          <PriceList>
            {mapFeatures
              .sort((a, b) => a.Price - b.Price)
              .map((feature) => (
                <PriceListItem
                  key={feature.SiteId}
                  name={feature.Name}
                  price={((feature.Price || 0) / 10).toFixed(1)}
                  showDetails={() => {
                    MapMoveTo({ coord: [feature.Lng, feature.Lat] });
                    selectSite(feature.SiteId);
                  }}
                />
              ))}
          </PriceList>
          <GraphModal />
          <RoutePlanner />
          <SettingsModal />
        </Toolbox>
        <PetrolMap
          fuelType={fuelType}
          updateStations={setMapFeatures}
        ></PetrolMap>
      </div>

      {warningVisible && (
        <div className={styles.App_Warning}>
          <p>No stations in current area</p>
        </div>
      )}

      {/* <ToolBar>
        <PriceList>
          {mapFeatures
            .sort((a, b) => a.Price - b.Price)
            .map((feature) => (
              <PriceListItem
                key={feature.SiteId}
                name={feature.Name}
                price={((feature.Price || 0) / 10).toFixed(1)}
                showDetails={() => {
                  selectSite(feature.SiteId);
                }}
              />
            ))}
        </PriceList>
        <GraphModal />
        <LoginControl />
        <RoutePlanner />
        <SettingsModal />
      </ToolBar> */}
      {clickMode != 0 && (
        <>
          <div className={styles.App__Active}></div>
          <div className={styles.App_Info}>
            <p>{clickModeTip()}</p>
            <button
              onClick={() => {
                setClickMode(0);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
