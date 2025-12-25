import styles from "./LoaderWheel.module.scss";

const LoaderWheel = ({ hidden }) => {
  if (hidden) return <></>;
  return <div className={styles.lds_dual_ring} hidden={hidden}></div>;
};

export default LoaderWheel;
