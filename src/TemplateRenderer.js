import Handlebars from 'handlebars';
import { memoize } from 'lodash-es';

import { DEFAULT_HELPERS, resolveHelpers } from './helpers';
import { getSections, resolveTemplateSource, runFrontMatter } from './utils';

export default class TemplateRenderer {
  constructor(options = {}) {
    /** @type {Object} */
    this.options = {
      ...options,
      helpers: {
        ...DEFAULT_HELPERS,
        ...options.helpers,
      },
    };
  }

  run(options) {
    const { template, params, helpers, ...rest } = this.resolveOptions(options);

    const compiled = this.loadTemplate(template, rest);
    return compiled(params, {
      helpers: resolveHelpers(helpers, rest),
      allowProtoPropertiesByDefault: true,
    });
  }

  // Private

  /** @returns {Object} */
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
}
