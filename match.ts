// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { destLast } from "./deps.ts";
import type { Cache, MatchedResult, Matcher } from "./types.ts";

export function match<const T>(
  matchable: T,
): <R>(
  ...matchers: [
    ...Matcher<Cache, T, R>[],
    (this: Cache, matchable: T) => MatchedResult<R>,
  ]
) => R {
  return function (...matchers) {
    const cache = new WeakMap();

    const [heads, last] = destLast(matchers);

    for (const matcher of heads) {
      const result = matcher.call(cache, matchable);

      if (result.matched) return result.value;
    }

    return last.call(cache, matchable).value;
  };
}
