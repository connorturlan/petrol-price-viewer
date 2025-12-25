import { useContext } from "react";
import styles from "./CurrentLocation.module.scss";
import { RouteContext } from "../../contexts/RouteContext";

const CurrentLocation = (props) => {
  const { setOrigin } = useContext(RouteContext);

  const setStartLocation = (location) => {
    setOrigin(location);
    console.log(`start location set to ${location}`);
  };

  const handleLocationChange = (name, location) => {
    console.log("location change to", location);
    setStartLocation(location);
  };

  // handle location based access
  const locationEnabled = "geolocation" in navigator;
  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      handleLocationChange("Current Location", {
        Name: "Current Location",
        Lat: parseFloat(position.coords.longitude),
        Lng: parseFloat(position.coords.latitude),
      });
    });
  };

  return (
    <div className={styles.CurrentLocation_Container}>
      <img
        className={`${styles.CurrentLocation_Button} ${
          !locationEnabled && styles.CurrentLocation_Button__Disabled
        }`}
        src="near_me_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
        onClick={handleCurrentLocation}
      ></img>
    </div>
  );
};

export default CurrentLocation;
