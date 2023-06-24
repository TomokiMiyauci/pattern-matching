// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher } from "./constants.ts";

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
  | (Pattern | undefined | Identifier)[]
  | Matchable<T, R>;
// | LazyPattern<T, R>;

export interface LazyPattern<T, R> {
  (matchable: unknown): Pattern<T, R>;
}

export interface Identifier<T extends string | false = string | false> {
  [identifier]: T;
}
