import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import UserProvider from "./contexts/UserContext.jsx";
import AppProvider from "./contexts/AppContext.jsx";
import RouteProvider from "./contexts/RouteContext.jsx";

let clientId =
  import.meta.env.VITE_LOCAL == "TRUE" ||
  import.meta.env.VITE_LOCAL_LOGIN == "TRUE"
    ? "216192949490-a4rttih259hlh4c27c4o4u9902ctequ0.apps.googleusercontent.com" // use test creds.
    : "216192949490-7fp8gs05dpg3r4nfv8mqgof7d77qd3fq.apps.googleusercontent.com"; // use prod creds.

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppProvider>
    <UserProvider>
      <RouteProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </GoogleOAuthProvider>
      </RouteProvider>
    </UserProvider>
  </AppProvider>
);
