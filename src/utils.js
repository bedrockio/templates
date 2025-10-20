import { readFileSync } from 'fs';
import path from 'path';

import frontmatter from 'front-matter';

export function resolveTemplateSource(arg, options) {
  const { dir } = options;

  if (dir) {
    const filepath = path.resolve(dir, arg);
    return readSource(filepath) || arg;
  } else {
    return arg;
  }
}

export function runFrontMatter(str) {
  let { body, attributes: meta } = frontmatter(str);

  return {
    meta,
    body: body.trim(),
  };
}

function tryReadFile(filepath) {
  try {
    return readFileSync(filepath, 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function readSource(filepath) {
  if (path.extname(filepath)) {
    return tryReadFile(filepath);
  } else {
    return tryReadFile(filepath + '.md') || tryReadFile(filepath + '.txt');
  }
}

// Sections

const SECTIONS_REG = /^=== (\w+) ===\n\n/gm;

export function getSections(str) {
  str = str.trim();
  const arr = str.split(SECTIONS_REG).slice(1);

  if (!arr.length) {
    return [
      {
        content: str,
      },
    ];
  }

  const sections = [];

  for (let i = 0; i < arr.length; i += 2) {
    sections.push({
      title: arr[i],
      content: arr[i + 1].trim(),
    });
  }

  return sections;
}

// Whitespace

// Handlebars doesn't allow a way to selectively
// escape so instead unescape some basic tokens.
export function unescapeHtml(html) {
  html = html.replace(/&#39;/g, "'");
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&#x27;/g, "'");
  html = html.replace(/&#x3D;/g, '=');
  return html;
}
