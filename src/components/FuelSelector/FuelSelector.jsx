import styles from "./FuelSelector.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";

const FuelSelector = () => {
  const { fuelType, setFuelType } = useContext(AppContext);

  const handleFuelChange = (event) => {
    setFuelType(event.target.value);
  };

  return (
    <Modal
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
        <select onChange={handleFuelChange} value={fuelType}>
          {fueltypes["Fuels"].map((t) => {
            return (
              <option key={t.FuelId} value={t.FuelId}>
                {t.Name}
              </option>
            );
          })}
        </select>
        <p>Touch anywhere to hide</p>
      </div>
    </Modal>
  );
};

export default FuelSelector;
