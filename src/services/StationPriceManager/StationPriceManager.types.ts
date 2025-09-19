export interface StationInterface {
  Fetched: number;
  SiteId: number;
}

export type FuelPrice = {
  // SiteID - this isn't included by the api
  SiteID: number;
  // FuelID (id)
  FuelID: number;
  // CollectionMethod (c)
  CollectionMethod: string;
  // TransactionDateUTC (t)
  TransactionDateUTC: string;
  // Price (p)
  Price: number;
};

export type StationDetails = {
  // SiteID (id)
  SiteID: number;
  // Name (n)
  Name: string;
  // Lat (lt)
  Lat: number;
  // Lng (lg)
  Lng: number;
  // GooglePlaceID (gi)
  GooglePlaceID: string;
  // Address (a)
  Address: string;
  // BrandID (b)
  BrandID: number;
  // Postcode (p)
  Postcode: string;
  // LastUpdated (u)
  LastUpdated: string;
  // FuelTypes (t)
  FuelTypes: Map<number, FuelPrice>;
};

export type StationList = {
  // Sites (s)
  s: StationDetails[];
};

export type MapSector = {
  // SectorID (id)
  id: number;
  // TopLeft (tl)
  tl: number[];
  // BottomRight (br)
  br: number[];
  // StationsIDs (si)
  si: number[];
  // StationData (st)
  st: StationList;
  // Fetched (ft)
  ft: number;
};
