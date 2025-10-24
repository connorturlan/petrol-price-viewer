import { useContext, useState } from "react";
import styles from "./AppMenu.module.scss";
import LocationLookup from "../../components/LocationLookup/LocationLookup";
import { RouteContext } from "../../contexts/RouteContext";

const AppMenu = (props) => {
  const { origin, setOrigin, dest, setDest } = useContext(RouteContext);

  const [isMinimised, setMinimised] = useState(true);

  const [start, setStart] = useState(undefined);
  const [end, setEnd] = useState(undefined);

  const setStartLocation = (location) => {
    setStart(location);
    setOrigin(location);
    console.log(`start location set to ${location}`);
  };

  const setEndLocation = (location) => {
    setEnd(location);
    setDest(location);
    console.log(`end location set to ${location}`);
  };

  return (
    <div
      className={`${styles.AppMenu} ${isMinimised && styles.AppMenu_Minimised}`}
    >
      {!isMinimised && (
        <button
          onClick={() => {
            setMinimised(true);
          }}
        >
          Close
        </button>
      )}

      <LocationLookup
        onFocusCallback={(isFocused) => {
          if (isFocused) setMinimised(false);
        }}
        onSelectCallback={(location) => {
          setStartLocation(location);
        }}
      />

      {!isMinimised && start && (
        <>
          <p>swap</p>
          <LocationLookup
            // onFocusCallback={(isFocused) => {
            //   setMinimised(!isFocused);
            // }}
            onSelectCallback={(location) => {
              setEndLocation(location);
            }}
          />
        </>
      )}
    </div>
  );
};

export default AppMenu;
