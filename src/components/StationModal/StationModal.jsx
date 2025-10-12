import { useContext, useEffect, useState } from "react";
import styles from "./StationModal.module.scss";
import { AppContext } from "../../contexts/AppContext";
import { ENDPOINT } from "../../utils/defaults";
import { getImageFromStationBrandId, ObjectIsEmpty } from "../../utils/utils";
import { getFuelTypeName } from "../../utils/fueltypes";
import LoadingSplash from "../LoadingSplash/LoadingSplash";

function StationModal() {
  const { siteId, unselectSite, fuelType } = useContext(AppContext);
  const [siteDetails, setSiteDetails] = useState({});

  // hide the modal.
  const hideModal = () => {
    unselectSite();
    setSiteDetails({});
  };

  // fetch the station details for the modal.
  const getSiteDetails = async () => {
    const res = await fetch(`${ENDPOINT}/station?siteid=${siteId}`);
    if (res.status != 200) {
      console.error("unable to get site details");
      return;
    }

    const json = await res.json();
    setSiteDetails(json);
  };

  const getSitePrices = () => {
    return Array.from(Object.values(siteDetails.FuelTypes)).map((record) => {
      const className =
        fuelType == record.FuelId
          ? [
              styles.StationModal_Prices_Row,
              styles.StationModal_Prices_Row__Selected,
            ].join(" ")
          : styles.StationModal_Prices_Row;

      return (
        <div className={className} key={record.FuelId}>
          <p>{getFuelTypeName(record.FuelId)}</p>
          <p>{((record.Price || 0) / 10).toFixed(1)}</p>
        </div>
      );
    });
  };

  // get details for the modal to display.
  useEffect(() => {
    // catch falsey site ids.
    if (!siteId) return;

    // get the station details to display.
    getSiteDetails();
  }, [siteId]);

  // if anything has a falsey value, return to prevent errors.
  if (!siteId) return <></>;

  const date = new Date(siteDetails.LastUpdated);
  const datestring = `${date.toLocaleString()}`;
  const imageSrc = getImageFromStationBrandId(siteDetails.BrandID);

  return ObjectIsEmpty(siteDetails) ? (
    <LoadingSplash />
  ) : (
    <div className={styles.StationModal_Blackout} onClick={hideModal}>
      <div
        className={styles.StationModal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button onClick={hideModal}>X</button>
        <div className={styles.StationModal_Container}>
          <div className={styles.StationModal_Title}>
            <img src={imageSrc} alt="" srcset="" />
            <h2>{siteDetails.Name}</h2>
          </div>
          <div className={styles.StationModal_Prices}>{getSitePrices()}</div>
          <p></p>
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${siteDetails.GPI}`}
            target="_blank"
            className={styles.StationModal_Maps}
          >
            <img
              src="explore_24dp_FILL0_wght400_GRAD0_opsz24.svg"
              alt="Navigate"
              srcSet=""
              title="Navigate"
            />
            <p>Open Maps</p>
          </a>
          <p>Last updated: {datestring || "Date Error"}</p>
        </div>
      </div>
    </div>
  );
}

export default StationModal;
