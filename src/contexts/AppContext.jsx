import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [clickMode, setClickMode] = useState(0);
  const [siteId, setSelectedSite] = useState(0);

  const selectSite = (id) => {
    setSelectedSite(id);
  };

  const unselectSite = () => {
    setSelectedSite(0);
  };

  const context = {
    clickMode,
    setClickMode,
    siteId,
    selectSite,
    unselectSite,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

export default AppProvider;
