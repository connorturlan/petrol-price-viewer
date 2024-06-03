import { useState } from "react";
import styles from "./PriceList.module.scss";

function PriceList({ children }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && (
        <div
          className={styles.PriceList_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          <div
            className={styles.PriceList_Body}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2 className={styles.PriceList_Title}>Price List</h2>
            <div
              className={styles.PriceList_List}
              onClick={() => {
                setVisible(false);
              }}
            >
              {children}
            </div>
            <p>Touch anywhere to hide</p>
          </div>
        </div>
      )}
      <button
        className={styles.PriceList_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        <img
          src="list_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          className={styles.PriceList_Image}
          alt="Show"
          srcSet=""
          title="Show price list"
        />
        <p>List</p>
      </button>
    </>
  );
}

export default PriceList;
