import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WeddingIvoryInvitation } from "./sections/WeddingIvoryInvitation";
import "./styles/wedding-ivory-invitation.css";
import { showReturnToSite } from "./site/return-to-site.js";

createRoot(document.getElementById("root")!).render(<StrictMode><WeddingIvoryInvitation /></StrictMode>);
showReturnToSite();
