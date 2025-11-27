import styles from "./LoadingSplash.module.scss";

const LoadingSplash = ({ fadeIn }) => {
  return (
    <div
      className={
        styles.LoadingSplash +
        " " +
        (fadeIn ? styles.LoadingSplash__FadeIn : styles.LoadingSplash__FadeOut)
      }
    >
      <div className={styles.lds_dual_ring} hidden={!fadeIn}></div>
    </div>
  );
};

export default LoadingSplash;
