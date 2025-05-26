export const ENDPOINT =
  import.meta.env.VITE_LOCAL == "TRUE" ||
  import.meta.env.VITE_LOCAL_API == "TRUE"
    ? "http://localhost:3000"
    : "https://ad8rhw1x2h.execute-api.ap-southeast-2.amazonaws.com/Prod";

// export const PROJECTION = "EPSG:4326";
export const PROJECTION = "EPSG:3857";

export const DEFAULT_FUEL_TYPE = 1;
export const MAX_STATION_REQUEST = 200;

export const SHOW_WELCOME = !(
  import.meta.env.VITE_LOCAL_SHOW_WELCOME == "FALSE"
);
