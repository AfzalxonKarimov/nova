import { useEffect, useState, useCallback } from 'react';
import type { QuickLink } from '@/types/quicklink';
import {
  defaultQuickLinks,
  createQuickLink,
  deleteQuickLink,
  reorderQuickLinks,
  onQuickLinksChange,
} from '@/services/quicklinks';

export function useQuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    defaultQuickLinks().then(l => {
      if (mounted) {
        setLinks(l);
        setLoading(false);
      }
    });

    const unsubscribe = onQuickLinksChange(newLinks => {
      if (mounted) {
        setLinks([...newLinks]);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const create = useCallback(async (input: { name: string; url: string; icon?: string }) => {
    return createQuickLink(input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteQuickLink(id);
  }, []);

  const reorder = useCallback(async (orderedIds: string[]) => {
    return reorderQuickLinks(orderedIds);
  }, []);

  return { links, loading, create, remove, reorder };
}
