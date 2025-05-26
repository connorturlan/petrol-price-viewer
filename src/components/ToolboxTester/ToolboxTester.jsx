import styles from "./ToolboxTester.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";

const ToolboxTester = () => {
  const { fuelType, setFuelType } = useContext(AppContext);

  const handleFuelChange = (event) => {
    setFuelType(event.target.value);
  };

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="local_gas_station_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.ToolboxTester_Image}
            alt="Show"
            srcSet=""
            title="Show fuel type planner"
          />
          <p>Lol</p>
        </>
      }
    >
      <div className={`${styles.ToolboxTester_Body}`}>
        <h2 className={styles.ToolboxTester_Title}>Fuel Type</h2>
        <select onChange={handleFuelChange} value={fuelType}>
          {fueltypes["Fuels"].map((t) => {
            return (
              <option key={t.FuelId} value={t.FuelId}>
                {t.Name}
              </option>
            );
          })}
        </select>
      </div>
    </ToolboxModal>
  );
};

export default ToolboxTester;
