import { useContext, useEffect, useRef, useState } from "react";
import styles from "./LoginControl.module.scss";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getCookie, setCookie } from "../../utils/cookies";
import { ENDPOINT } from "../../utils/defaults";
import { UserContext } from "../../contexts/UserContext";
import { ObjectIsEmpty } from "../../utils/utils";
import { checkToken, getLogin, getToken, newToken } from "../../utils/api";

const LoginControl = () => {
  const { user, setUser, profile, setProfile, token, setToken, processLogin } =
    useContext(UserContext);

  const login = useGoogleLogin({
    onSuccess: (res) => setUser(res),
    onError: (err) => console.error("login failed:", err),
  });

  const handleLogin = async (profileData) => {
    if (ObjectIsEmpty(profileData)) {
      console.warn("profileData is empty");
      return;
    }

    const userData = {
      UserID: profileData.id,
      GoogleID: profileData.id,
    };

    const res = await getLogin(userData.UserID);
    if (res.status != 202) {
      console.error("user failed to login.");
      if (res.status != 403) {
        return;
      }

      if (
        !window.confirm(
          "You're not a registered user, would you like to register?"
        )
      ) {
        setUser({});
        setProfile({});
        return;
      }

      register(profileData, userData);
      return;
    }

    setCookie("userprofile", JSON.stringify(profileData), 30);

    // get the usertoken
    const freshToken = await newToken(userData.UserID);
    console.debug(`[LOGIN] setting new token: ${freshToken}`);
    setToken(freshToken);

    processLogin();
  };

  const register = async (profileData, userData) => {
    const body = JSON.stringify(userData);

    const res = await fetch(ENDPOINT + "/auth" + `?userid=${userData.UserID}`, {
      method: "POST",
      body: body,
    });

    if (res.status != 202) {
      console.error("error while registering user.");
      return;
    }

    handleLogin(profileData);
  };

  const logout = () => {
    googleLogout();
    setProfile({});
    setCookie("userprofile", "");
    setCookie("usertoken", "");
    window.location.reload();
  };

  useEffect(() => {
    if (ObjectIsEmpty(user)) {
      return;
    }

    fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: "application/json",
        },
      }
    )
      .then(async (res) => {
        const json = await res.json();
        setProfile(json);
        console.log(`login complete! welcome ${json.given_name}`);
        console.debug(`[LOGIN] profile data: ${json}`);
      })
      .catch((err) => {
        console.error("Error while getting profile:", err);
      });
  }, [user]);

  useEffect(() => {
    handleLogin(profile);
  }, [profile]);

  return (
    <>
      {!ObjectIsEmpty(profile) ? (
        <button className={styles.LoginControl} onClick={logout}>
          <img
            src={
              profile.picture ||
              "account_circle_24dp_FILL0_wght400_GRAD0_opsz24.svg"
            }
            className={styles.LoginControl_Image}
          />
          <p>Logout</p>
        </button>
      ) : (
        <button className={styles.LoginControl} onClick={login}>
          <img
            src="account_circle_24dp_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.LoginControl_Image}
          />
          <p>Login</p>
        </button>
      )}
    </>
  );
};

export default LoginControl;
