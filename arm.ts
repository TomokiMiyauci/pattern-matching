// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { createMatchResult } from "./utils.ts";
import { matchPattern } from "./pattern.ts";
import type {
  Identifier,
  MatchedResult,
  Matcher,
  Pattern,
  Rest,
} from "./types.ts";

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

export function when<const T, R, U, const This = void>(
  pattern: Pattern<unknown, R> & This,
  callback: (
    this: T,
    matched: {
      [
        k in keyof This as This[k] extends Identifier | Rest
          ? This[k] extends
            Identifier<infer X extends string> | Rest<infer X extends string>
            ? X
          : k
          : never
      ]: This[k] extends Rest ? Omit<T, Exclude<keyof This, k>>
        : T extends Record<k, infer X> ? X
        : unknown;
    },
  ) => U,
): Matcher<T, U> {
  return function (matchable) {
    if (matchPattern.call(this, pattern, matchable)) {
      return createMatchResult(
        true,
        callback.call(matchable, Object.fromEntries(this.binding) as any),
      );
    }

    return createMatchResult(false);
  };
}
