// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { createMatchResult } from "./utils.ts";
import type { MatchedResult, Matcher } from "./types.ts";

export function whether<T, R, A extends T = T>(
  predicate: (matchable: T) => matchable is A,
  callback: (matchable: A) => R,
): Matcher<T, R>;
export function whether<T, R>(
  predicate: (matchable: T) => boolean,
  callback: (matchable: T) => R,
): Matcher<T, R>;
export function whether<T, R>(
  predicate: (matchable: T) => boolean,
  callback: (matchable: T) => R,
): Matcher<T, R> {
  return (matchable) => {
    if (predicate(matchable)) {
      const result = callback(matchable);

      return createMatchResult(true, result);
    }

    return createMatchResult(false);
  };
}

export function otherwise<T, R>(
  callback: (matchable: T) => R,
): (matchable: T) => MatchedResult<R> {
  return (matchable) => createMatchResult(true, callback(matchable));
}
