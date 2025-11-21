import { useContext, useEffect, useId, useState } from "react";
import styles from "./LocationLookup.module.scss";
import { UserContext } from "../../contexts/UserContext";
import { getCoordinatesWithAddressQuery } from "../../utils/navigation";
import { ObjectIsEmpty } from "../../utils/utils";
import AddressPicker from "../AddressPicker/AddressPicker";
import { usePub, UseSub } from "../../utils/pubsub";
import { MODES } from "../../containers/TestPetrolMap/PetrolMap";

const LocationLookup = ({
  onSelectCallback,
  onFocusCallback,
  placeholder,
  initialValue,
}) => {
  const { loginState, POI } = useContext(UserContext);

  const [isFocused, setFocus] = useState(false);
  const [isHidden, setHidden] = useState(true);
  const [searchText, setSearchText] = useState(initialValue || "");

  useEffect(() => {
    setSearchText(initialValue);
  }, [initialValue]);

  const [showAddressList, toggleAddressList] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [addressListCallback, setAddressListCallback] = useState(() => {});
  const [lookupInProgess, setLookupProgress] = useState(false);

  const publisher = usePub();
  const id = useId();

  const handleLocationChange = (name, location) => {
    console.log("location change to", location);
    setAddressList([]);
    toggleAddressList(false);
    setSearchText(name);
    setFocus(false);
    onSelectCallback(name, location);
  };

  const lookup = async (address, isOrigin) => {
    if (lookupInProgess) return;
    if (!address) return;

    setLookupProgress(true);
    const addressData = await getCoordinatesWithAddressQuery(address);
    setLookupProgress(false);

    if (ObjectIsEmpty(addressData) || addressData.length <= 0) {
      window.alert(`no address found for ${address}`);
      return;
    }
    console.log(addressData);
    if (addressData.length > 1) {
      // window.alert(`multiple addresses found for ${address}`);
      toggleAddressList(true);
      setFocus(true);
      setAddressList(addressData);
      setAddressListCallback(() => {
        return (selectedAddress) => {
          toggleAddressList(false);
          setWaypoint(address, selectedAddress);
        };
      });
      return true;
    }
    toggleAddressList(false);

    console.log(address, addressData);

    setWaypoint(address, addressData.at(0));
    return true;
  };

  const setWaypoint = (query, addressData) => {
    console.log(query, addressData);
    handleLocationChange(query, {
      Name: query,
      Lat: parseFloat(addressData.lon),
      Lng: parseFloat(addressData.lat),
    });
  };

  // handle location based access
  const locationEnabled = "geolocation" in navigator;
  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      handleLocationChange("Current Location", {
        Name: "Current Location",
        Lat: parseFloat(position.coords.longitude),
        Lng: parseFloat(position.coords.latitude),
      });
    });
  };

  const handlePickLocation = () => {
    publisher("SetClickMode", {
      mode: MODES.PICK_LOCATION,
      options: { id },
    });
  };

  UseSub("MapClicked", (event) => {
    if (event.options.id != id) return;
    console.log(event);
    handleLocationChange("Custom Location", {
      Name: "Custom Location",
      Lat: parseFloat(event.coord.at(0)),
      Lng: parseFloat(event.coord.at(1)),
    });
  });

  const savedLocations = loginState
    ? Object.keys(POI).map((poi) => {
        return {
          display_name: poi,
          ...poi,
        };
      })
    : [];

  useEffect(() => {
    if (onFocusCallback) onFocusCallback(isFocused);
  }, [isFocused]);

  const savedLocationCallback = (index) => {
    return (selectedAddress) => {
      toggleAddressList(false);
      console.log(address, selectedAddress);
      setWaypoint(address, selectedAddress);
      setFocus(false);
    };
  };

  UseSub("GlobalMouseDown", (event) => {
    setFocus(false);
  });

  return (
    // <div className={styles.LocationLookup_Container}>
    <div
      className={`${styles.LocationLookup_Searchbar}`}
      onClick={(event) => {
        setFocus(true);
        setHidden(false);
        event.stopPropagation();
      }}
    >
      <input
        className={styles.LocationLookup_Search}
        type="text"
        placeholder={placeholder || "Search"}
        value={searchText}
        disabled={lookupInProgess}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") lookup(searchText, true);
        }}
      />
      <div
        className={`${styles.LocationLookup_Focusbar} ${
          !isHidden && isFocused
            ? styles.LocationLookup_Focusbar_Show
            : styles.LocationLookup_Focusbar_Hide
        } ${isHidden && styles.LocationLookup_Focusbar_Hidden}`}
        onAnimationEnd={() => {
          if (!isFocused) setHidden(true);
        }}
      >
        <div className={`${styles.LocationLookup_Iconbar}`}>
          <button
            className={`${styles.LocationLookup_Icon}`}
            enabled={locationEnabled}
            onClick={handleCurrentLocation}
          >
            <img src="my_location_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" />
            <p>use my location</p>
          </button>
          <button
            className={`${styles.LocationLookup_Icon}`}
            onClick={handlePickLocation}
          >
            <img src="globe_location_pin_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" />
            <p>select on map</p>
          </button>
        </div>
        {addressList.length > 0 && (
          <>
            <p>Suggestions</p>
            <AddressPicker
              addresses={addressList}
              onSelect={addressListCallback}
            />
          </>
        )}
        {savedLocations.length > 0 && (
          <>
            <p>Preview</p>
            <AddressPicker
              addresses={addressList}
              onSelect={addressListCallback}
            />
          </>
        )}
      </div>
    </div>
    // </div>
  );
};

export default LocationLookup;
