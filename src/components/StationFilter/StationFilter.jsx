import styles from "./StationFilter.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";

const StationFilter = () => {
  const { fuelType, setFuelType } = useContext(AppContext);
  const publisher = usePub();

  const handleFuelDropdownChange = (event) => {
    setFuelType(event.target.value);

    const hideModals = usePub();
    hideModals("ToolboxModalHide");
  };

  const handleFuelChange = (fuelId) => {
    setFuelType(fuelId);

    publisher("FuelTypeChange", null);
  };

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="filter_alt_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.StationFilter_Image}
            alt="Show"
            srcSet=""
            title="Show fuel type planner"
          />
          <p>Filter</p>
        </>
      }
    >
      <div
        className={`${styles.StationFilter_Body}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.StationFilter_Title}>Fuel Type</h2>
        <h3>Petrol</h3>
        <div className={styles.StationFilter_Grid}>
          {fueltypes["Fuels"]
            .filter((t) => t.FuelId < 10000)
            .map((t) => {
              return (
                <button
                  key={t.FuelId}
                  className={`${styles.StationFilter_Selector} ${
                    t.FuelId == fuelType ? styles.StationFilter__Selected : ""
                  }`}
                  style={{
                    color: t.Color || "black",
                    borderColor: t.FuelId == fuelType && t.Color,
                  }}
                  onClick={() => handleFuelChange(t.FuelId)}
                >
                  <img src="local_gas_station_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" />
                  <p>{t.Name}</p>
                </button>
              );
            })}
        </div>
        <h3>Electic</h3>
        <div className={styles.StationFilter_Grid}>
          {fueltypes["Fuels"]
            .filter((t) => t.FuelId >= 10000)
            .map((t) => {
              return (
                <button
                  key={t.FuelId}
                  className={`${styles.StationFilter_Selector} ${
                    t.FuelId == fuelType ? styles.StationFilter__Selected : ""
                  }`}
                  style={{ color: t.Color || "black" }}
                  onClick={() => handleFuelChange(t.FuelId)}
                >
                  <img src="ev_station_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" />
                  <p>{t.Name}</p>
                </button>
              );
            })}
        </div>
      </div>
    </ToolboxModal>
  );
};

export default StationFilter;
