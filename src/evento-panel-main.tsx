import { setLanguage } from './language';
import React from "react";
import ReactDOM from "react-dom/client";
import { WeddingWorkspace } from "./sections/WeddingWorkspace";
import { eventPanel } from "./lib/occasionPanels";
import "./styles/wedding-workspace.css";
import "./styles/occasion-panels.css";
import "./styles/event-panel.css";

const url=new URL(location.href);
if(url.searchParams.get('lang')==='en'){
  setLanguage('en');
  url.searchParams.delete('lang');
  history.replaceState(null,'',url);
}
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><WeddingWorkspace experience={eventPanel} /></React.StrictMode>);
