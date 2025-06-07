import { useState } from "react";
import styles from "./Toolbox.module.scss";
import { usePub } from "../../utils/pubsub";

const Toolbox = ({ children }) => {
  //   return <div></div>;
  const [shown, setVisibility] = useState(true);
  const [showContainer, setContainerVisibility] = useState(true);

  const handleHide = () => {
    setVisibility(false);
    const hideModals = usePub();
    hideModals("ToolboxModalHide");
  };

  return (
    <>
      <div
        className={`${styles.Toolbox} ${styles.Toolbox_Container} ${
          shown
            ? styles.Toolbox_Container__Show
            : styles.Toolbox_Container__Hide
        }`}
        onAnimationEnd={() => {
          setContainerVisibility(shown);
        }}
        hidden={!showContainer}
      >
        <button className={styles.Toolbox_Hide} onClick={handleHide}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M440-280v-400L240-480l200 200Zm80 160h80v-720h-80v720Z" />
          </svg>
        </button>
        <br />
        {children}
      </div>
      {!shown && (
        <button
          className={styles.Toolbox_Show}
          onClick={() => {
            setVisibility(true);
            setContainerVisibility(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M360-120v-720h80v720h-80Zm160-160v-400l200 200-200 200Z" />
          </svg>
        </button>
      )}
      {/* {showContainer ? (
        <div
          className={`${styles.Toolbox} ${
            shown
              ? styles.Toolbox_Container__Show
              : styles.Toolbox_Container__Hide
          }`}
          onAnimationEnd={() => {
            setContainerVisibility(false);
          }}
          hidden={!showContainer}
        >
          <button
            className={styles.Toolbox_Hide}
            onClick={() => setVisibility(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M440-280v-400L240-480l200 200Zm80 160h80v-720h-80v720Z" />
            </svg>
          </button>
          <br />
          {children}
        </div>
      ) : (
        <>
          <button
            className={styles.Toolbox_Show}
            onClick={() => {
              setVisibility(true);
              setContainerVisibility(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M360-120v-720h80v720h-80Zm160-160v-400l200 200-200 200Z" />
            </svg>
          </button>
          <div></div>
        </>
      )} */}
    </>
  );
};

export default Toolbox;
