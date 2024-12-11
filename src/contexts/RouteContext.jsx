import { createContext, useEffect, useRef, useState } from "react";
import { ObjectIsEmpty } from "../utils/utils";

export const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [origin, setOrigin] = useState({});
  const [dest, setDest] = useState({});

  const originRef = useRef({});
  const destRef = useRef({});

  useEffect(() => {
    originRef.current = origin;
  }, [origin]);

  useEffect(() => {
    destRef.current = dest;
  }, [dest]);

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

  const getOrigin = () => {
    return originRef.current;
  };

  const getDest = () => {
    return destRef.current;
  };

  const context = { origin, getOrigin, setOrigin, dest, getDest, setDest };

  return (
    <RouteContext.Provider value={context}>{children}</RouteContext.Provider>
  );
};

export default RouteProvider;
