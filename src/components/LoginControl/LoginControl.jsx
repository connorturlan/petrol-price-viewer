import { useEffect, useState } from "react";
import styles from "./LoginControl.module.scss";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";

const LoginControl = (props) => {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (res) => setUser(res),
    onError: (err) => console.error("login failed:", err),
  });

  useEffect(() => {
    if (!user) {
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

  const logout = () => {
    googleLogout();
    setProfile(null);
  };

  return (
    <>
      {profile ? (
        <button className={styles.LoginControl} onClick={logout}>
          <img src={profile.picture} className={styles.LoginControl_Image} />
          {/* <p>{profile.given_name || "user"}</p> */}
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
