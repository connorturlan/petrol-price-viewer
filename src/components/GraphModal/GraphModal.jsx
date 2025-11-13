import { useEffect, useState } from "react";
import styles from "./GraphModal.module.scss";
import { ChartsLegend, LineChart } from "@mui/x-charts";
// import dataset from "./dataset.json";
import { getFuelTypeColor, getFuelTypeName } from "../../utils/fueltypes";
import { getHistoricPrices } from "../../services/service";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";

const FUELTYPES = [2, 8, 3, 12];

const GraphModal = () => {
  const [data, setData] = useState([]);

  const processPriceHistoryData = (dataset) => {
    if (!dataset.datasets) {
      return;
    }
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
      datelabels: dataset.dates.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      }),
      dateindexes: [...Array(dataset.dates.length).keys()],
    };
    setData(datasetmappeds);
  };

  useEffect(() => {
    const getHistory = async () => {
      const json = await getHistoricPrices();
      processPriceHistoryData(json);
    };

    getHistory();
  }, []);

  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="monitoring_24dp_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.GraphModal_Image}
            alt="History"
            srcSet=""
            title="Show price history chart"
          />
          {/* <p>History</p> */}
        </>
      }
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
          {data && data.datasets && (
            <>
              <LineChart
                xAxis={[
                  {
                    label: "Date",
                    data: data.dateindexes,
                    valueFormatter: (v) =>
                      data.datelabels.at(v)
                        ? new Date(data.datelabels.at(v)).toLocaleDateString()
                        : "",
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
                    color: getFuelTypeColor(s.fuelId),
                    showMark: false,
                  };
                })}
                slotProps={{
                  // Custom loading message
                  loadingOverlay: { message: "Waiting for data..." },
                  // Custom message for empty chart
                  noDataOverlay: { message: "Waiting for data..." },
                  legend: {
                    // direction: "vertical",
                    // position: {
                    //   vertical: "middle",
                    //   horizontal: "right",
                    // },
                  },
                }}
                grid={{ vertical: true, horizontal: false }}
                skipAnimation
              />
            </>
          )}
        </div>
      </div>
    </ToolboxModal>
  );
};

export default GraphModal;
