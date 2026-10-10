
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { router } from "./app/routes";
  import "./styles/index.css";
  import { initConsentDefaults } from "./app/lib/analytics";

  // Consent Mode v2 varsayılanlarını GA yüklenmeden önce ayarla
  initConsentDefaults();

  // Açılan sayfanın (lazy) paketi yüklenmeden render etme: aksi halde React prerender edilmiş HTML'i
  // boş/yedek içerikle değiştirir (görünür boşluk + CLS). Router hazır olunca tek seferde render edilir.
  const start = () => createRoot(document.getElementById("root")!).render(<App />);
  if (router.state.initialized) start();
  else {
    const unsubscribe = router.subscribe((state) => {
      if (state.initialized) { unsubscribe(); start(); }
    });
  }
  