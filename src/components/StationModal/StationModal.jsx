import styles from "./StationModal.module.scss";

function StationModal({ siteDetails, setVisible }) {
  if (!siteDetails) {
    return <></>;
  }

  return (
    <div
      className={styles.StationModal_Blackout}
      onClick={() => {
        setVisible(false);
      }}
    >
      <div
        className={styles.StationModal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          onClick={() => {
            setVisible(false);
          }}
        >
          X
        </button>
        <div className={styles.StationModal_Container}>
          <p>Name:</p>
          <p>{siteDetails.Name}</p>
          <p>Price per litre:</p>
          <p>{((siteDetails.Price || 0) / 10).toFixed(1)}</p>
          <p></p>
          <a
            href={`https://maps.google.com/?q=place_id:${siteDetails.GPI}`}
            target="_blank"
            className={styles.StationModal_Maps}
          >
            <img
              src="explore_24dp_FILL0_wght400_GRAD0_opsz24.svg"
              alt="Navigate"
              srcSet=""
              title="Navigate"
            />
            <p>Open Maps</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default StationModal;
