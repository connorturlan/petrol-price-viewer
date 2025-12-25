import styles from "./LocationSelector.module.scss";
import cities from "./assets/cities.json";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";
import { convertCoord, convertCoordFromLatLon } from "../../utils/utils";
import { setCookie } from "../../utils/cookies";

const LocationSelector = () => {
  const publisher = usePub();

  const handleCityChange = (city) => {
    // publisher("FuelTypeChange", null);
    publisher("MapMoveTo", { coord: convertCoord(city.Coord), zoom: 13 });
    setCookie("mapCenter", JSON.stringify(city.Coord), 7);
  };

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="globe_location_pin_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.LocationSelector_Image}
            alt="Show"
            srcSet=""
            title="Show city selector"
          />
          <p>City</p>
        </>
      }
    >
      <div
        className={`${styles.LocationSelector_Body}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.LocationSelector_Title}>Fuel Type</h2>
        <h3>Cities</h3>
        <div className={styles.LocationSelector_Grid}>
          {cities.map((city) => {
            return (
              <button
                key={city.Name}
                className={`${styles.LocationSelector_Selector} ${
                  false ? styles.LocationSelector__Selected : ""
                }`}
                onClick={() => handleCityChange(city)}
              >
                <img src="location_city_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" />
                <p>{city.Name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </ToolboxModal>
  );
};

export default LocationSelector;
