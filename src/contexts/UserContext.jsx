import { createContext, useEffect, useRef, useState } from "react";
import { ObjectIsEmpty } from "../utils/utils";
import { getCookie } from "../utils/cookies";
import { getPointsOfInterest, setPointsOfInterest } from "../utils/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const maybeUser = JSON.parse(getCookie("userdata"));

  const cookieToken = getCookie("usertoken");
  const [token, setToken] = useState(cookieToken);

  const [user, setUser] = useState({});

  const maybeProfile = JSON.parse(getCookie("userprofile") || "{}");
  const [profile, setProfile] = useState(
    !ObjectIsEmpty(maybeProfile) ? maybeProfile : {}
  );
  const [POI, setPOI] = useState({});

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
    const sites = { ...POI };

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
    const res = await getPointsOfInterest(profile.id, token);
    if (res.status != 200) {
      setPOI({});
      return;
    }
    const pois = await res.json();
    if (!pois) {
      setPOI({});
      return;
    }
    setPOI(pois);
  };

  useEffect(() => {
    if (ObjectIsEmpty(profile)) {
      return;
    }
    updateLocalPOIs();
  }, [profile]);

  const context = {
    token,
    setToken,
    user,
    setUser,
    profile,
    setProfile,
    setHome,
    setWork,
    setCustomLocation,
    removeLocation,
    POI,
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
