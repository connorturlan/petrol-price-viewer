import { createContext } from "react";

const featureContext = createContext({});

function FeatureContext({ children }) {
  return <featureContext.Provider>{children}</featureContext.Provider>;
}

export default FeatureContext;
