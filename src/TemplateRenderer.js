import { readFileSync } from 'fs';
import path from 'path';

import { DateTime } from '@bedrockio/chrono';
import frontmatter from 'front-matter';
import Handlebars from 'handlebars';
import { memoize } from 'lodash-es';

const HELPERS = {
  // date
  date(arg) {
    return new DateTime(arg).toDate();
  },
  dateLong(arg) {
    return new DateTime(arg).toDateLong();
  },
  dateMedium(arg) {
    return new DateTime(arg).toDateMedium();
  },
  dateShort(arg) {
    return new DateTime(arg).toDateShort();
  },

  // time
  time(arg, meridiem) {
    return new DateTime(arg).toTimeMedium({
      meridiem,
    });
  },

  /**
   * @param {Intl.DateTimeFormatOptions['timeZoneName']} [style='short']
   */
  timeZone(arg, meridiem, style = 'short') {
    return new DateTime(arg).toTimeWithZone({
      meridiem,
      timeZoneName: style,
    });
  },
  timeLong(arg, meridiem) {
    return new DateTime(arg).toTimeLong({
      meridiem,
    });
  },
  timeMedium(arg, meridiem) {
    return new DateTime(arg).toTimeMedium({
      meridiem,
    });
  },
  timeShort(arg, meridiem) {
    return new DateTime(arg).toTimeShort({
      meridiem,
    });
  },

  // datetime
  dateTime(arg, meridiem) {
    return new DateTime(arg).formatLong({
      meridiem,
    });
  },

  /**
   * @param {Intl.DateTimeFormatOptions['timeZoneName']} [style='short']
   */
  dateTimeZone(arg, meridiem, style = 'short') {
    return new DateTime(arg).formatWithZone({
      meridiem,
      timeZoneName: style,
    });
  },
  dateTimeLong(arg, meridiem) {
    return new DateTime(arg).formatLong({
      meridiem,
    });
  },
  dateTimeMedium(arg, meridiem) {
    return new DateTime(arg).formatMedium({
      meridiem,
    });
  },
  dateTimeShort(arg, meridiem) {
    return new DateTime(arg).formatShort({
      meridiem,
    });
  },

  // relative time

  relTime(arg, min, max) {
    return new DateTime(arg).relative({
      min,
      max,
    });
  },

  number(options) {
    const { index } = options.data;
    if (index == null) {
      return '';
    }
    return index + 1;
  },

  link(url, text) {
    return new Handlebars.SafeString(`[${text}](${url})`);
  },

  button(url, text) {
    return generateHtml('a', {
      text,
      href: url,
      class: 'button',
      target: '_blank',
    });
  },
};

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

function resolveTemplateSource(arg, options) {
  const { dir } = options;

  if (dir) {
    const filepath = path.resolve(dir, arg);
    return readSource(filepath) || arg;
  } else {
    return arg;
  }
}

export default class TemplateRenderer {
  constructor(options = {}) {
    this.options = {
      ...options,
      helpers: {
        ...HELPERS,
        ...options.helpers,
      },
    };
  }

  loadTemplate = memoize((input, options) => {
    const source = resolveTemplateSource(input, options);
    const template = Handlebars.compile(source.trim());
    return (params, options) => {
      const output = template(params, options);

      const { body, meta } = runFrontMatter(output);

      const sections = getSections(body);

      return {
        body,
        meta,
        sections,
      };
    };
  });

  run(options) {
    const { template, params, helpers, ...rest } = this.resolveOptions(options);

    const compiled = this.loadTemplate(template, rest);
    return compiled(params, {
      helpers: resolveHelpers(helpers, rest),
      allowProtoPropertiesByDefault: true,
    });
  }

  resolveOptions(options = {}) {
    return {
      ...this.options,
      ...options,
      params: {
        ...this.options.params,
        ...options.params,
      },
    };
  }
}

// TODO: move to helpers

function resolveHelpers(helpers, options) {
  const result = {};
  for (let [key, value] of Object.entries(helpers)) {
    result[key] = resolveHelper(value, options);
  }
  return result;
}

function resolveHelper(arg, options) {
  const { names, handler } = resolveHelperNames(arg);
  return (...args) => {
    return handler(...resolveHelperArgs(args, names, options));
  };
}

const ARGUMENT_NAMES_REG = /\w+\((.+)\) {/;

function resolveHelperNames(arg) {
  if (typeof arg === 'function') {
    const handler = arg;
    const match = handler.toString().match(ARGUMENT_NAMES_REG);

    let names = [];

    if (match) {
      names = match[1]
        .split(', ')
        .map((arg) => {
          return arg.split(' ')[0];
        })
        .filter((arg) => {
          return arg !== 'options';
        });
    }

    return { handler, names };
  } else {
    return {
      names: arg.params,
      handler: arg.handler,
    };
  }
}

function resolveHelperArgs(args, names, options) {
  const ordered = args.slice(0, -1);
  const [meta] = args.slice(-1);
  let params = { ...meta.hash };

  ordered.forEach((value, i) => {
    const name = names[i];
    params[name] = value;
  });

  const resolved = names.map((name) => {
    return params[name];
  });

  options = {
    options,
    data: meta.data,
  };

  return [...resolved, options];
}

const SECTIONS_REG = /^=== (\w+) ===\n\n(.+)/gm;

function getSections(str) {
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

function generateHtml(tag, props) {
  const { text, ...rest } = props;
  const attr = Object.entries(rest)
    .map((entry) => {
      const [key, value] = entry;
      if (value) {
        return [key, `"${value}"`].join('=');
      }
    })
    .filter((a) => a)
    .join(' ');

  let html = `<${tag} ${attr}>`;
  if (text) {
    html += `${text}</${tag}>`;
  }
  return new Handlebars.SafeString(html);
}

function runFrontMatter(str) {
  let { body, attributes: meta } = frontmatter(str);

  return {
    meta,
    body: body.trim(),
  };
}
