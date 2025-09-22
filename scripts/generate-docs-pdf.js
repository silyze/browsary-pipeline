#!/usr/bin/env node

/**
 * Generate a PDF bundle for the documentation under ./docs.
 *
 * Requirements:
 *   npm install --save-dev pdfkit marked
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "../");
const DOCS_DIR = path.join(ROOT, "docs");
const OUTPUT_PDF = path.join(DOCS_DIR, "browsary-pipeline.pdf");
const PRIORITY_ORDER = ["json-pipeline.md", "functions.md"];

marked.setOptions({
  mangle: false,
  headerIds: false,
});

function collectMarkdownFiles(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const relPath = path.join(base, entry.name);
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(absPath, relPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(relPath.replace(/\\/g, "/"));
    }
  }
  return files;
}

function sortDocs(files) {
  const priority = new Map(PRIORITY_ORDER.map((name, idx) => [name, idx]));
  return files.sort((a, b) => {
    const ap = priority.has(a) ? priority.get(a) : PRIORITY_ORDER.length;
    const bp = priority.has(b) ? priority.get(b) : PRIORITY_ORDER.length;
    if (ap !== bp) return ap - bp;
    return a.localeCompare(b);
  });
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return fallback.replace(/\.md$/i, "");
}

function rewriteLinks(markdown, currentPath, tocMap) {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, target) => {
    if (/^(https?:)?\//i.test(target) || target.startsWith("#")) {
      return match;
    }
    const [rawPath] = target.split("#");
    if (!rawPath) return match;
    const resolved = path
      .normalize(path.join(path.dirname(currentPath), rawPath))
      .replace(/\\/g, "/");
    const entry = tocMap.get(resolved);
    if (!entry) return match;
    return `[${entry.index}. ${entry.title}]`;
  });
}

function cleanInlineText(text) {
  return (text || "").replace(/`([^`]+)`/g, "$1");
}

function inlineText(tokens) {
  if (!tokens || !tokens.length) return "";
  let out = "";
  tokens.forEach((tok) => {
    switch (tok.type) {
      case "text":
        if (tok.tokens && tok.tokens.length) {
          out += inlineText(tok.tokens);
        } else {
          out += cleanInlineText(tok.text);
        }
        break;
      case "space":
        out += " ";
        break;
      case "codespan":
        out += tok.text;
        break;
      case "strong":
      case "em":
      case "del":
        out += inlineText(tok.tokens || []);
        break;
      case "link":
        out += cleanInlineText(tok.text);
        if (tok.href) out += ` (${tok.href})`;
        break;
      case "image":
        out += cleanInlineText(tok.text || tok.href || "");
        break;
      case "br":
        out += "\n";
        break;
      default:
        out += cleanInlineText(tok.raw || tok.text || "");
    }
  });
  return out;
}

function renderParagraph(doc, token, indentLevel) {
  const text = cleanInlineText(inlineText(token.tokens || []) || token.text || "").trim();
  if (!text) return;
  doc.font("Helvetica").fontSize(11).text(text, {
    indent: indentLevel * 18,
    paragraphGap: 6,
  });
}

function renderHeading(doc, token, indentLevel) {
  const text = cleanInlineText(inlineText(token.tokens || []) || token.text || "").trim();
  if (!text) return;
  const size = Math.max(22 - token.depth * 2, 12);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(size).text(text, {
    indent: indentLevel * 18,
  });
  doc.moveDown(0.2);
}

function renderCode(doc, token, indentLevel) {
  doc.moveDown(0.2);
  doc.font("Courier").fontSize(10).text(token.text, {
    indent: indentLevel * 18,
  });
  doc.moveDown(0.2);
}

function renderBlockquote(doc, token, indentLevel) {
  doc.moveDown(0.2);
  doc.font("Helvetica-Oblique").fontSize(11);
  renderTokens(doc, token.tokens || [], indentLevel + 1);
  doc.font("Helvetica");
  doc.moveDown(0.2);
}

function renderTable(doc, token, indentLevel) {
  const header = token.header
    .map((cell) => cleanInlineText(inlineText(cell.tokens || []) || cell.text || "").trim())
    .join(" | ");
  const separator = token.header.map(() => "---").join(" | ");
  doc.font("Helvetica-Bold").fontSize(11).text(header, {
    indent: indentLevel * 18,
  });
  doc.font("Helvetica").fontSize(11).text(separator, {
    indent: indentLevel * 18,
  });
  token.rows.forEach((row) => {
    const line = row
      .map((cell) => cleanInlineText(inlineText(cell.tokens || []) || cell.text || "").trim())
      .join(" | ");
    doc.font("Helvetica").fontSize(11).text(line, {
      indent: indentLevel * 18,
    });
  });
  doc.moveDown(0.3);
}

function renderList(doc, token, indentLevel) {
  token.items.forEach((item, idx) => {
    const base = token.start ?? 1;
    const number = item.start ?? base + idx;
    const marker = token.ordered ? number + "." : "-";
    let primaryText = "";
    if (item.tokens && item.tokens.length) {
      const first = item.tokens[0];
      if (first && first.type === "text") {
        primaryText = inlineText(first.tokens || []) || first.text || "";
      } else {
        primaryText = inlineText(item.tokens) || item.text || "";
      }
    } else {
      primaryText = item.text || "";
    }
    primaryText = cleanInlineText(primaryText).trim();
    const indent = indentLevel * 18;
    doc.font("Helvetica").fontSize(11).text(`${marker} ${primaryText}`, {
      indent,
    });
    const remainder = item.tokens ? item.tokens.slice(1) : [];
    if (remainder.length) {
      renderTokens(doc, remainder, indentLevel + 1);
    }
    doc.moveDown(0.1);
  });
}

function renderTokens(doc, tokens, indentLevel = 0) {
  tokens.forEach((token) => {
    switch (token.type) {
      case "space":
        break;
      case "paragraph":
        renderParagraph(doc, token, indentLevel);
        break;
      case "heading":
        renderHeading(doc, token, indentLevel);
        break;
      case "code":
        renderCode(doc, token, indentLevel);
        break;
      case "blockquote":
        renderBlockquote(doc, token, indentLevel);
        break;
      case "list":
        renderList(doc, token, indentLevel);
        break;
      case "table":
        renderTable(doc, token, indentLevel);
        break;
      case "hr":
        doc.moveDown(0.2);
        doc.font("Helvetica").text("?", {
          indent: indentLevel * 18,
        });
        doc.moveDown(0.2);
        break;
      case "html":
        break;
      default:
        if (token.text) {
          const text = cleanInlineText(token.text);
          doc.font("Helvetica").fontSize(11).text(text, {
            indent: indentLevel * 18,
          });
        }
    }
  });
}

function renderMarkdown(doc, markdown) {
  const tokens = marked.lexer(markdown);
  renderTokens(doc, tokens);
  doc.moveDown(0.4);
}

function generatePdf(tocEntries, docs) {
  const doc = new PDFDocument({ autoFirstPage: false });
  const stream = fs.createWriteStream(OUTPUT_PDF);
  doc.pipe(stream);

  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(26).text("Browsary Pipeline Documentation", {
    align: "center",
  });
  doc.moveDown(1.5);
  doc.font("Helvetica").fontSize(12).text("Generated on " + new Date().toISOString().split("T")[0], {
    align: "center",
  });

  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(20).text("Table of Contents");
  doc.moveDown();
  tocEntries.forEach((entry) => {
    doc.font("Helvetica").fontSize(12).text(entry.index + ". " + entry.title + " (" + entry.path + ")");
  });

  docs.forEach((item) => {
    const entry = tocEntries[item.index - 1];
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(18).text(entry.index + ". " + item.title);
    doc.moveDown();
    renderMarkdown(doc, item.content);
  });

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error("Docs directory not found at " + DOCS_DIR);
    process.exit(1);
  }

  const allDocs = sortDocs(collectMarkdownFiles(DOCS_DIR));
  if (!allDocs.length) {
    console.error("No markdown files found in docs directory.");
    process.exit(1);
  }

  const docsData = allDocs.map((relativePath) => {
    const absolutePath = path.join(DOCS_DIR, relativePath);
    const raw = fs.readFileSync(absolutePath, "utf-8");
    const title = extractTitle(raw, path.basename(relativePath));
    return {
      relativePath,
      absolutePath,
      raw,
      title,
    };
  });

  const tocEntries = docsData.map((doc, idx) => ({
    index: idx + 1,
    title: doc.title,
    path: doc.relativePath,
  }));

  const tocMap = new Map(tocEntries.map((entry) => [entry.path, entry]));

  const processedDocs = docsData.map((doc, idx) => ({
    index: idx + 1,
    title: doc.title,
    content: rewriteLinks(doc.raw, doc.relativePath, tocMap),
  }));

  generatePdf(tocEntries, processedDocs)
    .then(() => {
      console.log("Documentation PDF generated at " + OUTPUT_PDF);
    })
    .catch((error) => {
      console.error("Failed to generate PDF:", error);
      process.exit(1);
    });
}

main();
