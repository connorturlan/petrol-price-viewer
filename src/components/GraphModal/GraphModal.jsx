import { useEffect, useState } from "react";
import styles from "./GraphModal.module.scss";
import { LineChart } from "@mui/x-charts";
import { dataset } from "./dataset.json";

const GraphModal = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData(
        dataset.map((o, index) => {
          return o.data.map((p, index) => {
            return {
              ...p,
              cents: parseInt(p.price) / 10,
              index,
              utc: new Date(p.date),
            };
          });
        })
      );
    }, 1_000);
  }, []);

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
              <p>Cents per Litre</p>
              <LineChart
                dataset={data}
                xAxis={[
                  {
                    label: "Date",
                    type: "date",
                    dataKey: "data.index",
                    valueFormatter: (v) => data[v]?.date,
                  },
                ]}
                // yAxis={[
                //   {
                //     max: 230,
                //     min: 150,
                //   },
                // ]}
                series={datasets || {}}
                slotProps={{
                  // Custom loading message
                  loadingOverlay: { message: "Waiting for data..." },
                  // Custom message for empty chart
                  noDataOverlay: { message: "Waiting for data..." },
                }}
                grid={{ vertical: true, horizontal: true }}
                margin={{ top: 10 }}
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
          src="monitoring_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          alt="Show"
          srcset=""
          title="Show price chart"
        />
        <p>Graph</p>
      </div>
    </>
  );
};

export default GraphModal;
