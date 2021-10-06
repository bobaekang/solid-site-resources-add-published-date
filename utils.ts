import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.15-alpha/deno-dom-wasm.ts';

/** Extract resource link values from source text. */
export function extractLinks(text: string) {
  const linkRegex = /link\: \'(.+)\',\n/g;
  const links = [];
  for (const [_, link] of text.matchAll(linkRegex)) links.push(link);

  return links;
}

const ISO8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|(\+|-)\d{2}:\d{2}))?$/;
function getDateValue(maybeDate: any) {
  let maybeDateValue = NaN;

  if (typeof maybeDate === 'number') {
    // assume UTC if number
    maybeDateValue = new Date(maybeDate).valueOf();
  } else if (typeof maybeDate === 'string') {
    if (ISO8601Regex.test(maybeDate)) {
      // date string in ISO 8601 format uses UTC: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#differences_in_assumed_time_zone
      maybeDateValue = new Date(maybeDate).valueOf();
    } else {
      // non-standard date string uses local timezone
      const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      maybeDateValue = new Date(maybeDate).valueOf() + timezoneOffset;
    }
  }

  return isNaN(maybeDateValue) ? undefined : maybeDateValue;
}

const parser = new DOMParser();
function parseDatePublished(htmlText: string, url: string) {
  const document = parser.parseFromString(htmlText, 'text/html');
  if (document === null) return;

  const { hostname } = new URL(url);
  switch (hostname) {
    case 'www.youtube.com':
    case 'youtu.be':
    case 'codechips.me': {
      const selector = 'meta[itemprop="datePublished"]';
      const maybeDate = document.querySelector(selector)?.attributes.getNamedItem('content').value;
      return getDateValue(maybeDate);
    }

    case 'www.infoworld.com': {
      const selector = 'meta[name="DC.date.issued"]';
      const maybeDate = document.querySelector(selector)?.attributes.getNamedItem('content').value;
      return getDateValue(maybeDate);
    }

    case 'css-tricks.com': {
      const selector = 'meta[property="article:published_time"]';
      const maybeDate = document.querySelector(selector)?.attributes.getNamedItem('content').value;
      return getDateValue(maybeDate);
    }

    case 'indepth.dev': {
      const selector = 'time';
      const maybeDate = document.querySelector(selector)?.innerText;
      return getDateValue(maybeDate);
    }

    default: {
      const selector = 'script[type="application/ld+json"]';
      const schemaText = document.querySelector(selector)?.innerText;
      if (schemaText === undefined) return;

      const maybeDate = JSON.parse(schemaText).datePublished;
      return getDateValue(maybeDate);
    }
  }
}

/**
 * Fetch and parse published date value (in milliseconds) from url.
 * Return `undefined` if no valid published date info is found.
 */
export function fetchPublishedAt(url: string) {
  return fetch(url)
    .then((r) => r.text())
    .then((htmlText) => parseDatePublished(htmlText, url))
    .catch((e) => {
      console.error(e);
      return undefined;
    });
}

/** Append `published_at` values to source file text. */
export function appendPublishedAts(text: string, publishedAts: (number | undefined)[]) {
  let updatedText = text;
  const categoriesRegex = /(categories\: .*,\n)  \}/;
  for (const publishedAt of publishedAts)
    updatedText = updatedText.replace(
      categoriesRegex,
      (_, p1: string) => `${p1}    published_at: ${publishedAt},\n  }`,
    );

  return updatedText;
}
