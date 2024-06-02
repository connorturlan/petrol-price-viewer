import { useEffect, useState } from "react";
import styles from "./GraphModal.module.scss";
import { LineChart } from "@mui/x-charts";
// import dataset from "./dataset.json";
import { getFuelTypeName } from "../../utils/fueltypes";

const FUELTYPES = [2, 8, 3, 12];

const endpoint =
  import.meta.env.VITE_LOCAL == "TRUE" ||
  import.meta.env.VITE_LOCAL_HISTORY == "TRUE"
    ? "http://localhost:3000"
    : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod/history";

const GraphModal = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);

  const processPriceHistoryData = (dataset) => {
    const datasets = dataset.datasets
      .filter((s) => FUELTYPES.some((t) => t == s.fuelId))
      .map((s) => {
        return {
          ...s,
          label: getFuelTypeName(s.fuelId),
          cents: s.data.map((p) => parseInt(p) / 10),
        };
      });
    const datasetmappeds = {
      datasets,
      datelabels: dataset.dates,
      dateindexes: [...Array(dataset.dates.length).keys()],
    };
    setData(datasetmappeds);
  };

  useEffect(() => {
    setTimeout(() => {}, 1_000);

    const getHistoricPrices = async () => {
      const res = await fetch(endpoint);
      const json = await res.json();
      processPriceHistoryData(json);
    };

    getHistoricPrices();
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
                xAxis={[
                  {
                    label: "Date",
                    data: data.dateindexes,
                    valueFormatter: (v) => data.datelabels.at(v),
                  },
                ]}
                yAxis={[
                  {
                    label: "Price",
                    valueFormatter: (s) => s.cents,
                  },
                ]}
                series={data.datasets.map((s) => {
                  return {
                    type: "line",
                    data: s.cents || 0,
                    label: s.label,
                  };
                })}
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
      <button
        className={styles.GraphModal_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        <img
          src="monitoring_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          className={styles.GraphModal_Image}
          alt="Show"
          srcset=""
          title="Show price chart"
        />
        <p>Graph</p>
      </button>
    </>
  );
};

export default GraphModal;
