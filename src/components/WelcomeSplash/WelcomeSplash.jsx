import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeSplash.module.scss";
import { getCookie, setCookie } from "../../utils/cookies";
import { SHOW_WELCOME } from "../../utils/defaults";

const COUNTDOWN_TIME = 2;

const WelcomeSplash = (props) => {
  const [visible, setVisible] = useState(
    SHOW_WELCOME || getCookie("weekly_welcome") != "show"
  );
  const [countdown, setCountdown] = useState(
    getCookie("userprofile") === "" ? COUNTDOWN_TIME : 0
  );

  if (visible) {
    setCookie("weekly_welcome", "show", 7);
  }

  const mount = useRef(0);

  useEffect(() => {
    if (mount.current > 0) return;
    mount.current++;
    setCountdown(COUNTDOWN_TIME);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1_000);
  }, [countdown]);

  return (
    visible && (
      <div
        className={styles.WelcomeSplash_Container}
        onClick={() => {
          if (countdown > 0) return;
          setVisible(false);
        }}
      >
        <div
          className={styles.WelcomeSplash_Body}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h2 className={styles.WelcomeSplash_Title}>Welcome to Fuel Tool!</h2>
          <p>
            We're really glad you're here. Fuel Tool is designed to help you
            save money on your petrol bill and make it easier to find petrol
            prices and electric charging stations across South Australia.
          </p>
          <p>
            Fuel Tool is free for everyone to use, but it does take time and
            resources to keep it running. If you choose to support it, that
            means a lot — and if not, we're just happy you're using it.
          </p>
          <p>Thanks for being part of the Fuel Tool community!</p>
          <div className={styles.WelcomeSplash_Donations}>
            <a
              className={styles.WelcomeSplash_Image}
              href="https://buymeacoffee.com/connorturlan"
              target="_blank"
            >
              <img src="white-button.png" alt="buy me a coffee" srcset="" />
            </a>
            <a
              className={styles.WelcomeSplash_Image}
              href="https://ko-fi.com/R6R51OF0CS"
              target="_blank"
            >
              <img
                height="36"
                style={{ border: "0px", height: "36px" }}
                src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_beige.png"
                border="0"
                alt="Buy Me a Coffee at ko-fi.com"
              />
            </a>
          </div>
          {/* <b>
            <a href="mailto://info@fueltool.com.au?subject=[Inquiry] Fuel Tool Advertisement">
              I'm interested in advertising!
            </a>
          </b>
          <b>
            <a href="mailto://info@fueltool.com.au?subject=[Inquiry] Fuel Tool Sponsorship">
              I'm interested in sponsoring!
            </a>
          </b> */}
          <b>
            <a href="mailto://support@fueltool.com.au?subject=[Issue] Fuel Tool">
              Contact Support
            </a>
          </b>
          <b>{countdown > 0 ? `Loading...` : "Touch anywhere to hide"}.</b>
        </div>
      </div>
      // </AdvertisingProvider>
    )
  );
};

export default WelcomeSplash;
