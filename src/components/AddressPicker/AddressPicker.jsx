import styles from "./AddressPicker.module.scss";

const AddressPicker = ({ addresses, onSelect }) => {
  const handleSelect = (event) => {
    onSelect(addresses.at(event.target.value));
  };
  return (
    <div className={styles.AddressPicker}>
      {addresses.map((address, index) => {
        return (
          <button
            className={styles.AddressPicker_Button}
            key={address.place_id || index}
            onClick={handleSelect}
            value={index}
          >
            {address.display_name}
          </button>
        );
      })}
    </div>
  );
};

export default AddressPicker;
