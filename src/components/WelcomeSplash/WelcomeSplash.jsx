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
            Hello and welcome to fuel tool! Your handy tool for saving money on
            your petrol bill
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, a
            sapiente corrupti, explicabo, rerum rem fuga distinctio unde earum
            recusandae quae quos eos perspiciatis fugiat nobis eligendi ex?
            Placeat, totam.
          </p>
          <p>Touch anywhere to hide</p>
        </div>
      </div>
    )
  );
};

export default WelcomeSplash;
