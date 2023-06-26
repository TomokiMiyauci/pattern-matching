// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";

export type MatchResult<T> = MatchedResult<T> | UnmatchedResult;

export interface MatchedResult<T = unknown> {
  /** If the match clause matched. */
  matched: true;

  /** The matched value. */
  value: T;
}

export interface UnmatchedResult {
  matched: false;
}

export interface Matcher<T, R> {
  (this: Cache, matchable: T): MatchResult<R>;
}

export interface Matchable<T = unknown, R = unknown> {
  [matcher]: (value: T) => MatchResult<R>;
}

export type Pattern<T = unknown, R = unknown> =
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
  | RegExp
  | ObjectPattern
  | ArrayPattern
  | Matchable<T, R>;
// | LazyPattern<T, R>;

export type ArrayPattern = PatternItem[] | [...PatternItem[], Rest];

export type ObjectPattern = { [k: PropertyKey]: Pattern | Identifier };

export type PatternItem = Pattern | Identifier;

export interface LazyPattern<T, R> {
  (matchable: unknown): Pattern<T, R>;
}

export interface Identifier<T extends string | undefined = string | undefined> {
  [identifier]: T;
}

export interface Rest<T extends string | undefined = string | undefined> {
  [rest]: T;
}

// deno-lint-ignore ban-types no-explicit-any
export type Cache<K extends object = object, V = any> = WeakMap<
  K,
  Map<unknown, V>
>;
