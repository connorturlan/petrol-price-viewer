import styles from "./StationFilter.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";
import { RouteContext } from "../../contexts/RouteContext";
import { ObjectIsEmpty } from "../../utils/utils";

const StationFilter = () => {
  const publisher = usePub();

  const { origin, setOrigin, getOrigin } = useContext(RouteContext);

  const [distance, setDistance] = useState(2);

  const handleDistanceChange = (event) => {
    setDistance(event.target.value);
  };

  useEffect(() => {
    if (ObjectIsEmpty(origin)) return;
    publisher("UpdateDistanceFilter", {
      center: origin,
      distance: distance * 1_000,
    });
  }, [distance]);

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
        <h2 className={styles.StationFilter_Title}>Filter Stations</h2>
        <div>
          <h3>Within Range</h3>
          <input
            type="number"
            value={distance}
            onChange={handleDistanceChange}
          ></input>
          <p>km</p>
          <div></div>
        </div>
        <div className={styles.StationFilter_Grid}></div>
      </div>
    </ToolboxModal>
  );
};

export default StationFilter;
