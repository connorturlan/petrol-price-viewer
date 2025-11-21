import styles from "./StationFilter.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";
import { RouteContext } from "../../contexts/RouteContext";
import {
  getImageFromStationBrandId,
  getNameFromStationBrandId,
  ObjectIsEmpty,
} from "../../utils/utils";
import { UserContext } from "../../contexts/UserContext";
import { getCoordinatesWithAddressQuery } from "../../utils/navigation";
import LocationLookup from "../LocationLookup/LocationLookup";

const StationFilter = ({ stationData }) => {
  const publisher = usePub();

  const { origin, setOrigin, getOrigin } = useContext(RouteContext);
  const { profile, POI, loginState, setCustomLocation } =
    useContext(UserContext);

  const [distance, setDistance] = useState(2);

  const [customOrigin, setCustomOrigin] = useState("");
  const [customOriginInput, setCustomOriginInput] = useState("");

  const [lookupInProgess, setLookupProgress] = useState(false);

  const [showAddressList, toggleAddressList] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [addressListCallback, setAddressListCallback] = useState(() => {});

  const handleDistanceChange = (event) => {
    setDistance(event.target.value);
  };

  function isPointSelected(poi, parent) {
    return !ObjectIsEmpty(parent) && parent.Name == poi;
  }

  const lookup = async (address, isOrigin) => {
    if (lookupInProgess) return;
    if (!address) return;

    setLookupProgress(true);
    const addressData = await getCoordinatesWithAddressQuery(address);
    setLookupProgress(false);
    // setTimeout(() => {
    // }, 2_000);

    if (ObjectIsEmpty(addressData) || addressData.length <= 0) {
      window.alert(`no address found for ${address}`);
      return;
    }
    console.log(addressData);
    if (addressData.length > 1) {
      // window.alert(`multiple addresses found for ${address}`);
      toggleAddressList(true);
      setAddressList(addressData);
      setAddressListCallback(() => {
        return (selectedAddress) => {
          toggleAddressList(false);
          console.log(address, selectedAddress);
          setWaypoint(isOrigin, address, selectedAddress);
        };
      });
      return true;
    }
    toggleAddressList(false);

    console.log(address, addressData);

    setWaypoint(isOrigin, address, addressData.at(0));
    return true;
  };

  const lookupOrigin = () => {
    lookup(customOriginInput, true);
  };

  const updateState = (event, handler) => {
    handler(event.target.value);
  };

  const setWaypoint = (isOrigin, address, addressData) => {
    if (isOrigin) {
      setCustomOrigin(address);
      setOrigin({
        Name: "start",
        Lat: parseFloat(addressData.lon),
        Lng: parseFloat(addressData.lat),
      });
    } else {
      setCustomDest(address);
      setDest({
        Name: "end",
        Lat: parseFloat(addressData.lon),
        Lng: parseFloat(addressData.lat),
      });
    }
  };

  const updateFilter = () => {
    if (ObjectIsEmpty(origin)) return;
    publisher("UpdateDistanceFilter", {
      center: origin,
      distance: distance * 1_000,
    });
  };

  // useEffect(updateFilter, [customOrigin]);

  const [filteredBrands, setFilteredBrands] = useState([]);

  const toggleBrandInFilter = (brandID) => {
    const newFilter = filteredBrands.slice();

    if (filteredBrands.includes(brandID)) {
      console.log(`[FILTER] removing brand id ${brandID} to filter.`);
      const index = newFilter.indexOf(brandID);
      newFilter.splice(index, 1);
    } else {
      console.log(`[FILTER] adding brand id ${brandID} to filter.`);
      newFilter.push(brandID);
    }

    setFilteredBrands(newFilter);
  };

  const clearBrandFilter = () => {
    setFilteredBrands([]);
  };

  useEffect(() => {
    publisher("UpdateStationFilter", {
      brandIDs: filteredBrands,
    });
  }, [filteredBrands]);

  const filteredSectors = stationData?.map((sector) => sector.BrandID || 0);
  const uniqueSet = new Set(filteredSectors);
  const brandIDs = [...uniqueSet];

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="filter_alt_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.StationFilter_Image}
            alt="Filter"
            srcSet=""
            title="Show fuel type planner"
          />
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
          <div className={styles.StationFilter_Range}>
            <input
              className={styles.StationFilter_RangeInput}
              type="range"
              value={distance}
              onChange={handleDistanceChange}
              onMouseUp={updateFilter}
              onTouchEnd={updateFilter}
              min={1}
              max={20}
            ></input>
            <p className={styles.StationFilter_RangeLabel}>{distance} km</p>
          </div>
          <h3>Filter By Brand</h3>
          <div className={styles.StationFilter_Brand}>
            <div className={styles.StationFilter_Brand_Reset}>
              <img
                src="close_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
                onClick={clearBrandFilter}
              />
            </div>
            <div className={styles.StationFilter_BrandSelector}>
              {brandIDs.map((brandID) => {
                const imageSource = getImageFromStationBrandId(brandID);
                return (
                  <div>
                    <img
                      key={brandID}
                      className={`${styles.StationFilter_BrandImage} ${
                        !filteredBrands.includes(brandID) &&
                        styles.StationFilter_BrandImage__Hidden
                      }`}
                      src={imageSource}
                      onClick={() => {
                        toggleBrandInFilter(brandID);
                      }}
                    ></img>
                    {imageSource === "red-pin.svg" && (
                      <p className={styles.StationFilter_BrandImage_Text}>
                        {getNameFromStationBrandId(brandID)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.StationFilter_Grid}></div>
      </div>
    </ToolboxModal>
  );
};

export default StationFilter;
