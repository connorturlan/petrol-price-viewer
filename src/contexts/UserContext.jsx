import { createContext, useEffect, useRef, useState } from "react";
import { ENDPOINT } from "../utils/defaults";
import { ObjectIsEmpty } from "../utils/utils";
import { getCookie, setCookie } from "../utils/cookies";
import { getPointsOfInterest } from "../utils/api";

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

  const postPOIs = async (body) => {
    // send the site update.
    const res = await fetch(`${ENDPOINT}/poi?userid=${profile.id}`, {
      method: "POST",
      body,
    });

    // log the result.
    console.log(res.status, res.statusText);
  };

  const setHome = (profile, coord) => {
    setPoi(profile, "home", coord);
  };

  const setWork = (profile, coord) => {
    setPoi(profile, "work", coord);
  };

  const setPoi = (profile, poiName, coord) => {
    // auth the user.
    if (ObjectIsEmpty(profile)) {
      window.alert("you are not logged in.");
      return;
    }

    // construct the site.

    const sites = { ...POI };

    sites[poiName] = {
      Name: poiName,
      Lat: coord[0],
      Lng: coord[1],
    };
    console.log(POI, sites);

    const body = JSON.stringify(sites);
    setPOI(sites);
    postPOIs(body);
  };

  const updatePOIs = async () => {
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
    console.log("profile has been set:", profile);
    if (ObjectIsEmpty(profile)) {
      return;
    }
    updatePOIs();
  }, [profile]);

  useEffect(() => {
    setCookie("usertoken", token);
    console.log(`token set to ${token}`);
  }, [token]);

  const context = {
    token,
    setToken,
    user,
    setUser,
    profile,
    setProfile,
    setHome,
    setWork,
    POI,
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
