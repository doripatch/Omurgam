// /videolar/:slug — okunabilir URL'den canonical UUID'ye çözer ve VideoDetail'i AYNEN kullanır.
// Veri/sayaç/favori/yorum/like canonical UUID üzerinden işler; player aynı YouTube URL'si;
// cookie-consent aynen; ilgili video linkleri yeni /videolar/<slug> adreslerine gider.
// Bilinmeyen slug: güvenli "Video bulunamadı" (YANLIŞ videoya fallback YOK).
import { useParams, Link } from 'react-router';
import Seo from '../components/Seo';
import VideoDetail from './VideoDetail';
import { canonicalIdBySlug, videoHref, ORIGIN } from '../lib/videoMigration';

export default function MigratedVideoDetail() {
  const { slug } = useParams();
  const canonicalId = canonicalIdBySlug(slug);

  if (!canonicalId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Seo title="Video bulunamadı" description="Aradığınız video bulunamadı. Omurgam video arşivine göz atın." />
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Video bulunamadı</h1>
        <Link to="/videolar" className="text-amber-600 hover:underline">
          Video arşivine dön
        </Link>
      </div>
    );
  }

  return (
    <VideoDetail
      idOverride={canonicalId}
      canonicalUrl={`${ORIGIN}/videolar/${slug}/`}
      relatedUrl={(v) => videoHref(v.id)}
    />
  );
}
