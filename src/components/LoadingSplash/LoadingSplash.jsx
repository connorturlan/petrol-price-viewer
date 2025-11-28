import LoaderWheel from "../LoaderWheel/LoaderWheel";
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
      <LoaderWheel hidden={!fadeIn} />
    </div>
  );
};

export default LoadingSplash;
