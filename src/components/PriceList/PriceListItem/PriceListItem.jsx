import styles from "./PriceListItem.module.scss";

function PriceListItem({ name, price, showDetails }) {
  return (
    <div className={styles.PriceListItem} onClick={showDetails}>
      <p>{name}</p>
      <p>{price}</p>
    </div>
  );
}

export default PriceListItem;
