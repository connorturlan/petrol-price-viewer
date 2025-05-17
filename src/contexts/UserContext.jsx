import { createContext, useEffect, useRef, useState } from "react";
import { ObjectIsEmpty } from "../utils/utils";
import { getCookie, setCookie } from "../utils/cookies";
import {
  checkToken,
  getPointsOfInterest,
  setPointsOfInterest,
} from "../utils/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const maybeUser = JSON.parse(getCookie("userdata"));

  const [token, setToken] = useState("not-a-token");

  const [user, setUser] = useState({});

  const maybeProfile = JSON.parse(getCookie("userprofile") || "{}");
  const [profile, setProfile] = useState(
    !ObjectIsEmpty(maybeProfile) ? maybeProfile : {}
  );
  const [POI, setPOI] = useState({});
  const poiRef = useRef({});

  const setHome = (profile, coord) => {
    updateRemotePOIs(profile, "home", coord);
  };

  const setWork = (profile, coord) => {
    updateRemotePOIs(profile, "work", coord);
  };

  const setCustomLocation = (profile, poi_name, coord) => {
    updateRemotePOIs(profile, poi_name, coord);
  };

  const removeLocation = (poiName) => {
    updateRemotePOIs(profile, poiName, [], true);
  };

  const updateRemotePOIs = (profile, poiName, coord, isRemoval = false) => {
    // auth the user.
    if (ObjectIsEmpty(profile)) {
      window.alert("you are not logged in.");
      return;
    }

    // construct the site.
    const sites = { ...poiRef.current };

    console.debug(
      `[POI] adding site: ${poiName} ${JSON.stringify(
        sites
      )}... ${JSON.stringify(POI)}`
    );
    console.debug(`[POI] all sites:  ${JSON.stringify(POI)}`);

    if (!isRemoval) {
      sites[poiName] = {
        Name: poiName,
        Lat: coord[0],
        Lng: coord[1],
      };
    } else {
      delete sites[poiName];
    }

    setPOI(sites);
    setPointsOfInterest(profile.id, token, sites);
  };

  const updateLocalPOIs = async () => {
    console.log("[POI] updating local locations.");
    const res = await getPointsOfInterest(profile.id);
    if (res.status != 200) {
      console.error("[POI] unable to update local locations.");
      setPOI({});
      return;
    }
    const pois = await res.json();
    if (!pois) {
      setPOI({});
      return;
    }
    setPOI(pois);
    console.log(`[POI] success, ${Object.keys(pois).length} POIs found.`);
  };

  const getPOIs = () => {
    return poiRef.current;
  };

  const processLogin = async () => {
    if (ObjectIsEmpty(profile)) {
      console.warn("profile was empty during process login");
      return;
    }
    updateLocalPOIs();
  };

  useEffect(() => {
    processLogin();
  }, [profile]);

  useEffect(() => {
    console.log(`[POI] updated, ${Object.keys(POI).length} POIs found.`);
    poiRef.current = POI;
    console.debug(
      `[POI] ${JSON.stringify(poiRef.current)} & ${JSON.stringify(POI)}`
    );
  }, [POI]);

  useEffect(() => {
    const onLoginTokenCheck = async () => {
      if (!profile.id) return;

      const currentToken = getCookie("usertoken");
      const isTokenValid = await checkToken(profile.id || -1, currentToken);
      if (!isTokenValid) {
        console.log("[LOGIN] token is invalid, resetting login.");
        setProfile({});
        setCookie("userprofile", "", 0);
        setCookie("usertoken", "", 0);
        window.location.reload();
      }
    };
    onLoginTokenCheck();
  }, []);

  const context = {
    token,
    user,
    setUser,
    profile,
    setProfile,
    setHome,
    setWork,
    setCustomLocation,
    removeLocation,
    POI,
    getPOIs,
    processLogin,
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
