// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { destLast } from "./deps.ts";
import type { MatchedResult, Matcher } from "./types.ts";

export function match<T>(
  matchable: T,
): <R>(
  ...matchers: [...Matcher<T, R>[], (matchable: T) => MatchedResult<R>]
) => R {
  return (...matchers) => {
    const [heads, last] = destLast(matchers);

    for (const matcher of heads) {
      const result = matcher(matchable);

      if (result.matched) return result.value;
    }

    return last(matchable).value;
  };
}
