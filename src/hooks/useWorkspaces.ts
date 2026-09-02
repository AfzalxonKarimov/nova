import { useEffect, useState, useCallback } from 'react';
import type { Workspace } from '@/types/workspace';
import {
  loadWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addSavedTab,
  removeSavedTab,
  reorderSavedTabs,
  onWorkspacesChange,
  getDefaultWorkspace,
} from '@/services/workspaces';

/**
 * Hook: workspaces list + CRUD operations.
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);

  useEffect(() => {
    let mounted = true;

    loadWorkspaces().then(async w => {
      if (!mounted) return;
      setWorkspaces(w);
      setLoading(false);

      const meta = await import('@/services/storage').then(s => s.storage.get<{ defaultWorkspace: string | null } & Record<string, unknown>>('nova_meta'));
      const stored = await import('@/services/storage').then(s => s.storage.get('nova_meta'));
    });

    // Load current workspace
    getDefaultWorkspace().then(ws => {
      if (mounted && ws) setCurrentWorkspaceState(ws);
    });

    const unsubscribe = onWorkspacesChange(newWorkspaces => {
      if (mounted) {
        setWorkspaces([...newWorkspaces]);
        // Update current workspace if it changed
        setCurrentWorkspaceState(prev => {
          const updated = newWorkspaces.find(w => w.id === prev?.id) ?? newWorkspaces[0] ?? null;
          return updated;
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const create = useCallback(async (input: { name: string; description?: string; icon?: any; accent?: string }) => {
    return createWorkspace(input);
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Workspace>) => {
    return updateWorkspace(id, patch);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteWorkspace(id);
  }, []);

  const addTab = useCallback(async (workspaceId: string, tab: { url: string; title: string; favicon?: string }) => {
    return addSavedTab(workspaceId, tab);
  }, []);

  const removeTab = useCallback(async (workspaceId: string, tabId: string) => {
    return removeSavedTab(workspaceId, tabId);
  }, []);

  const reorderTabs = useCallback(async (workspaceId: string, orderedIds: string[]) => {
    return reorderSavedTabs(workspaceId, orderedIds);
  }, []);

  return {
    workspaces,
    loading,
    currentWorkspace,
    setCurrentWorkspace: setCurrentWorkspaceState,
    create,
    update,
    remove,
    addTab,
    removeTab,
    reorderTabs,
  };
}

/**
 * Hook: a single workspace by ID.
 */
export function useWorkspace(id: string | null) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    loadWorkspaces().then(w => {
      if (!mounted) return;
      setWorkspace(w.find(ws => ws.id === id) ?? null);
      setLoading(false);
    });

    const unsubscribe = onWorkspacesChange(newW => {
      if (mounted) {
        setWorkspace(newW.find(ws => ws.id === id) ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [id]);

  return { workspace, loading };
}
