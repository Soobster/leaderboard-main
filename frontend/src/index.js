import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // so basically, tier lists don't with strict mode enabled.
  // right now it's disabled so the tier lists can work. As far as I can tell,
  // strict mode is just for errors, so when doing other stuff, keep it on, but
  // when we deploy this, I think we keep it disabled

  // <React.StrictMode>
  // 	<App />
  // </React.StrictMode>

  <App />
);
