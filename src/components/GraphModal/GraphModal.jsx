import { useEffect, useState } from "react";
import styles from "./GraphModal.module.scss";
import { LineChart } from "@mui/x-charts";

const GraphModal = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData(
        [
          { date: "05-12-2024", price: 2006.95872772235 },
          { date: "05-13-2024", price: 2003.9345430881867 },
          { date: "05-14-2024", price: 2004.1536692284517 },
          { date: "05-15-2024", price: 2016.2008089480107 },
          { date: "05-16-2024", price: 2041.8070975797157 },
          { date: "05-17-2024", price: 2076.9949806880313 },
          { date: "05-18-2024", price: 2093.6417442132715 },
          { date: "05-19-2024", price: 2092.1089471262057 },
          { date: "05-20-2024", price: 2095.3593378818323 },
        ].map((o, index) => {
          return {
            ...o,
            cents: parseInt(o.price) / 10,
            index,
            utc: new Date(o.date),
          };
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
                    dataKey: "index",
                    valueFormatter: (v) => data[v]?.date,
                  },
                ]}
                // yAxis={[
                //   {
                //     max: 230,
                //     min: 150,
                //   },
                // ]}
                series={[
                  {
                    dataKey: "cents",
                    color: "rgb(122, 24, 24)",
                    padding: 20,
                  },
                ]}
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
