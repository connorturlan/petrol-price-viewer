import styles from "./StationFilter.module.scss";
import fueltypes from "../../assets/fueltypes.json";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import { usePub } from "../../utils/pubsub";
import { RouteContext } from "../../contexts/RouteContext";
import { ObjectIsEmpty } from "../../utils/utils";
import { UserContext } from "../../contexts/UserContext";
import { getCoordinatesWithAddressQuery } from "../../utils/navigation";
import LocationLookup from "../LocationLookup/LocationLookup";

const StationFilter = () => {
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

  useEffect(updateFilter, [customOrigin]);

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
          {/* <p>Filter</p> */}
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

          {/* <div>
            <LocationLookup onSelectCallback={setOrigin} />
          </div> */}
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
            <p>{distance} km</p>
          </div>
          {/* <div className={styles.RoutePlanner_List}>
            <input
              type="text"
              id="custom-origin"
              name="custom-origin"
              autoComplete="on"
              className={`${
                lookupInProgess && styles.RoutePlanner_Lookup__Loading
              }`}
              disabled={lookupInProgess}
              onKeyDown={(event) => {
                if (event.key === "Enter") lookupOrigin(event);
              }}
              onBlur={lookupOrigin}
              placeholder="e.g. 52 Wallaby Way, Sydney NSW 2000"
              value={customOriginInput}
              onChange={(e) => {
                updateState(e, setCustomOriginInput);
                // completeOrigin(e.target.value);
              }}
            ></input>
            <div className={styles.RoutePlanner_AddressList}>
              {showAddressList && (
                <AddressPicker
                  addresses={addressList}
                  onSelect={addressListCallback}
                />
              )}
            </div>
            {loginState && (
              <>
                <div className={styles.RoutePlanner_ColumnHeading}>
                  <h3>Origin</h3>
                  <p>
                    <i>{ObjectIsEmpty(origin) ? "" : origin.Name}</i>
                  </p>
                </div>
                {Object.keys(POI).map((poi) => {
                  return (
                    <button
                      key={poi}
                      onClick={() => {
                        setCustomOrigin("");
                        if (isPointSelected(poi, origin)) {
                          setOrigin({});
                        } else {
                          setOrigin(POI[poi]);
                        }
                      }}
                      className={
                        styles.RoutePlanner_Button +
                        " " +
                        (isPointSelected(poi, origin)
                          ? styles.RoutePlanner_Point__Selected
                          : "")
                      }
                    >
                      {poi}
                    </button>
                  );
                })}
              </>
            )}
          </div> */}
        </div>
        <div className={styles.StationFilter_Grid}></div>
      </div>
    </ToolboxModal>
  );
};

export default StationFilter;
