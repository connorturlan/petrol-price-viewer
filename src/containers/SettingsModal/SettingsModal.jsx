import { useState } from "react";
import styles from "./SettingsModal.module.scss";
import { MODES } from "../PetrolMap/PetrolMap";

const SettingsModal = ({ clickMode, setClickMode }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      {visible && (
        <div
          className={styles.SettingsModal_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          <div
            className={styles.SettingsModal_Body}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2 className={styles.SettingsModal_Title}>Settings</h2>
            <div
              className={styles.SettingsModal_List}
              onClick={() => {
                setVisible(false);
              }}
            >
              <button
                className={styles.SetHome}
                onClick={() => {
                  setVisible(false);
                  setClickMode(MODES.ADD_HOME);
                }}
                disabled={clickMode == MODES.ADD_HOME}
              >
                <img
                  src="home_pin_24dp_FILL0_wght400_GRAD0_opsz24.svg"
                  className={styles.SetHome_Image}
                ></img>
                <p>Set Home</p>
              </button>
            </div>
            <p>Touch anywhere to hide</p>
          </div>
        </div>
      )}
      <button
        className={styles.SettingsModal_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        <img
          src="settings_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          className={styles.SettingsModal_Image}
          alt="Show"
          srcSet=""
          title="Show price chart"
        />
        <p>Settings</p>
      </button>
    </>
  );
};

export default SettingsModal;
