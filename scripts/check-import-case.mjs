import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const scanRoots = ["app", "components", "lib", "hooks", "context", "interfaces"];
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const styleOrAssetExtensions = [
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
];

const allCodeFiles = [];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
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

function isFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function resolveCaseInsensitive(absolutePath) {
  const resolved = path.resolve(absolutePath);
  const root = path.parse(resolved).root;
  const segments = resolved.slice(root.length).split(path.sep).filter(Boolean);
  let current = root;

  for (const segment of segments) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
      return null;
    }
    const entries = fs.readdirSync(current);
    const exact = entries.find((entry) => entry === segment);
    if (exact) {
      current = path.join(current, exact);
      continue;
    }
    const insensitive = entries.find(
      (entry) => entry.toLowerCase() === segment.toLowerCase(),
    );
    if (!insensitive) {
      return null;
    }
    current = path.join(current, insensitive);
  }

  return path.normalize(current);
}

function hasExactCase(absolutePath) {
  const resolved = path.resolve(absolutePath);
  const root = path.parse(resolved).root;
  const segments = resolved.slice(root.length).split(path.sep).filter(Boolean);
  let current = root;

  for (const segment of segments) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
      return false;
    }
    const entries = fs.readdirSync(current);
    if (!entries.includes(segment)) {
      return false;
    }
    current = path.join(current, segment);
  }

  return true;
}

function shouldSkipSpecifier(specifier) {
  return styleOrAssetExtensions.some((ext) => specifier.endsWith(ext));
}

function getCandidates(basePath, specifier) {
  if (path.extname(specifier)) {
    return [basePath];
  }

  return [
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.jsx"),
    path.join(basePath, "index.js"),
  ];
}

const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportRegex = /import\(\s*["']([^"']+)["']\s*\)/g;

const mismatches = [];

for (const importer of allCodeFiles) {
  const source = fs.readFileSync(importer, "utf8");
  const specifiers = [];
  let match;

  while ((match = importRegex.exec(source))) {
    specifiers.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(source))) {
    specifiers.push(match[1]);
  }

  for (const specifier of specifiers) {
    if (shouldSkipSpecifier(specifier)) continue;

    let basePath;
    if (specifier.startsWith("@/")) {
      basePath = path.join(projectRoot, specifier.slice(2));
    } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
      basePath = path.resolve(path.dirname(importer), specifier);
    } else {
      continue;
    }

    const candidates = getCandidates(basePath, specifier);
    let resolvedAny = false;
    let resolvedExact = false;
    let expectedPath = null;

    for (const candidate of candidates) {
      const insensitive = resolveCaseInsensitive(candidate);
      if (!insensitive || !isFile(insensitive)) continue;

      resolvedAny = true;
      expectedPath = insensitive;
      if (hasExactCase(candidate) && isFile(candidate)) {
        resolvedExact = true;
        break;
      }
    }

    if (resolvedAny && !resolvedExact) {
      mismatches.push({
        importer: path.relative(projectRoot, importer),
        specifier,
        expected: expectedPath ? path.relative(projectRoot, expectedPath) : null,
      });
    }
  }
}

if (mismatches.length > 0) {
  console.error("Import case mismatches found:");
  for (const mismatch of mismatches) {
    console.error(
      `- ${mismatch.importer}: "${mismatch.specifier}" (expected casing: ${mismatch.expected})`,
    );
  }
  process.exit(1);
}

console.log(`Import case check passed for ${allCodeFiles.length} code files.`);
