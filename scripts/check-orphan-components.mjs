import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const scanRoots = ["app", "components", "lib", "hooks", "context", "interfaces"];
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const allCodeFiles = [];

function walk(dir, out) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
      continue;
    }

    if (codeExtensions.has(path.extname(entry.name))) {
      out.push(path.normalize(fullPath));
    }
  }
}

for (const root of scanRoots) {
  walk(path.join(projectRoot, root), allCodeFiles);
}

const componentsRoot = path.join(projectRoot, "components") + path.sep;
const componentFiles = allCodeFiles.filter(
  (file) => file.startsWith(componentsRoot) && file.endsWith(".tsx"),
);
const componentSet = new Set(componentFiles);

function isExistingFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function resolveImport(fromFile, specifier) {
  let base;

  if (specifier.startsWith("@/")) {
    base = path.join(projectRoot, specifier.slice(2));
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    base,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.jsx"),
    path.join(base, "index.js"),
  ];

  for (const candidate of candidates) {
    if (isExistingFile(candidate)) {
      return path.normalize(candidate);
    }
  }

  return null;
}

const inboundByComponent = new Map(componentFiles.map((file) => [file, new Set()]));
const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportRegex = /import\(\s*["']([^"']+)["']\s*\)/g;
const exportFromRegex = /export\s+\{[^}]*\}\s+from\s+["']([^"']+)["']/g;

for (const importerFile of allCodeFiles) {
  const source = fs.readFileSync(importerFile, "utf8");
  const specifiers = [];

  let match;
  while ((match = importRegex.exec(source))) {
    specifiers.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(source))) {
    specifiers.push(match[1]);
  }

  for (const specifier of specifiers) {
    const resolved = resolveImport(importerFile, specifier);
    if (!resolved) {
      continue;
    }

    const normalizedImporter = path.normalize(importerFile);

    if (componentSet.has(resolved) && normalizedImporter !== resolved) {
      inboundByComponent.get(resolved).add(normalizedImporter);
      continue;
    }

    if (resolved.endsWith(`${path.sep}index.ts`) || resolved.endsWith(`${path.sep}index.tsx`)) {
      const barrelSource = fs.readFileSync(resolved, "utf8");
      let exportMatch;
      while ((exportMatch = exportFromRegex.exec(barrelSource))) {
        const reExportResolved = resolveImport(resolved, exportMatch[1]);
        if (
          reExportResolved &&
          componentSet.has(reExportResolved) &&
          normalizedImporter !== reExportResolved
        ) {
          inboundByComponent.get(reExportResolved).add(normalizedImporter);
        }
      }
    }
  }
}

const orphanComponents = [...inboundByComponent.entries()]
  .filter(([, importers]) => importers.size === 0)
  .map(([file]) => path.relative(projectRoot, file))
  .sort();

if (orphanComponents.length > 0) {
  console.error("Orphan components found (no imports):");
  for (const component of orphanComponents) {
    console.error(`- ${component}`);
  }
  process.exit(1);
}

console.log(`No orphan components found. Checked ${componentFiles.length} components.`);
