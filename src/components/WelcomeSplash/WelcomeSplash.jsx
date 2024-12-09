import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeSplash.module.scss";
import { getCookie } from "../../utils/cookies";
import { AdvertisingProvider, AdvertisingSlot } from "react-advertising";

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

const COUNTDOWN_TIME = 5;

const WelcomeSplash = (props) => {
  const [visible, setVisible] = useState(getCookie("userprofile") == "");
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

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
          <b>
            This app is currently in development and all features are subject to
            change without notice. If you have any issues while using the app
            please reach out to{" "}
            <a href="mailto://connorturlan@gmail.com?subject=Fuel Tool issue report">
              connorturlan@gmail.com
            </a>
            .
          </b>
          <p>
            Fuel Tool is provided as a free service for viewing petrol prices
            across South Australia. Features such as route price filtering,
            price alerts, price thresholds, and more, require registration and
            payment.
          </p>
          <p>Thank you for using Fuel Tool!</p>
          {/* <AdvertisingSlot id="banner-ad" /> */}
          <b>
            Touch anywhere to hide{countdown > 0 ? ` in ${countdown}` : ""}.
          </b>
        </div>
      </div>
      // </AdvertisingProvider>
    )
  );
};

export default WelcomeSplash;
