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
  (matchable: T): MatchResult<R>;
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
  | RegExp
  | { [k: PropertyKey]: Pattern | Identifier }
  | ArrayPattern
  | Matchable<T, R>;
// | LazyPattern<T, R>;

export type ArrayPattern = Item[] | [...Item[], Rest];

export type Item = Pattern | undefined | Identifier;

export interface LazyPattern<T, R> {
  (matchable: unknown): Pattern<T, R>;
}

export interface Identifier<T extends string | false = string | false> {
  [identifier]: T;
}

export interface Rest {
  [rest]: "";
}
