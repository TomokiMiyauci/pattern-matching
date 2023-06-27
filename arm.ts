// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { UnionToIntersection } from "./deps.ts";
import { createMatchResult } from "./utils.ts";
import { matchPattern } from "./pattern.ts";
import type {
  ArrayPattern,
  IdentifierPattern,
  MatchedResult,
  Matcher,
  ObjectPattern,
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
