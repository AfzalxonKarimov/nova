/**
 * Bookmarks service — wraps chrome.bookmarks API.
 */

/** Bookmark tree node (simplified) */
export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  parentId?: string;
}

/** Get the bookmark tree (flattened) */
export async function getAllBookmarks(): Promise<BookmarkNode[]> {
  try {
    const tree = await chrome.bookmarks.getTree();
    return flattenBookmarkTree(tree);
  } catch (err) {
    console.warn('NOVA: Failed to read bookmarks', err);
    return [];
  }
}

/** Flatten the bookmark tree into a flat list */
export function flattenBookmarkTree(nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkNode[] {
  const result: BookmarkNode[] = [];

  function walk(node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) {
    result.push({
      id: node.id,
      title: node.title,
      url: node.url,
      parentId,
    });
    if (node.children) {
      node.children.forEach(child => walk(child, node.id));
    }
  }

  nodes.forEach(node => walk(node));
  return result;
}

/** Get bookmark folders only (for workspace creation) */
export async function getBookmarkFolders(): Promise<BookmarkNode[]> {
  try {
    const tree = await chrome.bookmarks.getTree();
    const folders: BookmarkNode[] = [];

    function walk(node: chrome.bookmarks.BookmarkTreeNode) {
      if (!node.url) {
        folders.push({
          id: node.id,
          title: node.title,
          children: [],
        });
      }
      if (node.children) {
        node.children.forEach(child => walk(child));
      }
    }

    tree.forEach(node => walk(node));
    return folders;
  } catch {
    return [];
  }
}

/** Search bookmarks by query */
export async function searchBookmarks(query: string): Promise<BookmarkNode[]> {
  if (!query.trim()) return [];
  try {
    const results = await chrome.bookmarks.search(query);
    return results.map(r => ({
      id: r.id,
      title: r.title,
      url: r.url,
      parentId: r.parentId,
    }));
  } catch (err) {
    console.warn('NOVA: Failed to search bookmarks', err);
    return [];
  }
}

/** Open a bookmark in a new tab */
export async function openBookmark(url: string): Promise<void> {
  if (url) {
    await chrome.tabs.create({ url });
  }
}

/** Get the favicon for a bookmark URL */
export function getBookmarkFavicon(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=16`;
  } catch {
    return undefined;
  }
}
