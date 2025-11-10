// src/utils/loaders/MenuItemsLoader.ts
import { file } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { capitalize } from '@/utils/string';
import { parseContentPath, isMetaFile } from '@/utils/paths';
import { SimpleIdRegistry } from '@/utils/idRegistry';
import { parseFrontmatterFromString } from '@/utils/filesystem/frontmatter';
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const MENU_ITEMS_JSON_PATH = 'src/content/menu-items/menu-items.json';
const MENUS_COLLECTION = 'menus' as const;

const idRegistry = new SimpleIdRegistry();

/**
 * Get full ancestor chain for a parent reference
 * Returns array of IDs from immediate parent to root
 */
function getAncestorChain(parentRef: any, store: any): string[] {
  const ancestors: string[] = [];
  let current = parentRef;
  const visited = new Set<string>();
  
  while (current) {
    const parentId = typeof current === 'string' 
      ? current 
      : current.id || String(current);
    
    if (visited.has(parentId)) {
      console.warn(`Circular parent reference detected: ${parentId}`);
      break;
    }
    visited.add(parentId);
    ancestors.push(parentId);
    
    const parentEntry = store.get(parentId);
    if (!parentEntry?.data?.parent) break;
    
    current = parentEntry.data.parent;
  }
  
  return ancestors;
}

/**
 * Build semantic ID from full ancestor path
 * Walks up parent chain to ensure uniqueness across multi-level hierarchies
 */
function buildSemanticId(
  baseId: string, 
  context: {
    parent?: any;
    menu?: any;
    includeMenu?: boolean;
  },
  store: any
): string {
  const parts = [baseId];
  
  if (context.parent) {
    const ancestors = getAncestorChain(context.parent, store);
    parts.push(...ancestors.reverse());
  }
  
  if (context.includeMenu && context.menu) {
    const menuId = typeof context.menu === 'string'
      ? context.menu
      : Array.isArray(context.menu) 
        ? (context.menu[0]?.id || String(context.menu[0]))
        : (context.menu.id || String(context.menu));
    parts.push(menuId);
  }
  
  return parts.join('-');
}

/**
 * Get unique ID using shared registry
 */
function getUniqueId(semanticId: string): string {
  return idRegistry.getUniqueId(semanticId);
}

/**
 * Normalize menu reference to standard format
 */
function normalizeMenuReference(menu: any): any {
  if (!menu) return [];
  
  const normalizeOne = (m: any) => 
    typeof m === 'string' 
      ? { collection: MENUS_COLLECTION, id: m }
      : m;
  
  return Array.isArray(menu) 
    ? menu.map(normalizeOne)
    : [normalizeOne(menu)];
}

/**
 * Ensure value is an array
 */
function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Get item property with override pattern
 */
function getItemProperty<T>(
  itemData: any,
  metaData: any,
  itemKey: string,
  metaKey: string,
  defaultValue: T
): T {
  if (itemData?.[itemKey] !== undefined) {
    return itemData[itemKey];
  }
  if (metaData?.[metaKey] !== undefined) {
    return metaData[metaKey];
  }
  return defaultValue;
}

/**
 * Determine if item should have a page
 */
function shouldItemHavePage(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'hasPage', 'itemsHasPage', true);
}

/**
 * Determine if item should use root path
 */
function shouldItemUseRootPath(itemData: any, metaData: any): boolean {
  return getItemProperty(itemData, metaData, 'rootPath', 'itemsRootPath', false);
}

/**
 * Get collection metadata from modules
 */
function getCollectionMetaFromModules(
  collectionName: string,
  modules: Record<string, any>
): any {
  const metaPath = Object.keys(modules).find(
    path => path.includes(`/${collectionName}/_meta.mdx`)
  );
  
  if (metaPath) {
    const data = modules[metaPath].frontmatter ?? {};
    return {
      title: data.title ?? capitalize(collectionName),
      description: data.description,
      hasPage: data.hasPage ?? false,
      itemsHasPage: data.itemsHasPage ?? true,
      itemsRootPath: data.itemsRootPath ?? false,
      ...data
    };
  }
  
  return {
    title: capitalize(collectionName),
    hasPage: false,
    itemsHasPage: true,
    itemsRootPath: false,
  };
}

/**
 * Create the menu items loader
 */
export function MenuItemsLoader(): Loader {
  return {
    name: 'menu-items-loader',
    
    async load(context: LoaderContext) {
      const { store, logger } = context;

      // Clear ID tracking for fresh load
      idRegistry.clear();

      // Step 1: Load base menu items from JSON
      store.clear();
      await file(MENU_ITEMS_JSON_PATH).load(context);

      // Step 2: Pre-register IDs from manually loaded items
      for (const [id, entry] of store.entries()) {
        idRegistry.getUniqueId(id);
      }

      // Step 3: Walk content directory and parse frontmatter
      const frontmatterModules: Record<string, any> = {};
      
      function walkDir(dir: string) {
        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile() && /\.(mdx?|md)$/.test(entry.name)) {
            try {
              const raw = readFileSync(fullPath, 'utf-8');
              const frontmatter = parseFrontmatterFromString(raw);
              
              const relativePath = relative(process.cwd(), fullPath)
                .replace(/\\/g, '/')
                .replace('src/', '../../');
              
              frontmatterModules[relativePath] = { frontmatter };
            } catch (error) {
              logger.warn(`Failed to read ${fullPath}: ${error}`);
            }
          }
        }
      }
      
      const contentDir = join(process.cwd(), 'src/content');
      walkDir(contentDir);

      // Step 4: Process individual item addToMenu fields
      await processItemMenus(frontmatterModules, store);

      // Step 5: Process collection-level addToMenu and itemsAddToMenu
      await processCollectionMenus(frontmatterModules, store);

      logger.info(`Menu items loader: ${store.keys().length} items loaded`);
    },
  };
}

/**
 * Process individual item addToMenu configurations
 */
async function processItemMenus(
  modules: Record<string, any>,
  store: any
): Promise<void> {
  for (const [path, mod] of Object.entries(modules)) {
    if (isMetaFile(path)) continue;

    const data = mod.frontmatter ?? {};
    
    if (!data.addToMenu) continue;

    const { slug, collection } = parseContentPath(path);
    const configs = ensureArray(data.addToMenu);

    for (const menuConfig of configs) {
      const menus = normalizeMenuReference(menuConfig.menu);
      
      const baseId = menuConfig.id || slug;
      const semanticId = buildSemanticId(
        baseId,
        {
          parent: menuConfig.parent,
          menu: menuConfig.menu,
          includeMenu: false,
        },
        store
      );
      const itemId = getUniqueId(semanticId);

      const meta = getCollectionMetaFromModules(collection, modules);
      
      const useRootPath = shouldItemUseRootPath(data, meta);
      const itemUrl = useRootPath ? `/${slug}` : `/${collection}/${slug}`;

      store.set({
        id: itemId,
        data: {
          title: menuConfig.title ?? data.title ?? capitalize(slug),
          description: menuConfig.description ?? data.description,
          url: itemUrl,
          menu: menus,
          parent: menuConfig.parent ?? null,
          openInNewTab: menuConfig.openInNewTab ?? false,
          order: data.order,
          tags: data.tags,
        },
      });
    }
  }
}

/**
 * Process collection-level addToMenu and itemsAddToMenu
 */
async function processCollectionMenus(
  modules: Record<string, any>,
  store: any
): Promise<void> {
  const metaModules = Object.entries(modules).filter(([path]) => isMetaFile(path));

  for (const [path, mod] of metaModules) {
    const data = mod.frontmatter ?? {};
    const collection = path.split('/').slice(-2)[0];

    if (!data.addToMenu && !data.itemsAddToMenu) continue;

    const meta = getCollectionMetaFromModules(collection, modules);

    // Process collection-level addToMenu
    if (data.addToMenu) {
      const configs = ensureArray(data.addToMenu);

      for (const menuConfig of configs) {
        const menus = normalizeMenuReference(menuConfig.menu);
        
        const semanticId = buildSemanticId(
          collection,
          {
            parent: menuConfig.parent,
            menu: menuConfig.menu,
            includeMenu: false,
          },
          store
        );
        const collectionId = getUniqueId(semanticId);

        const hasPage = meta.hasPage ?? false;
        const itemUrl = hasPage ? `/${collection}` : undefined;

        store.set({
          id: collectionId,
          data: {
            title: menuConfig.title ?? meta.title ?? capitalize(collection),
            description: menuConfig.description ?? meta.description,
            url: itemUrl,
            menu: menus,
            parent: menuConfig.parent ?? null,
            openInNewTab: menuConfig.openInNewTab ?? false,
            order: menuConfig.order,
          },
        });
      }
    }

    // Process itemsAddToMenu
    if (data.itemsAddToMenu) {
      const configs = ensureArray(data.itemsAddToMenu);

      for (const menuConfig of configs) {
        const menus = normalizeMenuReference(menuConfig.menu);
        
        const attachTo = menuConfig.attachTo === undefined || menuConfig.attachTo === true
          ? collection
          : menuConfig.attachTo;
        
        if (attachTo === collection && !store.has(collection)) {
          const semanticId = buildSemanticId(
            collection,
            {
              parent: null,
              menu: menuConfig.menu,
              includeMenu: false,
            },
            store
          );
          const parentId = getUniqueId(semanticId);
          
          store.set({
            id: parentId,
            data: {
              title: meta.title ?? capitalize(collection),
              description: meta.description,
              url: `/${collection}`,
              menu: menus,
              parent: null,
              openInNewTab: false,
            },
          });
        }

        for (const [itemPath, itemMod] of Object.entries(modules)) {
          if (!itemPath.includes(`content/${collection}/`)) continue;
          if (isMetaFile(itemPath)) continue;

          const itemData = itemMod.frontmatter ?? {};
          const { slug } = parseContentPath(itemPath);

          if (!shouldItemHavePage(itemData, meta)) continue;

          const useRootPath = shouldItemUseRootPath(itemData, meta);
          const itemUrl = useRootPath ? `/${slug}` : `/${collection}/${slug}`;
          
          let parent = attachTo;
          if (itemData.parent && menuConfig.respectHierarchy !== false) {
            parent = itemData.parent;
          }

          const baseId = `${collection}-${slug}-auto`;
          const semanticId = buildSemanticId(
            baseId,
            {
              parent,
              menu: menuConfig.menu,
              includeMenu: false,
            },
            store
          );
          const menuItemId = getUniqueId(semanticId);

          store.set({
            id: menuItemId,
            data: {
              title: itemData.title ?? capitalize(slug),
              description: itemData.description,
              url: itemUrl,
              menu: menus,
              parent,
              openInNewTab: menuConfig.openInNewTab ?? false,
              order: itemData.order,
            },
          });
        }
      }
    }
  }
}