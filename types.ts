// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";

export type MatchResult<T> = MatchedResult<T> | UnmatchedResult;

interface CommonMatchResult {
  /** If the match arm matched. */
  matched: boolean;
}

export interface MatchedResult<T = unknown> extends CommonMatchResult {
  matched: true;

  /** The matched value. */
  value: T;
}

export interface UnmatchedResult extends CommonMatchResult {
  matched: false;
}

export interface Matcher<T, M, R> {
  (this: T, matchable: M): MatchResult<R>;
}

export interface CustomMatcher<T = unknown, R = unknown> {
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

export type ArrayPattern =
  | readonly PatternItem[]
  | readonly [...PatternItem[], Rest];

export type ObjectPattern<T extends string = string> =
  | { [k in T]: Pattern }
  | Rest;

export type InterpolationPattern = CustomMatcher;

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
