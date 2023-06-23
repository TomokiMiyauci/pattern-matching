// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

export type MatchResult<T> = MatchedResult<T> | UnmatchedResult;

export interface MatchedResult<T = unknown> {
  matched: true;
  value: T;
}

export interface UnmatchedResult {
  matched: false;
}

export interface Matcher<T, R> {
  (matchable: T): MatchResult<R>;
}

export interface Matchable<T, R> {
  [Symbol.matcher]: (value: T) => MatchResult<R>;
}
