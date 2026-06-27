
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initConsentDefaults } from "./app/lib/analytics";

  // Consent Mode v2 varsayılanlarını GA yüklenmeden önce ayarla
  initConsentDefaults();

  createRoot(document.getElementById("root")!).render(<App />);
  