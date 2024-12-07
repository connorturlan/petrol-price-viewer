import { createContext, useEffect, useState } from "react";
import { ObjectIsEmpty } from "../utils/utils";

export const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [origin, setOrigin] = useState({});
  const [dest, setDest] = useState({});

  useEffect(() => {
    if (ObjectIsEmpty(origin)) {
      return;
    }
    if (ObjectIsEmpty(dest)) {
      return;
    }
    if (origin.Name == dest.Name) {
      setDest({});
    }
  }, [origin]);

  const context = { origin, setOrigin, dest, setDest };

  return (
    <RouteContext.Provider value={context}>{children}</RouteContext.Provider>
  );
};

export default RouteProvider;
