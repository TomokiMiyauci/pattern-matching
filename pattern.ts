// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

// deno-lint-ignore-file ban-types

import { identifier, matcher, rest } from "./constants.ts";
import {
  head,
  insert,
  isArray,
  isIterable,
  isObject,
  isString,
  iter,
  last,
} from "./deps.ts";
import type {
  ArrayPattern,
  CacheGroup,
  CustomMatcher,
  IdentifierPattern,
  NearLiteralPattern,
  ObjectPattern,
  Pattern,
  Rest,
} from "./types.ts";
import { sameValue } from "./ecma.ts";
import { from, fromIter, None, omit, Option, Some } from "./utils.ts";

export type KeyValue = Record<string, unknown>;

export function matchNearLiteral(
  pattern: NearLiteralPattern,
  matchable: unknown,
): Option<Record<string, string>> {
  if (pattern instanceof RegExp) {
    const result = pattern.exec(String(matchable));

    if (!result) return None;

    const groups = result.groups ? { ...result.groups } : {};

    return Some.of(groups);
  }

  return from(sameValue(matchable, pattern), {});
}

export function matchIdentifier<T extends string, U>(
  pattern: IdentifierPattern<T>,
  matchable: U,
): Some<{ [k in T]: U }> {
  const name = pattern[identifier];
  const bindings = { [name]: matchable } as { [k in T]: U };

  return Some.of(bindings);
}

export function matchArrayObject(
  pattern: ArrayPattern,
  matchable: Iterator<unknown>,
  cache: CacheGroup<object, Map<unknown, IteratorResult<unknown>>>,
): Option<KeyValue> {
  const map = insert(cache, matchable, (iterator, cache) => {
    cache.iterators.add(iterator);

    return new Map();
  });
  const handler = () => matchable.next();
  const record = new RecordMap();
  const lastEl = last(pattern);
  const hasRest = isObject(lastEl) && isRest(lastEl);
  const patternWithoutRest =
    (hasRest ? head(pattern) : pattern) as readonly Pattern[];

  for (const [i, value] of patternWithoutRest.entries()) {
    const iterResult = insert(map, i, handler);

    if (iterResult.done) return None;

    // Detect empty item and if empty item, pass it.
    if (!Reflect.has(pattern, i)) continue;

    const result = matchPattern(value, iterResult.value, cache);

    if (result.isNone()) return result;

    record.add(result.get);
  }

  if (!hasRest) {
    const result = insert(map, patternWithoutRest.length, handler);

    // Not match a length of pattern items and yielding count from matchable.
    if (!result.done) return None;

    return Some.of(record.get);
  }

  const maybeName = getRestName(lastEl);

  if (maybeName.isSome()) {
    const rest = [...fromIter(matchable)];

    record.set(maybeName.get, rest);
  }

  return Some.of(record.get);
}

export function matchObject<T extends string>(
  pattern: ObjectPattern<T>,
  matchable: Record<T, unknown>,
  cache: CacheGroup,
): Option<KeyValue> {
  const map = insert(cache, matchable, () => new Map());
  const record = new RecordMap();

  for (const [key, value] of Object.entries(pattern)) {
    const actValue = insert(
      map,
      key,
      (key) => Reflect.get(matchable, key) as unknown,
    );

    const result = matchPattern(value, actValue, cache);

    if (result.isNone()) return None;

    record.add(result.get);
  }

  const hasRest = hasRestPattern(pattern);

  if (!hasRest) return Some.of(record.get);

  const restRecord = omit(matchable, Object.keys(pattern));
  const name = pattern[rest];

  record.set(name, restRecord);

  return Some.of(record.get);
}

export function hasRestPattern(
  pattern: ObjectPattern,
): pattern is {
  [k: string]: Pattern | IdentifierPattern;
} & { [rest]: string } {
  return rest in pattern;
}

export function matchPattern(
  pattern: Pattern,
  matchable: unknown,
  cache: CacheGroup,
): Option<KeyValue> {
  if (!isObject(pattern)) return matchNearLiteral(pattern, matchable);

  if (isMatcher(pattern)) {
    const result = invokeCustomMatcher(pattern, matchable);

    if (result === notMatched) return None;

    return Some.of({});
  }

  if (isIdentifierPattern(pattern)) return matchIdentifier(pattern, matchable);

  if (pattern instanceof RegExp) return matchNearLiteral(pattern, matchable);

  if (isArray(pattern)) {
    if (!isIterable(matchable)) return None;

    return matchArrayObject(pattern, iter(matchable), cache);
  }

  if (!isObject(matchable)) return None;

  for (const key in pattern) if (!(key in matchable)) return None;

  return matchObject(pattern, matchable as Record<string, unknown>, cache);
}

export function isMatcher(value: {}): value is CustomMatcher {
  return matcher in value &&
    typeof value[matcher] === "function";
}

const notMatched = {};

function invokeCustomMatcher<T, U>(
  val: CustomMatcher<T, U>,
  matchable: T,
): U | typeof notMatched {
  const result = val[matcher](matchable);

  if (!result.matched) return notMatched;

  return result.value;
}

export function isIdentifierPattern(
  pattern:
    | IdentifierPattern
    | RegExp
    | ObjectPattern
    | ArrayPattern,
): pattern is IdentifierPattern {
  return !!pattern && identifier in pattern;
}

export function isRest(object: object): object is Rest {
  return rest in object;
}

class RecordMap<K extends string, V> {
  #value: Record<K, V>;
  constructor(record?: Record<K, V>) {
    this.#value = record ?? {} as Record<K, V>;
  }

  add(record: Record<K, V>): this {
    for (const [key, value] of Object.entries(record)) {
      this.#value[key as K] = value as V;
    }

    return this;
  }

  set(key: K, value: V): this {
    this.#value[key] = value;

    return this;
  }

  get get(): Record<K, V> {
    return this.#value;
  }
}

function getRestName<T extends string>(restPattern: Rest<T | void>): Option<T> {
  const name = restPattern[rest];

  if (isString(name)) return Some.of(name);

  return None;
}
