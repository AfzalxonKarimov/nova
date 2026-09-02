import { useEffect, useState, useCallback } from 'react';
import type { SavedPage } from '@/types/saved';
import {
  loadSavedPages,
  saveCurrentPage,
  deleteSavedPage,
  updateSavedPage,
  searchSavedPages,
  onSavedChange,
} from '@/services/saved';

export function useSavedPages() {
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadSavedPages().then(p => {
      if (mounted) {
        setSavedPages(p);
        setLoading(false);
      }
    });

    const unsubscribe = onSavedChange(newPages => {
      if (mounted) {
        setSavedPages([...newPages]);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const save = useCallback(async (input: Parameters<typeof saveCurrentPage>[0]) => {
    return saveCurrentPage(input);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteSavedPage(id);
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Pick<SavedPage, 'note' | 'tags' | 'title' | 'workspaceId'>>) => {
    return updateSavedPage(id, patch);
  }, []);

  const search = useCallback(async (query: string) => {
    return searchSavedPages(query);
  }, []);

  return { savedPages, loading, save, remove, update, search };
}
