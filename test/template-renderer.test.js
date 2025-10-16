import { describe, expect, it } from 'vitest';

import TemplateRenderer from '../src/TemplateRenderer.js';
import { mockTime, unmockTime } from './utils/time.js';

describe('TemplateRenderer', () => {
  describe('files', () => {
    it('should render basic template', async () => {
      const renderer = new TemplateRenderer({
        dir: 'test/templates',
      });

      const { body, sections } = renderer.run({
        template: 'basic',
        params: {
          name: 'Frank',
        },
      });
      expect(body).toBe('Hello there Frank!');
      expect(sections).toEqual([
        {
          content: 'Hello there Frank!',
        },
      ]);
    });

    it('should extract metadata from template', async () => {
      const renderer = new TemplateRenderer({
        dir: 'test/templates',
      });

      const { meta } = renderer.run({
        template: 'meta',
        params: {
          name: 'Frank',
        },
      });

      expect(meta).toEqual({
        title: 'Hello!',
        subject: 'Hello to Frank!',
      });
    });

    it('should extract sections from the template', async () => {
      const renderer = new TemplateRenderer({
        dir: 'test/templates',
      });

      const { sections } = renderer.run({
        template: 'sections',
        params: {
          name: 'Frank',
        },
      });

      expect(sections).toEqual([
        {
          title: 'SYSTEM',
          content: `
You are a helpful assistant. Your job is to:

- Be a helpful assistant.
- Be awesome.

`.trim(),
        },
        {
          title: 'USER',
          content: `
I am the user! My job is to:

- Not be the assistant.

`.trim(),
        },
      ]);
    });
  });

  describe('setup', () => {
    it('should be able to pass static params in options', async () => {
      const renderer = new TemplateRenderer({
        params: {
          firstName: 'Frank',
        },
      });

      const { body } = renderer.run({
        template: 'Hello {{firstName}} {{lastName}}!',
        params: {
          lastName: 'Reynolds',
        },
      });
      expect(body).toBe('Hello Frank Reynolds!');
    });

    it('should be able to use a raw template in options', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: 'Why hello {{name}}!',
        params: {
          name: 'Carl',
        },
      });
      expect(body).toBe('Why hello Carl!');
    });
  });

  describe('helpers', () => {
    it('should render date helpers', async () => {
      mockTime('2025-01-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The date today is: {{date}}
        The date today is: {{dateLong}}
        The date today is: {{dateMedium}}
        The date today is: {{dateShort}}
        `.trim(),
      });

      expect(body).toBe(
        `
        The date today is: 2025-01-01
        The date today is: January 1, 2025
        The date today is: Jan 1, 2025
        The date today is: 1/1/2025
        `.trim()
      );

      unmockTime();
    });

    it('should render time helpers', async () => {
      mockTime('2025-01-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The time now is: {{time}}
        The time now is: {{timeZone}}
        The time now is: {{timeLong}}
        The time now is: {{timeMedium}}
        The time now is: {{timeShort}}
        `.trim(),
      });

      expect(body).toBe(
        `
        The time now is: 7:00am
        The time now is: 7:00am EST
        The time now is: 7:00:00am
        The time now is: 7:00am
        The time now is: 7am
        `.trim()
      );

      unmockTime();
    });

    it('should render datetime helpers', async () => {
      mockTime('2025-01-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        Right now it is: {{dateTime}}
        Right now it is: {{dateTimeZone}}
        Right now it is: {{dateTimeLong}}
        Right now it is: {{dateTimeMedium}}
        Right now it is: {{dateTimeShort}}
        `.trim(),
      });

      expect(body).toBe(
        `
        Right now it is: January 1, 2025 at 7:00am
        Right now it is: January 1, 2025 at 7:00am EST
        Right now it is: January 1, 2025 at 7:00am
        Right now it is: Jan 1, 2025, 7:00am
        Right now it is: 1/1/2025, 7:00am
        `.trim()
      );

      unmockTime();
    });

    it('should be able to pass time zone style', async () => {
      mockTime('2025-01-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The time now is: {{timeZone}}
        The time now is: {{timeZone style="long"}}
        The time now is: {{timeZone style="shortGeneric"}}
        The time now is: {{timeZone style="longGeneric"}}
        `.trim(),
      });

      expect(body).toBe(
        `
        The time now is: 7:00am EST
        The time now is: 7:00am Eastern Standard Time
        The time now is: 7:00am ET
        The time now is: 7:00am Eastern Time
        `.trim()
      );

      unmockTime();
    });

    it('should be able to pass datetime zone style', async () => {
      mockTime('2025-01-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        Right now it is: {{dateTimeZone}}
        Right now it is: {{dateTimeZone style="long"}}
        Right now it is: {{dateTimeZone style="shortGeneric"}}
        Right now it is: {{dateTimeZone style="longGeneric"}}
        `.trim(),
      });

      expect(body).toBe(
        `
        Right now it is: January 1, 2025 at 7:00am EST
        Right now it is: January 1, 2025 at 7:00am Eastern Standard Time
        Right now it is: January 1, 2025 at 7:00am ET
        Right now it is: January 1, 2025 at 7:00am Eastern Time
        `.trim()
      );

      unmockTime();
    });

    it('should render date helpers with argument passed', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The date today is: {{date today}}
        The date today is: {{dateLong today}}
        The date today is: {{dateMedium today}}
        The date today is: {{dateShort today}}
        `.trim(),
        params: {
          today: new Date('2025-03-15T12:00:00.000Z'),
        },
      });

      expect(body).toBe(
        `
        The date today is: 2025-03-15
        The date today is: March 15, 2025
        The date today is: Mar 15, 2025
        The date today is: 3/15/2025
        `.trim()
      );
    });

    it('should render time helpers with arg', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The time now is: {{time now}}
        The time now is: {{timeZone now}}
        The time now is: {{timeLong now}}
        The time now is: {{timeMedium now}}
        The time now is: {{timeShort now}}
        `.trim(),

        params: {
          now: new Date('2025-03-15T18:00:00.000Z'),
        },
      });

      expect(body).toBe(
        `
        The time now is: 2:00pm
        The time now is: 2:00pm EDT
        The time now is: 2:00:00pm
        The time now is: 2:00pm
        The time now is: 2pm
        `.trim()
      );
    });

    it('should render time helpers with arg', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        The time now is: {{time now meridiem="caps"}}
        The time now is: {{time now meridiem="space"}}
        The time now is: {{time now meridiem="period"}}
        The time now is: {{time now meridiem="short"}}
        `.trim(),

        params: {
          now: new Date('2025-03-15T18:00:00.000Z'),
        },
      });

      expect(body).toBe(
        `
        The time now is: 2:00PM
        The time now is: 2:00 pm
        The time now is: 2:00 p.m.
        The time now is: 2:00p
        `.trim()
      );
    });

    it('should have a number helper in loops', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
{{#each people}}
{{number}}. {{name}}
{{/each}}
        `.trim(),

        params: {
          people: [
            {
              name: 'Frank',
            },
          ],
        },
      });

      expect(body).toBe('1. Frank');
    });

    it('should render relative time helpers', async () => {
      mockTime('2025-07-01T12:00:00.000Z');
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        This happened: {{relTime date}}
        This happened: {{relTime date min=cutoff}}
        `.trim(),
        params: {
          date: new Date('2025-01-01T12:00:00.000Z'),
          cutoff: new Date('2025-03-01T12:00:00.000Z'),
        },
      });

      expect(body).toBe(
        `
        This happened: 6 months ago
        This happened: January 1, 2025
        `.trim()
      );

      unmockTime();
    });

    it('should render link helper', async () => {
      const renderer = new TemplateRenderer();

      const { body } = renderer.run({
        template: `
        {{link "http://example.com" "Hello"}}
        {{link url="http://example.com" text="Hello"}}
        {{link url="http://example.com?foo=bar" text="Hello"}}
        `.trim(),
      });

      expect(body).toBe(
        `
        [Hello](http://example.com)
        [Hello](http://example.com)
        [Hello](http://example.com?foo=bar)
        `.trim()
      );
    });

    it('should be able to create custom helpers', async () => {
      const renderer = new TemplateRenderer({
        helpers: {
          foo(bar = 'bar', baz = 'baz') {
            return `${bar} ${baz}`;
          },
        },
      });

      const { body } = renderer.run({
        template: `
        Hello: {{foo}}
        Hello: {{foo "one"}}
        Hello: {{foo "one" "two"}}
        Hello: {{foo bar="two" baz="one"}}
        Today: {{date today}}
        `.trim(),
        params: {
          today: new Date('2025-03-15T12:00:00.000Z'),
        },
      });

      expect(body).toBe(
        `
        Hello: bar baz
        Hello: one baz
        Hello: one two
        Hello: two one
        Today: 2025-03-15
        `.trim()
      );

      unmockTime();
    });
  });

  it('should allow prototype getters', async () => {
    const renderer = new TemplateRenderer();

    class User {
      constructor(name) {
        this._name = name;
      }

      get name() {
        return this._name;
      }
    }

    const user = new User('Frank');

    const { body } = renderer.run({
      template: `
      Hello {{user.name}}
        `.trim(),
      params: {
        user,
      },
    });

    expect(body).toBe('Hello Frank');
  });

  it('should allow unescape of HTML entities', async () => {
    const renderer = new TemplateRenderer();

    const { body } = renderer.run({
      template: `
      {{{url}}}
        `.trim(),
      params: {
        url: 'https://example.com?foo=bar',
      },
    });

    expect(body).toBe('https://example.com?foo=bar');
  });
});
