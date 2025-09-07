import { useContext, useState } from "react";
import styles from "./LocationLookup.module.scss";
import { UserContext } from "../../contexts/UserContext";
import { getCoordinatesWithAddressQuery } from "../../utils/navigation";
import { ObjectIsEmpty } from "../../utils/utils";
import AddressPicker from "../AddressPicker/AddressPicker";

const LocationLookup = ({ onSelectCallback }) => {
  const { loginState, POI } = useContext(UserContext);

  const [isFocused, setFocus] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [showAddressList, toggleAddressList] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [addressListCallback, setAddressListCallback] = useState(() => {});
  const [lookupInProgess, setLookupProgress] = useState(false);

  const handleLocationChange = (location) => {
    console.log("location change to", location);
    onSelectCallback(location);
  };

  const lookup = async (address, isOrigin) => {
    if (lookupInProgess) return;
    if (!address) return;

    setLookupProgress(true);
    const addressData = await getCoordinatesWithAddressQuery(address);
    setLookupProgress(false);
    // setTimeout(() => {
    // }, 2_000);

    if (ObjectIsEmpty(addressData) || addressData.length <= 0) {
      window.alert(`no address found for ${address}`);
      return;
    }
    console.log(addressData);
    if (addressData.length > 1) {
      // window.alert(`multiple addresses found for ${address}`);
      toggleAddressList(true);
      setAddressList(addressData);
      setAddressListCallback(() => {
        return (selectedAddress) => {
          toggleAddressList(false);
          console.log(address, selectedAddress);
          setWaypoint(selectedAddress);
        };
      });
      return true;
    }
    toggleAddressList(false);

    console.log(address, addressData);

    setWaypoint(addressData.at(0));
    return true;
  };

  const setWaypoint = (addressData) => {
    handleLocationChange({
      Name: "start",
      Lat: parseFloat(addressData.lon),
      Lng: parseFloat(addressData.lat),
    });
  };

  const savedLocations =
    loginState &&
    Object.keys(POI).map((poi) => {
      return (
        <button
          key={poi}
          onClick={() => {
            handleLocationChange(POI[poi]);
          }}
        >
          {poi}
        </button>
      );
    });

  return (
    <div className={styles.LocationLookup_Container}>
      <div className={styles.LocationLookup_Searchbar}>
        <input
          className={styles.LocationLookup_Search}
          type="text"
          placeholder="Search"
          value={searchText}
          disabled={lookupInProgess}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") lookup(searchText, true);
          }}
          onFocus={() => {
            setFocus(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setFocus(false);
            }, 100);
          }}
        />
        <div
          className={styles.LocationLookup_SavedLocations}
          style={{ display: isFocused || showAddressList ? "flex" : "none" }}
        >
          <div>
            <button>Use Current Location</button>
            <button>Pick on Map</button>
          </div>
          <p>Suggestions</p>
          {showAddressList && (
            <AddressPicker
              addresses={addressList}
              onSelect={addressListCallback}
            />
          )}
          <p>Saved</p>
          {savedLocations}
        </div>
      </div>
    </div>
  );
};

export default LocationLookup;
