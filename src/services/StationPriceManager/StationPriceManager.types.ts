export interface StationInterface {
  Fetched: number;
  SiteId: number;
}

export type StationDetails = {
  // SiteID (id)
  SiteID: string;
  // Name (n)
  Name: string;
  // Lat (lt)
  Lat: string;
  // Lng (lg)
  Lng: string;
  // GooglePlaceID (gi)
  GooglePlaceID: string;
  // Address (a)
  Address: string;
  // BrandID (b)
  BrandID: string;
  // Postcode (p)
  Postcode: string;
  // LastUpdated (u)
  LastUpdated: string;
  // FuelTypes (t)
  FuelTypes: string;
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
  st: number[];
  // Fetched (ft)
  ft: number;
};
