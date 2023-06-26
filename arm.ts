// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { UnionToIntersection } from "./deps.ts";
import { createMatchResult } from "./utils.ts";
import { matchPattern } from "./pattern.ts";
import type {
  ArrayPattern,
  Identifier,
  MatchedResult,
  Matcher,
  ObjectPattern,
  Pattern,
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

export type Binding<T, P extends Pattern> = unknown extends
  UnionToIntersection<_Binding<T, P>> ? never
  : UnionToIntersection<_Binding<T, P>>;

export type _Binding<T, P extends Pattern> = P extends string ? never
  : P extends RegExp ? Record<string, string>
  : P extends ObjectPattern ? {
      [k in keyof P]: P[k] extends Identifier ? { [ka in k]: unknown }
        : P[k] extends infer X extends Pattern ? _Binding<T, X>
        : never;
    }[keyof P]
  : P extends ArrayPattern ? {
      [k in keyof P]: P[k] extends Identifier ? { [ka in k]: unknown }
        : P[k] extends infer X extends Pattern ? _Binding<T, X>
        : never;
    }[number]
  : never;

export function when<T, P extends Pattern<unknown, unknown>, U>(
  pattern: P,
  callback: (this: T, binding: Binding<T, P>) => U,
): Matcher<T, U> {
  return function (matchable) {
    const result = matchPattern(pattern, matchable, this);

    if (result.isNone()) return createMatchResult(false);

    return createMatchResult(
      true,
      callback.call(matchable, result.get as Binding<T, P>),
    );
  };
}
