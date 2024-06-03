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
      {fadeIn && <div className={styles.lds_dual_ring}></div>}
      <p>loading...</p>
    </div>
  );
};

export default LoadingSplash;
