import { createContext, useEffect, useState } from "react";
import { ENDPOINT } from "../utils/defaults";
import { ObjectIsEmpty } from "../utils/utils";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [profile, setProfile] = useState({});

  const postHome = async (body) => {
    // send the site update.
    const res = await fetch(`${ENDPOINT}/poi?userid=${profile.id}`, {
      method: "POST",
      body,
    });

    // log the result.
    console.log(res.status, res.statusText);
  };

  const setHome = (profile, coord) => {
    // auth the user.
    if (ObjectIsEmpty(profile)) {
      window.alert("you are not logged in.");
      return;
    }

    // construct the site.
    const sites = {
      home: {
        Name: "home",
        Lat: coord[0],
        Lng: coord[1],
      },
    };

    const body = JSON.stringify(sites);
    postHome(body);
  };

  useEffect(() => {
    console.log("profile has been set:", profile);
  }, [profile]);

  const context = {
    user,
    setUser,
    profile,
    setProfile,
    setHome,
  };

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
