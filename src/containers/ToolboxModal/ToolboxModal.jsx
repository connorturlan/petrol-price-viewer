import { useEffect, useId, useState } from "react";
import styles from "./ToolboxModal.module.scss";
import { usePub, UseSub } from "../../utils/pubsub";

const ToolboxModal = ({ children, summary }) => {
  const [visible, setVisible] = useState(false);
  const [containerVisible, setContainerVisible] = useState(false);
  const refId = useId();

  useEffect(() => {
    if (visible) {
      setContainerVisible(true);
    }
  }, [visible]);

  const toggleModal = () => {
    setVisible(!visible);
    const hideModals = usePub();
    hideModals("ToolboxModalHide", refId);
  };

  UseSub("ToolboxModalHide", (data) => {
    if (data != refId) setVisible(false);
  });

  return (
    <>
      <button
        className={`${styles.ToolboxModal_Show} ${
          visible ? styles.ToolboxModal_Visible : styles.ToolboxModal_Hidden
        }`}
        onClick={toggleModal}
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
