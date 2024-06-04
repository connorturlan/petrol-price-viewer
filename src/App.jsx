import React, { useState, useEffect } from "react";
import styles from "./App.module.scss";
import fueltypes from "./assets/fueltypes.json";
import "./App.css";
import PriceList from "./components/PriceList/PriceList";
import StationModal from "./components/StationModal/StationModal";
import PriceListItem from "./components/PriceList/PriceListItem/PriceListItem";
import { getCookie, setCookie } from "./utils/cookies";
import GraphModal from "./components/GraphModal/GraphModal";
import ToolBar from "./containers/ToolBar/ToolBar";
import LoginControl from "./components/LoginControl/LoginControl";
import PetrolMap, { MODES } from "./containers/PetrolMap/PetrolMap";

const DEFAULT_FUEL_TYPE = 1;

function App() {
  // set intial state
  const [mapFeatures, setMapFeatures] = useState([]);

  const [modalSite, setModalSite] = useState(0);
  const [modalDetails, setModalDetails] = useState({});
  const [modalVisible, setModalVisibility] = useState(false);

  const [warningVisible, setWarning] = useState(false);

  const [profile, setProfile] = useState(null);
  const [clickMode, setClickMode] = useState(0);

  const initialFuelType =
    parseInt(getCookie("fuelType")) ||
    fueltypes["Fuels"][DEFAULT_FUEL_TYPE].FuelId;
  const [fuelType, setFuelType] = useState(initialFuelType);

  const handleFuelChange = (event) => {
    setFuelType(event.target.value);
  };

  const showModal = () => {
    setModalVisibility(true);
  };

  useEffect(() => {
    setCookie("fuelType", fuelType, 365);
  }, [fuelType]);

  useEffect(() => {
    console.log("setting mode", clickMode);
    localStorage.setItem("clickMode", clickMode);
  }, [clickMode]);

  return (
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

      {modalVisible && (
        <StationModal
          siteDetails={modalDetails}
          setVisible={setModalVisibility}
        />
      )}

      <PetrolMap
        fuelType={fuelType}
        updateStations={setMapFeatures}
        setClickMode={setClickMode}
      ></PetrolMap>

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
        <LoginControl setUserProfile={setProfile} />
        {profile && (
          <button
            className={styles.SetHome}
            onClick={() => {
              setClickMode(MODES.ADD_HOME);
            }}
            disabled={clickMode == MODES.ADD_HOME}
          >
            <img
              src="home_pin_24dp_FILL0_wght400_GRAD0_opsz24.svg"
              className={styles.SetHome_Image}
            ></img>
            <p>Set</p>
          </button>
        )}
      </ToolBar>
    </div>
  );
}

export default App;
