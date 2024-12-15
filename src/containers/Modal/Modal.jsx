import { useState } from "react";
import styles from "./Modal.module.scss";

const Modal = ({ children, summary }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && (
        <div
          className={styles.Modal_Container}
          onClick={() => {
            setVisible(false);
          }}
        >
          {children}
        </div>
      )}
      <button
        className={styles.Modal_Show}
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
