import { createContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const user = {};
  return <UserContext.Provider>{children}</UserContext.Provider>;
};

export default UserProvider;
