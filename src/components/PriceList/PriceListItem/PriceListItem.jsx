import styles from "./PriceListItem.module.scss";
import brands from "../../../assets/brands-indev.json";

function PriceListItem({ name, price, image, showDetails }) {
  return (
    <div className={styles.PriceListItem} onClick={showDetails}>
      <img src={image || "red-pin.svg"} width={20} height={27} />
      <p>{name}</p>
      <p>{price}</p>
    </div>
  );
}

export default PriceListItem;
