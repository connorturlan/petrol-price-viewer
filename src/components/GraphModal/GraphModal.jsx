import { useState } from "react";
import styles from "./GraphModal.module.scss";
import { LineChart } from "@mui/x-charts";

const GraphModal = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && (
        <div
          className={styles.GraphModal_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          <div
            className={styles.GraphModal_Body}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2 className={styles.GraphModal_Title}>Historical Prices</h2>
            <div
              className={styles.GraphModal_List}
              onClick={() => {
                setVisible(false);
              }}
            >
              <LineChart
                xAxis={[{ data: [1, 6, 10] }]}
                series={[{ data: [1, 10, 2] }]}
              />
            </div>
            <p>Touch anywhere to hide</p>
          </div>
        </div>
      )}
      <div
        className={styles.GraphModal_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        <img
          src="public/monitoring_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          alt="Show price chart"
          srcset=""
          title="Show price chart"
        />
        <p>Graph</p>
      </div>
    </>
  );
};

export default GraphModal;
