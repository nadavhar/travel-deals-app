'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DeleteButton({ dealId }: { dealId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh(); // re-fetch server component data
      } else {
        alert('מחיקה נכשלה, נסה שוב');
      }
    } catch {
      alert('שגיאת רשת, נסה שוב');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-1 gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
        >
          ביטול
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'מוחק...' : 'מחק'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-50 hover:border-red-300 active:scale-95"
    >
      <Trash2 className="h-3.5 w-3.5" />
      מחק
    </button>
  );
}
