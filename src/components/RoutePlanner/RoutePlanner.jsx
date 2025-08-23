import { useContext, useEffect, useState } from "react";
import styles from "./RoutePlanner.module.scss";
import { UserContext } from "../../contexts/UserContext";
import { RouteContext } from "../../contexts/RouteContext";
import { ObjectIsEmpty } from "../../utils/utils";
import Modal from "../../containers/Modal/Modal";
import {
  getCoordinatesOfAddress,
  getCoordinatesWithAddressQuery,
} from "../../utils/navigation";
import { add } from "ol/coordinate";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";
import AddressPicker from "../AddressPicker/AddressPicker";

const RoutePlanner = (props) => {
  const { profile, POI, loginState, setCustomLocation } =
    useContext(UserContext);
  const { origin, setOrigin, dest, setDest } = useContext(RouteContext);

  const [lookupInProgess, setLookupProgress] = useState(false);

  const [customOrigin, setCustomOrigin] = useState("");
  const [customOriginInput, setCustomOriginInput] = useState("");
  const [customDest, setCustomDest] = useState("");
  const [customDestInput, setCustomDestInput] = useState("");

  const [showAddressList, toggleAddressList] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [addressListCallback, setAddressListCallback] = useState(() => {});

  function isPointSelected(poi, parent) {
    return !ObjectIsEmpty(parent) && parent.Name == poi;
  }

  function swapPoints() {
    setOrigin(dest);
    setDest(origin);

    const newDest = customOrigin;
    setCustomOrigin(customDest);
    setCustomOriginInput(customDest);
    setCustomDest(newDest);
    setCustomDestInput(newDest);
  }

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

  const lookup = async (address, isOrigin) => {
    if (lookupInProgess) return;
    if (!address) return;

    setLookupProgress(true);
    const addressData = await getCoordinatesWithAddressQuery(address);
    setTimeout(() => {
      setLookupProgress(false);
    }, 2_000);

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

  const lookupDest = async () => {
    lookup(customDestInput, false);
  };

  const updateState = (event, handler) => {
    handler(event.target.value);
  };

  // const saveCustom = async (address) => {
  //   const name = window.prompt("Location Name");

  //   if (!name) return;

  //   setLookupProgress(true);
  //   const addressData = await getCoordinatesOfAddress(address);
  //   setTimeout(() => {
  //     setLookupProgress(false);
  //   }, 2_000);

  //   setCustomLocation();
  // };

  // if (ObjectIsEmpty(profile)) return <></>;

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="route_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.RoutePlanner_Image}
            alt="Show"
            srcSet=""
            title="Show route planner"
          />
          <p>Plan</p>
        </>
      }
    >
      <div
        className={`${styles.RoutePlanner_Body} ${
          !loginState && styles.RoutePlanner_Body__Short
        }`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.RoutePlanner_Title}>Route Planner</h2>
        <div className={styles.RoutePlanner_Lookup}>
          <h3>Origin</h3>
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
            onChange={(e) => updateState(e, setCustomOriginInput)}
          ></input>
          <h3>Destination</h3>
          <input
            name="custom-destination"
            autoComplete="true"
            className={`${
              lookupInProgess && styles.RoutePlanner_Lookup__Loading
            }`}
            disabled={lookupInProgess}
            onKeyDown={(event) => {
              if (event.key === "Enter") lookupDest(event);
            }}
            onBlur={lookupDest}
            placeholder="e.g. 52 Wallaby Way, Sydney NSW 2000"
            value={customDestInput}
            onChange={(e) => updateState(e, setCustomDestInput)}
          ></input>
        </div>
        <div className={styles.RoutePlanner_AddressList}>
          {showAddressList && (
            <AddressPicker
              addresses={addressList}
              onSelect={addressListCallback}
            />
          )}
        </div>
        <div className={styles.RoutePlannerPOIBody}>
          <div className={styles.RoutePlanner_Places}>
            {loginState && (
              <>
                <div className={styles.RoutePlanner_List}>
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
                </div>
                <div className={styles.RoutePlanner_Swap}>
                  <button
                    className={styles.RoutePlanner_Button}
                    onClick={swapPoints}
                  >
                    <img
                      src="swap_horiz_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg"
                      className={styles.RoutePlanner_Image}
                      alt="Show"
                      srcSet=""
                      title="Show route planner"
                    />
                    <p>Swap</p>
                  </button>
                </div>
                <div className={styles.RoutePlanner_List}>
                  <div className={styles.RoutePlanner_ColumnHeading}>
                    <h3>Destination</h3>
                    <p>
                      <i>{ObjectIsEmpty(dest) ? "" : dest.Name}</i>
                    </p>
                  </div>
                  {!ObjectIsEmpty(origin) ? (
                    Object.keys(POI).map((poi, index) => {
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setCustomDest("");
                            if (isPointSelected(poi, dest)) {
                              setDest({});
                            } else {
                              setDest(POI[poi]);
                            }
                          }}
                          className={
                            styles.RoutePlanner_Button +
                            " " +
                            (isPointSelected(poi, dest)
                              ? styles.RoutePlanner_Point__Selected
                              : "") +
                            " " +
                            (origin.Name == poi
                              ? styles.RoutePlanner_Point__InUse
                              : "")
                          }
                          style={{ gridRowStart: index + 1 }}
                        >
                          {poi}
                        </button>
                      );
                    })
                  ) : (
                    <p>Select Origin</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* <div
        className={`${styles.RoutePlanner_Body} ${
          !loginState && styles.RoutePlanner_Body__Short
        }`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.RoutePlanner_Title}>Route Planner</h2>
        <div className={styles.RoutePlanner_Lookup}>
          <h3>Origin</h3>
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
            onChange={(e) => updateState(e, setCustomOriginInput)}
          ></input>
          <h3>Destination</h3>
          <input
            name="custom-destination"
            autoComplete="true"
            className={`${
              lookupInProgess && styles.RoutePlanner_Lookup__Loading
            }`}
            disabled={lookupInProgess}
            onKeyDown={(event) => {
              if (event.key === "Enter") lookupDest(event);
            }}
            onBlur={lookupDest}
            placeholder="e.g. 52 Wallaby Way, Sydney NSW 2000"
            value={customDestInput}
            onChange={(e) => updateState(e, setCustomDestInput)}
          ></input>
        </div>
        {loginState && (
          <>
            <div className={styles.RoutePlanner_List}>
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
            </div>
            <div className={styles.RoutePlanner_Swap}>
              <button
                className={styles.RoutePlanner_Button}
                onClick={swapPoints}
              >
                <img
                  src="swap_horiz_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg"
                  className={styles.RoutePlanner_Image}
                  alt="Show"
                  srcSet=""
                  title="Show route planner"
                />
                <p>Swap</p>
              </button>
            </div>
            <div className={styles.RoutePlanner_List}>
              <div className={styles.RoutePlanner_ColumnHeading}>
                <h3>Destination</h3>
                <p>
                  <i>{ObjectIsEmpty(dest) ? "" : dest.Name}</i>
                </p>
              </div>
              {!ObjectIsEmpty(origin) ? (
                Object.keys(POI).map((poi, index) => {
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCustomDest("");
                        if (isPointSelected(poi, dest)) {
                          setDest({});
                        } else {
                          setDest(POI[poi]);
                        }
                      }}
                      className={
                        styles.RoutePlanner_Button +
                        " " +
                        (isPointSelected(poi, dest)
                          ? styles.RoutePlanner_Point__Selected
                          : "") +
                        " " +
                        (origin.Name == poi
                          ? styles.RoutePlanner_Point__InUse
                          : "")
                      }
                      style={{ gridRowStart: index + 1 }}
                    >
                      {poi}
                    </button>
                  );
                })
              ) : (
                <p>Select Origin</p>
              )}
            </div>
          </>
        )}
        <p>Touch anywhere to hide</p>
      </div> */}
    </ToolboxModal>
  );
};

export default RoutePlanner;
