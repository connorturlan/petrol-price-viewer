import { useState } from "react";
import styles from "./WelcomeSplash.module.scss";
import { getCookie } from "../../utils/cookies";

const WelcomeSplash = (props) => {
  const [visible, setVisible] = useState(getCookie("userprofile") == "");
  return (
    visible && (
      <div
        className={styles.WelcomeSplash_Container}
        onClick={() => {
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
          <b>Touch anywhere to hide</b>
        </div>
      </div>
    )
  );
};

export default WelcomeSplash;
