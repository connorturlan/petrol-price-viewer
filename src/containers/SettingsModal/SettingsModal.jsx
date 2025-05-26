import { useContext, useState } from "react";
import styles from "./SettingsModal.module.scss";
import { MODES } from "../PetrolMap/PetrolMap";
import { UserContext } from "../../contexts/UserContext";
import { AppContext } from "../../contexts/AppContext";
import { capitalize, ObjectIsEmpty } from "../../utils/utils";
import { getCoordinatesOfAddress } from "../../utils/navigation";
import ToolboxModal from "../ToolboxModal/ToolboxModal";

const SettingsModal = () => {
  // validate that the user is logged in before showing.
  const { loginState, POI, removeLocation, setCustomLocation, profile } =
    useContext(UserContext);
  const {
    clickMode,
    setClickMode,
    setClickModeOptions,
    darkMode,
    setDarkMode,
  } = useContext(AppContext);
  const [visible, setVisible] = useState(false);

  const [lookupInProgess, setLookupProgress] = useState(false);

  const lookup = async (address) => {
    if (lookupInProgess) return;
    if (!address) return;

    setLookupProgress(true);
    const addressData = await getCoordinatesOfAddress(address);
    setTimeout(() => {
      setLookupProgress(false);
    }, 2_000);

    if (ObjectIsEmpty(addressData) || addressData.length <= 0) {
      window.alert(`no address found for ${address}`);
      return;
    }
    if (addressData.length > 1) {
      window.alert(`multiple addresses found for ${address}`);
    }

    return [
      parseFloat(addressData.at(0).lon),
      parseFloat(addressData.at(0).lat),
    ];
  };

  if (!loginState) return <></>;

  //
  return (
    <>
      <ToolboxModal
        summary={
          <>
            <img
              src="settings_24dp_FILL0_wght400_GRAD0_opsz24.svg"
              className={styles.SettingsModal_Image}
              alt="Show"
              srcSet=""
              title="Show price chart"
            />
            <p>Settings</p>
          </>
        }
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
                src="home_pin_24dp_FILL0_wght400_GRAD0_opsz24_dkgreen.svg"
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
                src="person_pin_circle_24dp_255290_FILL0_wght400_GRAD0_opsz24.svg"
                className={styles.SetHome_Image}
              ></img>
              <p>Set Work</p>
            </button>

            {Object.keys(POI).map((poi) => {
              if (["home", "work"].includes(poi)) return;
              return (
                <button
                  key={poi}
                  className={styles.SetHome}
                  onClick={() => {
                    removeLocation(poi);
                  }}
                >
                  <img
                    src="location_on_24dp_8C1A10_FILL0_wght400_GRAD0_opsz24.svg"
                    className={styles.SetHome_Image}
                  ></img>
                  <p>Remove {capitalize(poi)}</p>
                </button>
              );
            })}

            <button
              className={styles.SetHome}
              onClick={async () => {
                const address = window.prompt("Address");
                if (!address) {
                  window.alert(`"${name} is not valid."`);
                  return;
                }
                const coord = await lookup(address);
                if (!coord) {
                  return;
                }

                const name = window.prompt("Location name");
                if (!name) {
                  window.alert(`"${name} is not valid."`);
                  return;
                }

                setCustomLocation(profile, name, coord);
              }}
            >
              <img
                src="location_on_24dp_8C1A10_FILL0_wght400_GRAD0_opsz24.svg"
                className={styles.SetHome_Image}
              ></img>
              <p>Add Custom Destination</p>
            </button>
            <h3>Preferences</h3>
            <button
              // className={styles.SetHome}
              onClick={() => {
                setDarkMode(!darkMode);
              }}
            >
              <p>DarkMode</p>
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
        </div>
      </ToolboxModal>
    </>
  );
};

export default SettingsModal;
