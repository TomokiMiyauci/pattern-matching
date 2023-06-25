// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";
import { EmplaceableMap, EmplaceableWeakMap } from "./deps.ts";

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
  (this: Env, matchable: T): MatchResult<R>;
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
  | ObjectPattern
  | ArrayPattern
  | Matchable<T, R>;
// | LazyPattern<T, R>;

export type ArrayPattern = Item[] | [...Item[], Rest];

export type ObjectPattern =
  | { [k: PropertyKey]: Pattern | Identifier }
  | { "...": Rest<string> };

export type Item = Pattern | undefined | Identifier;

export interface LazyPattern<T, R> {
  (matchable: unknown): Pattern<T, R>;
}

export interface Identifier<T extends string | undefined = string | undefined> {
  [identifier]: T;
}

export interface Rest<T extends string | undefined = string | undefined> {
  [rest]: T;
}

export interface Env {
  binding: Map<string | number, unknown>;
  cache: Cache;
}

export type Cache = EmplaceableWeakMap<
  object,
  EmplaceableMap<number, IteratorResult<unknown>>
>;
