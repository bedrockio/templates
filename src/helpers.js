import { DateTime } from '@bedrockio/chrono';
import Handlebars from 'handlebars';

export const DEFAULT_HELPERS = {
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

  list(arr) {
    return arr
      .map((el) => {
        return `- ${el}`;
      })
      .join('\n');
  },
};

export function resolveHelpers(helpers, options) {
  const result = {};
  for (let [key, value] of Object.entries(helpers)) {
    result[key] = resolveHelper(value, options);
  }
  return result;
}

function resolveHelper(arg, options) {
  const { names, handler } = resolveArgumentNames(arg);
  return (...args) => {
    return handler(...resolveHelperArgs(args, names, options));
  };
}

// Arguments

const ARGUMENT_NAMES_REG = /\w+\((.+)\) {/;

function resolveArgumentNames(arg) {
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
    let value = params[name];
    value = normalizeParam(name, value, params, options);
    return value;
  });

  options = {
    options,
    data: meta.data,
  };

  return [...resolved, options];
}

// Param normalization

function normalizeParam(name, value, params, options) {
  if (name === 'url' || name === 'href') {
    value = normalizeUrl(value, params, options);
  }
  return value;
}

const PARAM_REG = /:([a-z]+)/gi;

function normalizeUrl(str, params, options) {
  const { baseUrl } = options;
  if (baseUrl && str.startsWith('/')) {
    str = baseUrl + str;
  }

  str = str.replace(PARAM_REG, (_, key) => {
    const value = params[key];
    // Need to delete the injected params or they
    // will be passed on to the HTML element.
    delete params[key];
    return value;
  });

  return str;
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
