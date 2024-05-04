import { useState } from "react";
import styles from "./PriceList.module.scss";

function PriceList({ children }) {
  const [visible, setVisible] = useState(false);

  return visible ? (
    <div
      className={styles.PriceList_Container}
      onClick={() => {
        setVisible(false);
      }}
    >
      <div className={styles.PriceList_Body}>
        <h2 className={styles.PriceList_Title}>Price List</h2>
        {children}
      </div>
      <p>Touch anywhere to hide</p>
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
