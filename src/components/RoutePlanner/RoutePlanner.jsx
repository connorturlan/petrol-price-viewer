import { useContext, useEffect, useState } from "react";
import styles from "./RoutePlanner.module.scss";
import { UserContext } from "../../contexts/UserContext";
import { RouteContext } from "../../contexts/RouteContext";
import { ObjectIsEmpty } from "../../utils/utils";
import Modal from "../../containers/Modal/Modal";

const RoutePlanner = (props) => {
  const { profile, POI } = useContext(UserContext);
  const { origin, setOrigin, dest, setDest } = useContext(RouteContext);

  function isPointSelected(poi, parent) {
    return !ObjectIsEmpty(parent) && parent.Name == poi;
  }

  function swapPoints() {
    setOrigin(dest);
    setDest(origin);
  }

  useEffect(() => {
    setOrigin(POI.home);
    setDest(POI.work);
  }, []);

  if (ObjectIsEmpty(profile)) return <></>;

  return (
    <Modal
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
        className={styles.RoutePlanner_Body}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className={styles.RoutePlanner_Title}>Route Planner</h2>
        <div className={styles.RoutePlanner_List}>
          <div className={styles.RoutePlanner_ColumnHeading}>
            <h3>Origin</h3>
            <p>{ObjectIsEmpty(origin) ? "" : origin.Name}</p>
          </div>
          {Object.keys(POI).map((poi) => {
            return (
              <button
                key={poi}
                onClick={() => {
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
          <button className={styles.RoutePlanner_Button} onClick={swapPoints}>
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
            <p>{ObjectIsEmpty(dest) ? "" : dest.Name}</p>
          </div>
          {!ObjectIsEmpty(origin) ? (
            Object.keys(POI).map((poi, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
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
                    (origin.Name == poi ? styles.RoutePlanner_Point__InUse : "")
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
        <p>Touch anywhere to hide</p>
      </div>
    </Modal>
  );
};

export default RoutePlanner;
