import { useContext, useState } from "react";
import styles from "./SettingsModal.module.scss";
import { MODES } from "../PetrolMap/PetrolMap";
import { UserContext } from "../../contexts/UserContext";
import { AppContext } from "../../contexts/AppContext";
import { ObjectIsEmpty } from "../../utils/utils";

const SettingsModal = () => {
  // validate that the user is logged in before showing.
  const { profile, POI } = useContext(UserContext);
  const { clickMode, setClickMode } = useContext(AppContext);
  const [visible, setVisible] = useState(false);

  if (ObjectIsEmpty(profile)) return <></>;

  //
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
            <div className={styles.SettingsModal_List}>
              <h3>Points of Interest</h3>
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
              <button
                className={styles.SetHome}
                onClick={() => {
                  setVisible(false);
                  setClickMode(MODES.ADD_WORK);
                }}
                disabled={clickMode == MODES.ADD_WORK}
              >
                <img
                  src="home_pin_24dp_FILL0_wght400_GRAD0_opsz24.svg"
                  className={styles.SetHome_Image}
                ></img>
                <p>Set Work</p>
              </button>
              <h3>Details</h3>
              <div>
                {Object.keys(POI).map((poi) => {
                  return (
                    <p key={poi}>
                      {poi}: {POI[poi].Lat}, {POI[poi].Lng}
                    </p>
                  );
                })}
              </div>
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
