#!/usr/bin/env ts-node
/**
 * Generates TypeScript permission metadata and union types from catalog JSON.
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

interface CatalogPermission { key: string; description: string; }
interface CatalogGroup { key: string; title: string; permissions: CatalogPermission[]; }
interface Catalog { version: number; groups: CatalogGroup[]; }

const catalogPath = path.join(process.cwd(), 'config', 'permissions.catalog.json');
const outPath = path.join(process.cwd(), 'types', 'permissions.ts');

const raw = readFileSync(catalogPath,'utf8');
const catalog: Catalog = JSON.parse(raw);

const all = catalog.groups.flatMap(g => g.permissions.map(p => p.key));
const unique = Array.from(new Set(all));

let duplicateCount = all.length - unique.length;
if (duplicateCount > 0) {
  console.error(`[permissions:gen] Found ${duplicateCount} duplicate permission keys.`);
  process.exit(2);
}

const union = unique.map(k=>`'${k}'`).join(' | ');

const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Source: config/permissions.catalog.json (version ${catalog.version})\n\nexport type PermissionKey = ${union};\n\nexport interface PermissionMeta { key: PermissionKey; description: string; group: string; title: string; }\n\nexport const PERMISSION_GROUPS = ${JSON.stringify(catalog.groups, null, 2)} as const;\n\nexport const PERMISSION_METADATA: PermissionMeta[] = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => ({ key: p.key as PermissionKey, description: p.description, group: g.key, title: g.title })));\n\nexport const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_METADATA.map(p => p.key);\n`;

writeFileSync(outPath, fileContent, 'utf8');
console.log('[permissions:gen] Wrote', outPath);
