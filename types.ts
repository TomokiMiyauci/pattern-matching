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

export type Pattern =
  | InterpolationPattern
  | NearLiteralPattern
  | IdentifierPattern
  | ObjectPattern
  | ArrayPattern;

export type NearLiteralPattern =
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
  | RegExp;

export type ArrayPattern = PatternItem[] | [...PatternItem[], Rest];

export type ObjectPattern<T extends string = string> =
  | { [k: T]: Pattern }
  | Rest;

export type InterpolationPattern = Matchable;

export type PatternItem = Pattern | IdentifierPattern<string>;

export interface IdentifierPattern<T extends string = string> {
  [identifier]: T;
}

export interface Rest<T extends string | void = string> {
  [rest]: T;
}

// deno-lint-ignore ban-types no-explicit-any
export type Cache<K extends object = object, V = any> = WeakMap<
  K,
  Map<unknown, V>
>;
