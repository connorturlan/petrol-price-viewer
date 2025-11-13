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

  const hideModal = () => {
    setVisible(false);
    const hideModals = usePub();
    hideModals("ToolboxModalHide", refId);
  };

  UseSub("ToolboxModalHide", (data) => {
    if (data != refId) setVisible(false);
  });

  return (
    <>
      <button
        className={`${styles.ToolboxModal_Hamburger} ${
          visible ? styles.ToolboxModal_Visible : styles.ToolboxModal_Hidden
        }`}
        onClick={toggleModal}
      >
        {summary}
      </button>
      {/* <button
        className={`${styles.ToolboxModal_Show} ${
          visible ? styles.ToolboxModal_Visible : styles.ToolboxModal_Hidden
        }`}
        onClick={toggleModal}
      >
        {summary}
      </button> */}
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
            <img
              src="close_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
              className={styles.Toolbox_Image}
              alt="Hide"
              srcSet=""
              title="Hide"
            />
          </button>
          {children}
        </div>
      )}
    </>
  );
};

export default ToolboxModal;
