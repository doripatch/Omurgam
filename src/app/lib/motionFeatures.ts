// Animasyon özellikleri (motion domAnimation) ayrı pakette: LazyMotion bunu ilk çizimden sonra yükler.
// Anasayfa ve hızlı menü `m` bileşenlerini kullanır; ana JS paketi küçülür (mobil FCP/LCP).
export { domAnimation as default } from 'motion/react';
