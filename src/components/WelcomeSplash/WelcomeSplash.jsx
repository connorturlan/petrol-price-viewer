import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeSplash.module.scss";
import { getCookie, setCookie } from "../../utils/cookies";
import { AdvertisingProvider, AdvertisingSlot } from "react-advertising";
import { SHOW_WELCOME } from "../../utils/defaults";

// const config = {
//   slots: [
//     {
//       path: "/19968336/header-bid-tag-0",
//       id: "banner-ad",
//       sizes: [
//         [600, 200],
//         [600, 300],
//       ],
//       bids: [
//         {
//           bidder: "appnexus",
//           params: {
//             placementId: "10433394",
//           },
//         },
//       ],
//     },
//   ],
// };

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
      // <AdvertisingProvider config={config}>
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
          <h2 className={styles.WelcomeSplash_Title}>Fuel Tool</h2>
          <p>
            Welcome to Fuel Tool! Your handy tool for saving money on your
            petrol bill.
          </p>
          <p>
            Fuel Tool is provided as a free service for viewing petrol prices
            across Australia, but it is not free to run. If you would like to
            support me you can support this project and many others at:
          </p>
          <a
            className={styles.WelcomeSplash_Image}
            href="https://buymeacoffee.com/connorturlan"
            target="_blank"
          >
            <img src="white-button.png" alt="buy me a coffee" srcset="" />
          </a>
          <b>
            <a href="mailto://info@fueltool.com.au?subject=[Inquiry] Fuel Tool Advertisement">
              I'm interested in advertising!
            </a>
          </b>
          <b>
            <a href="mailto://info@fueltool.com.au?subject=[Inquiry] Fuel Tool Sponsorship">
              I'm interested in sponsoring!
            </a>
          </b>
          <b>
            <a href="mailto://support@fueltool.com.au?subject=[Issue] Fuel Tool">
              I'm having issues?
            </a>
          </b>
          <p>Thank you for using Fuel Tool!</p>
          <b>{countdown > 0 ? `Loading...` : "Touch anywhere to hide"}.</b>
        </div>
      </div>
      // </AdvertisingProvider>
    )
  );
};

export default WelcomeSplash;
