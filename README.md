# @bedrockio/templates

This package provides a wrapper for Handlebars with additional features for
custom templating. It standardizes template rendering with support for front
matter, sections, and custom helpers.

- [Install](#install)
- [Usage](#usage)
- [Templates](#templates)
- [Sections](#sections)
- [Helpers](#helpers)
  - [Default Helpers](#default-helpers)

## Install

```bash
yarn install @bedrockio/templates
```

## Usage

```js
import { TemplateRenderer } from '@bedrockio/templates';

const renderer = new TemplateRenderer({
  // Templates directory
  dir: 'templates',

  // Custom helpers (optional)
  helpers: {
    uppercase: (str) => str.toUpperCase(),
  },

  // Default params (optional)
  params: {
    foo: 'bar',
  },
});

// Render a template
const result = renderer.run({
  // The template string or path
  template: 'Hello {{name}}!',

  // Parameters to interpolate
  params: {
    name: 'World',
  },
});

console.log(result.body); // "Hello World!"
```

## Templates

Templates use Handlebars syntax and support front matter for metadata:

```
---
title: My Title
---

Hello, {{user.name}}!

{{#if user.isPremium}}
  Welcome, premium user!
{{/if}}
```

## Sections

Templates can be divided into named sections using three equals signs: `===` as
delimiters:

```
=== SYSTEM ===

You are a helpful assistant.

=== USER ===

I am the user!
```

Sections are accessed in the result:

```js
const { sections } = renderer.run({
  template: 'my-template,
});

console.log(sections);

/*
[
  {
    name:'SYSTEM',
    content: 'You are a helpful assistant.'
  },
  {
    name:'USER',
    content: 'I am the user!'
  },
]
*/

```

## Helpers

The renderer includes default helpers and supports custom helpers. Custom
helpers can be passed during instantiation or per render call.

```js
const renderer = new TemplateRenderer({
  helpers: {
    foo() {
      return 'foo';
    },
  },
});
```

### Default Helpers

| Helper               | Params                 | Example                                                     |
| -------------------- | ---------------------- | ----------------------------------------------------------- |
| **`date`**           |                        | `2025-01-01`                                                |
| **`dateLong`**       |                        | `January 1, 2025`                                           |
| **`dateMedium`**     |                        | `Jan 1, 2025`                                               |
| **`dateShort`**      |                        | `1/1/2025`                                                  |
| **`time`**           |                        | `7:00am`                                                    |
| **`time`**           | `meridiem="caps"`      | `2:00PM`                                                    |
| **`time`**           | `meridiem="space"`     | `2:00 pm`                                                   |
| **`time`**           | `meridiem="period"`    | `2:00 p.m.`                                                 |
| **`time`**           | `meridiem="short"`     | `2:00p`                                                     |
| **`timeLong`**       |                        | `7:00:00am`                                                 |
| **`timeMedium`**     |                        | `7:00am`                                                    |
| **`timeShort`**      |                        | `7am`                                                       |
| **`timeZone`**       |                        | `7:00am EST`                                                |
| **`timeZone`**       | `style="long"`         | `7:00am Eastern Standard Time`                              |
| **`timeZone`**       | `style="shortGeneric"` | `7:00am ET`                                                 |
| **`timeZone`**       | `style="longGeneric"`  | `7:00am Eastern Time`                                       |
| **`dateTime`**       |                        | `January 1, 2025 at 7:00am`                                 |
| **`dateTimeLong`**   |                        | `January 1, 2025 at 7:00am`                                 |
| **`dateTimeMedium`** |                        | `Jan 1, 2025, 7:00am`                                       |
| **`dateTimeShort`**  |                        | `1/1/2025, 7:00am`                                          |
| **`dateTimeZone`**   |                        | `January 1, 2025 at 7:00am EST`                             |
| **`dateTimeZone`**   | `style="long"`         | `January 1, 2025 at 7:00am Eastern Standard Time`           |
| **`dateTimeZone`**   | `style="shortGeneric"` | `January 1, 2025 at 7:00am ET`                              |
| **`dateTimeZone`**   | `style="longGeneric"`  | `January 1, 2025 at 7:00am Eastern Time`                    |
| **`relTime`**        | `date`                 | `6 months ago`                                              |
| **`relTime`**        | `date min=cutoff`      | `January 1, 2025`                                           |
| **`number`**         |                        | `1. Frank`                                                  |
| **`link`**           | `url text`             | `[Hello](http://example.com)`                               |
| **`button`**         | `url text`             | `<a href="..." class="button" target="_blank">Click me</a>` |
| **`list`**           | `arr`                  | `- one`<br>`- two`<br>`- three`                             |

**`relTime`** - Formats a date as relative time (e.g., "6 months ago"). When a
`min` or `max` cutoff date is provided, dates beyond that threshold will be
formatted as absolute dates instead of relative time.

**`number`** - Provides a 1-based index when used inside an `{{#each}}` loop.
Useful for creating numbered lists.

**`list`** - Converts an array into a markdown-formatted bullet list with each
item prefixed by `- `.
