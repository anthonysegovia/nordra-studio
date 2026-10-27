import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WeddingIvoryInvitation } from "./sections/WeddingIvoryInvitation";
import "./styles/wedding-ivory-invitation.css";

createRoot(document.getElementById("root")!).render(<StrictMode><WeddingIvoryInvitation /></StrictMode>);
