import styles from "./FuelSelector.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";

const FuelSelector = () => {
  const { fuelType, setFuelType } = useContext(AppContext);

  const handleFuelDropdownChange = (event) => {
    setFuelType(event.target.value);

    const hideModals = usePub();
    hideModals("ToolboxModalHide");
  };

  const handleFuelChange = (fuelId) => {
    setFuelType(fuelId);

    // const hideModals = usePub();
    // hideModals("ToolboxModalHide");
  };

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="local_gas_station_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.FuelSelector_Image}
            alt="Show"
            srcSet=""
            title="Show fuel type planner"
          />
          <p>Fuel</p>
        </>
      }
    >
      <div
        className={`${styles.FuelSelector_Body}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.FuelSelector_Title}>Fuel Type</h2>
        <h3>Petrol</h3>
        <div className={styles.FuelSelector_Grid}>
          {fueltypes["Fuels"]
            .filter((t) => t.FuelId < 10000)
            .map((t) => {
              return (
                <button
                  key={t.FuelId}
                  className={`${styles.FuelSelector_Selector} ${
                    t.FuelId == fuelType ? styles.FuelSelector__Selected : ""
                  }`}
                  style={{
                    color: t.Color || "black",
                    borderColor: t.FuelId == fuelType && t.Color,
                  }}
                  onClick={() => handleFuelChange(t.FuelId)}
                >
                  {t.Name}
                </button>
              );
            })}
        </div>
        <h3>Electic</h3>
        <div className={styles.FuelSelector_List}>
          {fueltypes["Fuels"]
            .filter((t) => t.FuelId >= 10000)
            .map((t) => {
              return (
                <button
                  key={t.FuelId}
                  className={`${styles.FuelSelector_Selector} ${
                    t.FuelId == fuelType ? styles.FuelSelector__Selected : ""
                  }`}
                  style={{ color: t.Color || "black" }}
                  onClick={() => handleFuelChange(t.FuelId)}
                >
                  {t.Name}
                </button>
              );
            })}
        </div>
      </div>
    </ToolboxModal>
  );
};

export default FuelSelector;
