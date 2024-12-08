import { createContext, useState } from "react";
import { getCookie } from "../utils/cookies";
import { DEFAULT_FUEL_TYPE as FUELTYPE } from "../utils/defaults";
import fueltypes from "../assets/fueltypes.json";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clickMode, setClickMode] = useState(0);
  const [clickModeOptions, setClickModeOptions] = useState({});
  const [siteId, setSelectedSite] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const selectSite = (id) => {
    setSelectedSite(id);
  };

  const unselectSite = () => {
    setSelectedSite(0);
  };

  const initialFuelType =
    parseInt(getCookie("fuelType")) || fueltypes["Fuels"][FUELTYPE].FuelId;
  const [fuelType, setFuelType] = useState(initialFuelType);

  const context = {
    clickMode,
    setClickMode,
    clickModeOptions,
    setClickModeOptions,
    siteId,
    selectSite,
    unselectSite,
    fuelType,
    setFuelType,
    darkMode,
    setDarkMode,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

export default AppProvider;
