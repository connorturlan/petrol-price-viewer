import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeSplash.module.scss";
import { getCookie } from "../../utils/cookies";
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

const COUNTDOWN_TIME = 4;

const WelcomeSplash = (props) => {
  const [visible, setVisible] = useState(SHOW_WELCOME);
  const [countdown, setCountdown] = useState(
    getCookie("userprofile") === "" ? COUNTDOWN_TIME : 0
  );

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
            Hello and welcome to Fuel Tool! Your handy tool for saving money on
            your petrol bill.
          </p>
          <p>
            Fuel Tool is provided as a free service for viewing petrol prices
            across South Australia, but it is not free to run. If you would like
            to support me you can support this project and many others at:
          </p>
          <a
            className={styles.WelcomeSplash_Image}
            href="https://buymeacoffee.com/connorturlan"
            target="_blank"
          >
            <img src="white-button.png" alt="buy me a coffee" srcset="" />
          </a>
          <p>Thank you for using Fuel Tool!</p>
          <b>
            This app is regularly updated, if you have any issues while using
            the app please reach out to{" "}
            <a href="mailto://connorturlan@gmail.com?subject=Fuel Tool issue report">
              connorturlan@gmail.com
            </a>
            .
          </b>
          {/* <b>
            Touch anywhere to hide{countdown > 0 ? ` in ${countdown}` : ""}.
          </b> */}
          <b>{countdown > 0 ? `Loading...` : "Touch anywhere to hide"}.</b>
        </div>
      </div>
      // </AdvertisingProvider>
    )
  );
};

export default WelcomeSplash;
