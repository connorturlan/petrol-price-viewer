import styles from "./PriceListItem.module.scss";
import brands from "../../../assets/brands-indev.json";

function PriceListItem({ name, price, image, showDetails }) {
  return (
    <div className={styles.PriceListItem} onClick={showDetails}>
      <img src={image || "red-pin.svg"} />
      <p>{name}</p>
      <p>{price}</p>
    </div>
  );
}

export default PriceListItem;
