import { useState } from "react";
import styles from "./PriceList.module.scss";

function PriceList({ children, stations }) {
  const [visible, setVisible] = useState(true);

  return visible ? (
    <div
      className={styles.PriceList_Container}
      onClick={() => {
        setVisible(false);
      }}
    >
      <div className={styles.PriceList_Body}>
        <h2 className={styles.PriceList_Title}>Price List</h2>
      </div>
      <p>touch anywhere to hide</p>
    </div>
  ) : (
    <div
      className={styles.PriceList_Show}
      onClick={() => {
        setVisible(true);
      }}
    >
      Show price list
    </div>
  );
}

export default PriceList;
