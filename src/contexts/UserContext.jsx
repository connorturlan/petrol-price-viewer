import { createContext, useEffect, useRef, useState } from "react";
import { ENDPOINT } from "../utils/defaults";
import { ObjectIsEmpty } from "../utils/utils";
import { getCookie } from "../utils/cookies";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const maybeUser = JSON.parse(getCookie("userdata"));
  const maybeProfile = JSON.parse(getCookie("userprofile"));

  const [user, setUser] = useState({});
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
    const res = await fetch(`${ENDPOINT}/poi?userid=${profile.id}`);
    if (res.status != 200) {
      setPOI({});
      return;
    }
    setPOI(await res.json());
  };

  useEffect(() => {
    console.log("profile has been set:", profile);
    if (ObjectIsEmpty(profile)) {
      return;
    }
    updatePOIs();
  }, [profile]);

  const context = {
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
