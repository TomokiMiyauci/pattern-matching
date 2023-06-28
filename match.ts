// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { destLast } from "./deps.ts";
import { closeIterator } from "./utils.ts";
import { CacheGroup, MatchedResult, Matcher } from "./types.ts";

export function match<const T>(
  matchable: T,
): <R>(
  ...matchers: [
    ...Matcher<CacheGroup, T, R>[],
    (this: CacheGroup, matchable: T) => MatchedResult<R>,
  ]
) => R {
  return function (...matchers) {
    const cache = new CacheGroup();
    const [heads, last] = destLast(matchers);

    const result = (() => {
      for (const matcher of heads) {
        const result = matcher.call(cache, matchable);

        if (result.matched) return result.value;
      }

      return last.call(cache, matchable).value;
    })();

    cache.iterators.forEach(closeIterator);

    return result;
  };
}
