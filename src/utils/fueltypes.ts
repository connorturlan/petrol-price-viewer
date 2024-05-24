import fueltypes from "../assets/fueltypes.json";

export const getFuelTypeName = (fuelId: number): string => {
  const data = fueltypes.Fuels.find((e) => {
    if (e.FuelId == fuelId) return e.Name;
  });
  return data ? data.Name : "No data found";
};
