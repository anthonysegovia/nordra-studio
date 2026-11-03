import React from "react";
import ReactDOM from "react-dom/client";
import { WeddingWorkspace } from "./sections/WeddingWorkspace";
import { birthdayPanel } from "./lib/occasionPanels";
import "./styles/wedding-workspace.css";
import "./styles/occasion-panels.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><WeddingWorkspace experience={birthdayPanel} /></React.StrictMode>);
