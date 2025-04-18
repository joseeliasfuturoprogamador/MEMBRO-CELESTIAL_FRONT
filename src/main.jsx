import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Define dinamicamente o basename
const basename = import.meta.env.MODE === "production" ? "/MEMBRO-CELESTIAL_FRONT" : "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
