// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { isObjectType, UnionToIntersection } from "./deps.ts";
import { createMatchResult } from "./utils.ts";
import { matchPattern } from "./pattern.ts";
import type {
  ArrayPattern,
  Cache,
  IdentifierPattern,
  MatchedResult,
  Matcher,
  MatchResult,
  ObjectPattern,
  Pattern,
  Rest,
} from "./types.ts";

export function whether<T, M, R, A extends M = M>(
  predicate: (this: T, matchable: M) => matchable is A,
  callback: (this: T, matchable: A) => R,
): Matcher<T, M, R>;
export function whether<T, M, R>(
  predicate: (this: T, matchable: M) => boolean,
  callback: (this: T, matchable: M) => R,
): Matcher<T, M, R>;
export function whether<T, M, R>(
  predicate: (this: T, matchable: M) => boolean,
  callback: (this: T, matchable: M) => R,
): Matcher<T, M, R> {
  return function (matchable: M) {
    if (predicate.call(this, matchable)) {
      const result = callback.call(this, matchable);

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

export type Binding<T, P extends Pattern> = UnionToIntersection<_Binding<T, P>>;
export type _Binding<T, P extends Pattern> = P extends
  IdentifierPattern<infer U> ? { [k in U]: T }
  : P extends RegExp ? { [k: string]: string }
  : P extends ObjectPattern ?
      | {
        [k in keyof P]: P[k] extends Pattern ? _Binding<Get<T, k>, P[k]>
          : never;
      }[keyof P]
      | (P extends Rest<infer U extends string> ? { [k in U]: Omit<T, keyof P> }
        : never)
  : P extends ArrayPattern ? {
      [k in keyof P]: P[k] extends Pattern ? _Binding<Get<T, k>, P[k]>
        : never;
    }[number]
  : never;

type Get<T, K extends PropertyKey> = T extends Record<K, unknown> ? T[K]
  : unknown;

export function when<T, const P extends Pattern, U>(
  pattern: P,
  callback: (this: T, binding: Binding<T, P>) => U | MatchResult<U>,
): Matcher<Cache, T, U> {
  return function (matchable) {
    const result = matchPattern(pattern, matchable, this);

    if (result.isNone()) return createMatchResult(false);

    const maybeResult = callback.call(matchable, result.get as Binding<T, P>);

    if (isObjectType(maybeResult) && "matched" in maybeResult) {
      return maybeResult;
    }

    return createMatchResult(true, maybeResult);
  };
}
