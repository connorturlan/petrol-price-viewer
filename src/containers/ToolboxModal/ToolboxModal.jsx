import { useEffect, useState } from "react";
import styles from "./ToolboxModal.module.scss";

const ToolboxModal = ({ children, summary }) => {
  const [visible, setVisible] = useState(false);
  const [containerVisible, setContainerVisible] = useState(false);

  useEffect(() => {
    if (visible) setContainerVisible(true);
  }, [visible]);

  return (
    <>
      <button
        className={`${styles.ToolboxModal_Show} ${
          visible ? styles.ToolboxModal_Visible : styles.ToolboxModal_Hidden
        }`}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        {summary}
      </button>
      {containerVisible && (
        <div
          className={`${styles.ToolboxModal_Container} ${
            visible
              ? styles.ToolboxModal_Container__Show
              : styles.ToolboxModal_Container__Hide
          }`}
          onAnimationEnd={() => {
            setContainerVisible(visible);
          }}
        >
          <button
            className={`${styles.ToolboxModal_Button} ${styles.ToolboxModal_Hide}`}
            onClick={() => {
              setVisible(false);
            }}
          >
            Hide
          </button>
          {children}
        </div>
      )}
    </>
  );
};

export default ToolboxModal;
