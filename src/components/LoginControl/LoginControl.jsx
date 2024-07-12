import { useContext, useEffect, useRef, useState } from "react";
import styles from "./LoginControl.module.scss";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { getCookie } from "../../utils/cookies";
import { ENDPOINT } from "../../utils/defaults";
import { UserContext } from "../../contexts/UserContext";
import { ObjectIsEmpty } from "../../utils/utils";

const LoginControl = () => {
  const { user, setUser, profile, setProfile } = useContext(UserContext);

  const login = useGoogleLogin({
    onSuccess: (res) => setUser(res),
    onError: (err) => console.error("login failed:", err),
  });

  const handleLogin = async (profileData) => {
    if (ObjectIsEmpty(profileData)) return;

    const userData = {
      UserID: profileData.id,
      GoogleID: profileData.id,
    };

    const res = await fetch(ENDPOINT + "/login" + `?userid=${userData.UserID}`);
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
    }
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
        console.log("login complete:", json);
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
