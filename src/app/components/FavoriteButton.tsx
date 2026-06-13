import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';

interface Props {
  type: 'video' | 'term' | 'medterm' | 'blog' | string;
  itemId: string;
  title: string;
  label?: boolean; // metin de göster
  className?: string;
}

export default function FavoriteButton({ type, itemId, title, label = true, className = '' }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggle, load, loaded } = useFavoritesStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loaded) load();
  }, [isAuthenticated, loaded, load]);

  const fav = isFavorite(type, itemId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapın');
      navigate('/giris');
      return;
    }
    setBusy(true);
    try {
      const added = await toggle(type, itemId, title);
      toast.success(added ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    } catch {
      toast.error('İşlem başarısız oldu');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={
        className ||
        `inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${
          fav
            ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
        }`
      }
    >
      <Bookmark className={`w-4 h-4 ${fav ? 'fill-amber-500 text-amber-500' : ''}`} />
      {label && <span>{fav ? 'Favorilerde' : 'Favorilere Ekle'}</span>}
    </button>
  );
}
