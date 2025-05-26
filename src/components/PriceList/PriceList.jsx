import { useState } from "react";
import styles from "./PriceList.module.scss";
import Modal from "../../containers/Modal/Modal";
import ToolboxModal from "../../containers/ToolboxModal/ToolboxModal";

function PriceList({ children }) {
  return (
    <ToolboxModal
      summary={
        <>
          <img
            src="list_24dp_FILL0_wght400_GRAD0_opsz24.svg"
            className={styles.PriceList_Image}
            alt="Show"
            srcSet=""
            title="Show price list"
          />
          <p>List</p>
        </>
      }
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
        {/* <p>Touch anywhere to hide</p> */}
      </div>
    </ToolboxModal>
  );
}

export default PriceList;
