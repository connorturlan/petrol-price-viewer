import styles from "./ToolBar.module.scss";

const ToolBar = ({ children }) => {
  return (
    <div className={styles.ToolBar_Container}>
      <div className={styles.ToolBar}>{children}</div>
    </div>
  );
};

export default ToolBar;
