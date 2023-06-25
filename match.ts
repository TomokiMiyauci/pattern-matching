// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { destLast, EmplaceableWeakMap } from "./deps.ts";
import type { Env, MatchedResult, Matcher } from "./types.ts";

export function match<const T>(
  matchable: T,
): <R>(
  ...matchers: [...Matcher<T, R>[], (matchable: T) => MatchedResult<R>]
) => R {
  return function (...matchers) {
    const env: Env = {
      binding: new Map(),
      cache: new EmplaceableWeakMap(),
    };

    const [heads, last] = destLast(matchers);

    for (const matcher of heads) {
      const result = matcher.call(env, matchable);

      if (result.matched) return result.value;
    }

    return last(matchable).value;
  };
}
