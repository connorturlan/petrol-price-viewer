import { useContext, useState } from "react";
import styles from "./RoutePlanner.module.scss";
import { UserContext } from "../../contexts/UserContext";
import { RouteContext } from "../../contexts/RouteContext";
import { ObjectIsEmpty } from "../../utils/utils";

const RoutePlanner = (props) => {
  const [visible, setVisible] = useState(false);

  const { POI } = useContext(UserContext);
  const { origin, setOrigin, dest, setDest } = useContext(RouteContext);

  function isPointSelected(poi, parent) {
    return !ObjectIsEmpty(parent) && parent.Name == poi;
  }

  return (
    <>
      {visible && (
        <div
          className={styles.RoutePlanner_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          <div
            className={styles.RoutePlanner_Body}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2 className={styles.RoutePlanner_Title}>Route Planner</h2>
            <div className={styles.RoutePlanner_List}>
              <h3>Origin</h3>
              {Object.keys(POI).map((poi) => {
                return (
                  <button
                    key={poi}
                    onClick={() => {
                      setOrigin(POI[poi]);
                    }}
                    className={
                      isPointSelected(poi, origin)
                        ? styles.RoutePlanner_Point__Selected
                        : ""
                    }
                  >
                    {poi}:
                  </button>
                );
              })}
            </div>
            <button>swap</button>
            <div className={styles.RoutePlanner_List}>
              <h3>Destination</h3>
              {!ObjectIsEmpty(origin) ? (
                Object.keys(POI)
                  .filter((poi) => origin.Name != poi)
                  .map((poi) => {
                    return (
                      <button
                        key={poi}
                        onClick={() => {
                          setDest(POI[poi]);
                        }}
                        className={
                          isPointSelected(poi, dest)
                            ? styles.RoutePlanner_Point__Selected
                            : ""
                        }
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
        </div>
      )}
      <button
        className={styles.RoutePlanner_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        <img
          src="list_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          className={styles.RoutePlanner_Image}
          alt="Show"
          srcSet=""
          title="Show route planner"
        />
        <p>Plan</p>
      </button>
    </>
  );
};

export default RoutePlanner;
