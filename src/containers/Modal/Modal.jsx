import { useState } from "react";
import styles from "./Modal.module.scss";

const Modal = ({ children, summary }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && (
        <div
          className={styles.RoutePlanner_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          {children}
        </div>
      )}
      <button
        className={styles.RoutePlanner_Show}
        onClick={() => {
          setVisible(true);
        }}
      >
        {summary}
      </button>
    </>
  );
};

export default Modal;
