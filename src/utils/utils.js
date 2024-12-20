export const ObjectIsEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
