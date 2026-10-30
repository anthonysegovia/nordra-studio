import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
// These sheets also contain shared admin controls. Keep their original order
// before the extracted base, even when the component JavaScript loads lazily.
import "./sections/admin-weddings.css";
import "./sections/admin-posada.css";
import "./styles/management.css";

const Payment = lazy(() => import("./sections/Payment").then(module => ({ default: module.Payment })));
const AdminPayments = lazy(() => import("./sections/AdminPayments").then(module => ({ default: module.AdminPayments })));
const AdminPosada = lazy(() => import("./sections/AdminPosada").then(module => ({ default: module.AdminPosada })));

const params = new URLSearchParams(window.location.search);
const panel = params.get("panel");
const token = params.get("pago");

// Preserve App's precedence, including a present but empty panel parameter.
const view = panel === "posada" ? <AdminPosada />
  : panel !== null ? <AdminPayments demoMode={panel === "demo"} />
  : token !== null ? <Payment token={token} />
  : null;

if (view) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode><Suspense fallback={null}>{view}</Suspense></StrictMode>,
  );
} else {
  window.location.replace("/");
}
