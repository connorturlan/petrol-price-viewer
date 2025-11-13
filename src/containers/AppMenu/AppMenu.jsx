import { useContext, useState } from "react";
import styles from "./AppMenu.module.scss";
import LocationLookup from "../../components/LocationLookup/LocationLookup";
import { RouteContext } from "../../contexts/RouteContext";
import { getCoordinatesWithAddressQuery } from "../../utils/navigation";
import AddressPicker from "../../components/AddressPicker/AddressPicker";
import { ObjectIsEmpty } from "../../utils/utils";

const AppMenu = (props) => {
  const { origin, setOrigin, dest, setDest } = useContext(RouteContext);

  const [previousAddresses, setPreviousAddresses] = useState([]);

  const [isMinimised, setMinimised] = useState(true);

  const [start, setStart] = useState(undefined);
  const [end, setEnd] = useState(undefined);

  const [originValue, setOriginValue] = useState("");
  const [endValue, setEndValue] = useState("");

  const [addressList, setAddressList] = useState([]);

  const setStartLocation = (location) => {
    if (!previousAddresses.includes(location)) {
      const newAddresses = previousAddresses.slice();
      newAddresses.push(location);
      setPreviousAddresses(newAddresses);
    }
    setStart(location);
    setOrigin(location);
    console.log(`start location set to ${location}`);
  };

  const setEndLocation = (location) => {
    if (!previousAddresses.includes(location)) {
      const newAddresses = previousAddresses.slice();
      newAddresses.push(location);
      setPreviousAddresses(newAddresses);
    }
    setEnd(location);
    setDest(location);
    console.log(`end location set to ${location}`);
  };

  const swapLocations = () => {
    const temp = start;
    setStartLocation(end);
    setEndLocation(temp);

    const tempValue = originValue;
    setOriginValue(endValue);
    setEndValue(tempValue);
  };

  const handleStartChange = (name, location) => {
    console.log("start location change to", location);
    setOriginValue(name);
    setStartLocation(location);
  };

  const handleEndChange = (name, location) => {
    console.log("end location change to", location);
    setEndValue(name);
    setEndLocation(location);
  };

  return (
    <div className={`${styles.AppMenu}`}>
      {/* origin and current search bar */}
      <LocationLookup
        placeholder="search"
        initialValue={originValue}
        onSelectCallback={handleStartChange}
      />
      {/* functions hamburger menu */}
      {/* <div>
        <button className={`${styles.AppMenu_Hamburger}`}>=</button>
      </div> */}
      {/* swap button */}
      {!ObjectIsEmpty(origin) && (
        <button
          className={`${styles.AppMenu_Hamburger} ${styles.AppMenu_Hamburger_Swap}`}
          onClick={swapLocations}
        >
          <img
            src="swap_horiz_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.AppMenu_Hamburger_SwapImage}
            alt="Show"
            srcSet=""
            title="Show route planner"
          />
        </button>
      )}
      {/* destination searchbar */}
      {!ObjectIsEmpty(origin) && (
        <LocationLookup
          placeholder="destination"
          initialValue={endValue}
          onSelectCallback={handleEndChange}
        />
      )}
      {/* go button */}
      {/* <div>
        <button className={`${styles.AppMenu_Hamburger}`}>go</button>
      </div> */}
    </div>
  );
};

export default AppMenu;
