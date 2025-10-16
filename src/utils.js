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

function tryReadFile(filepath, ext) {
  try {
    return readFileSync(filepath + ext, 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function readSource(filepath) {
  return tryReadFile(filepath, '.md') || tryReadFile(filepath, '.txt');
}

// Sections

const SECTIONS_REG = /^=== (\w+) ===\n\n(.+)/gm;

export function getSections(str) {
  const matches = Array.from(str.matchAll(SECTIONS_REG));

  if (!matches.length) {
    return [
      {
        content: str,
      },
    ];
  }

  return matches.map((match) => {
    return {
      title: match[1],
      content: match[2],
    };
  });
}
