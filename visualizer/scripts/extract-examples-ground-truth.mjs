import fs from "node:fs";
import path from "node:path";
import * as parser from "@babel/parser";

function astToValue(node) {
  if (!node) return undefined;
  switch (node.type) {
    case "StringLiteral":
      return node.value;
    case "NumericLiteral":
      return node.value;
    case "BooleanLiteral":
      return node.value;
    case "NullLiteral":
      return null;
    case "ArrayExpression":
      return node.elements.map(astToValue);
    case "ObjectExpression": {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === "ObjectProperty") {
          const key =
            prop.key.name !== undefined ? prop.key.name : prop.key.value;
          obj[key] = astToValue(prop.value);
        }
      }
      return obj;
    }
    case "UnaryExpression": {
      if (
        node.operator === "-" &&
        (node.argument.type === "NumericLiteral" ||
          node.argument.type === "Literal")
      ) {
        return -node.argument.value;
      }
      if (
        node.operator === "+" &&
        (node.argument.type === "NumericLiteral" ||
          node.argument.type === "Literal")
      ) {
        return +node.argument.value;
      }
      return undefined;
    }
    case "Identifier": {
      if (node.name === "undefined") return undefined;
      if (node.name === "Infinity") return Infinity;
      if (node.name === "NaN") return NaN;
      return node.name;
    }
    default:
      return undefined;
  }
}

function parseSnippet(codeSnippet) {
  try {
    const ast = parser.parse(`(${codeSnippet})`, {
      sourceType: "module",
      plugins: ["jsx"],
    });
    const expr = ast.program.body[0]?.expression;
    return astToValue(expr);
  } catch {
    return undefined;
  }
}

const problemsDir = path.resolve("src/problems");

// Load registry safely
const registrySrc = fs.readFileSync(
  path.resolve("src/config/examplesRegistry.js"),
  "utf8",
);
const registryAst = parser.parse(registrySrc, {
  sourceType: "module",
  plugins: ["jsx"],
});
let EXAMPLES_REGISTRY = {};
for (const stmt of registryAst.program.body) {
  if (
    stmt.type === "ExportNamedDeclaration" &&
    stmt.declaration?.type === "VariableDeclaration"
  ) {
    for (const decl of stmt.declaration.declarations) {
      if (decl.id.name === "EXAMPLES_REGISTRY" && decl.init) {
        EXAMPLES_REGISTRY = astToValue(decl.init) || {};
      }
    }
  }
}

const reportPath = path.resolve("scripts/manual-input-report.json");
let targetList = [];
if (fs.existsSync(reportPath)) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  targetList = [...(report.without || []), ...(report.withInput || [])];
} else {
  const folders = fs
    .readdirSync(problemsDir)
    .filter((f) => fs.statSync(path.join(problemsDir, f)).isDirectory());
  targetList = folders.map((folder) => ({ folder }));
}

const rows = [];
for (const p of targetList) {
  const dir = path.join(problemsDir, p.folder);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  const jsxFile = files.find(
    (f) =>
      f.endsWith(".jsx") && !f.endsWith(".css") && !f.endsWith(".test.jsx"),
  );
  if (!jsxFile) continue;
  const code = fs.readFileSync(path.join(dir, jsxFile), "utf8");

  // Find EXAMPLES declaration
  const exDecl = code.match(
    /const EXAMPLES\s*=\s*(getExamples(?:Or)?\([^;]*?\))\s*;?/s,
  );
  const slugMatch = code.match(/getExamples(?:Or)?\(\s*['"]([^'"]+)['"]/);
  const slug = slugMatch ? slugMatch[1] : p.slug || "";
  const hasFallback = /getExamplesOr\(/.test(code);

  let fallbackFields = [];
  let fallbackExamples = [];
  let registryFields = [];
  let registryExamples = [];
  let inlineExamples = [];

  // Look up registry by slug
  if (slug && EXAMPLES_REGISTRY[slug]) {
    registryExamples = EXAMPLES_REGISTRY[slug];
    const keys = new Set();
    for (const ex of registryExamples)
      for (const k of Object.keys(ex)) if (k !== "label") keys.add(k);
    registryFields = Array.from(keys);
  }

  if (hasFallback) {
    const m = code.match(
      /getExamplesOr\(\s*['"][^'"]+['"]\s*,\s*(\[[\s\S]*?\])\)/,
    );
    if (m) {
      const arr = parseSnippet(m[1]);
      if (Array.isArray(arr)) {
        fallbackExamples = arr;
        const keys = new Set();
        for (const ex of arr)
          for (const k of Object.keys(ex)) if (k !== "label") keys.add(k);
        fallbackFields = Array.from(keys);
      }
    }
  }

  const inlineMatch = code.match(/const EXAMPLES\s*=\s*/);
  if (inlineMatch) {
    const start = inlineMatch.index + inlineMatch[0].length;
    if (code[start] === "[") {
      let depth = 0;
      let i = start;
      while (i < code.length) {
        const c = code[i];
        if (c === "[") depth++;
        else if (c === "]") {
          depth--;
          if (depth === 0) break;
        }
        i++;
      }
      if (i < code.length) {
        const arrSrc = code.slice(start, i + 1);
        const arr = parseSnippet(arrSrc);
        if (Array.isArray(arr)) {
          inlineExamples = arr;
        }
      }
    }
  }

  rows.push({
    folder: p.folder,
    number: p.number,
    title: p.title,
    slug,
    useOr: hasFallback,
    hasDecl: !!exDecl,
    fallbackFields,
    fallbackExamples,
    registryFields,
    registryExamples,
    inlineExamples,
  });
}

// Merge: prefer registry fields, else fallback fields, else inline
const merged = rows.map((r) => {
  const exs = r.registryExamples.length
    ? r.registryExamples
    : r.fallbackExamples.length
      ? r.fallbackExamples
      : r.inlineExamples;
  const keys = new Set();
  for (const ex of exs)
    for (const k of Object.keys(ex)) if (k !== "label") keys.add(k);
  const fields = r.registryFields.length
    ? r.registryFields
    : r.fallbackFields.length
      ? r.fallbackFields
      : Array.from(keys);
  return { ...r, fields, examples: exs };
});
fs.writeFileSync(
  "scripts/examples-ground-truth.json",
  JSON.stringify(merged, null, 2),
);

// Summary of field signatures from ground truth
const sigs = {};
for (const r of merged) {
  const key = r.fields.slice().sort().join("|");
  if (!sigs[key]) sigs[key] = [];
  sigs[key].push(r.folder);
}
console.log("Total:", merged.length);
console.log("Has EXAMPLES decl:", merged.filter((r) => r.hasDecl).length);
console.log("Uses getExamplesOr:", merged.filter((r) => r.useOr).length);
console.log(
  "With fields (registry or fallback):",
  merged.filter((r) => r.fields.length).length,
);
console.log("No fields:", merged.filter((r) => r.fields.length === 0).length);
console.log("\n=== Field signatures (merged ground truth) ===");
Object.entries(sigs)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([sig, folders]) => {
    console.log(`${folders.length}\t${sig}\t${folders.slice(0, 6).join(",")}`);
  });
