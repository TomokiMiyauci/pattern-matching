// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

// deno-lint-ignore-file ban-types

import { identifier, matcher, rest } from "./constants.ts";
import { insert, isIterable, isObject } from "./deps.ts";
import type {
  ArrayPattern,
  Cache,
  IdentifierPattern,
  Matchable,
  NearLiteralPattern,
  ObjectPattern,
  Pattern,
  PatternItem,
  Rest,
} from "./types.ts";
import { sameValue } from "./ecma.ts";
import { from, iter, None, omit, Option, Some } from "./utils.ts";

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
  cache: Cache<object, IteratorResult<unknown>>,
): Option<KeyValue> {
  const map = insert(cache, matchable, () => new Map());
  const handler = () => matchable.next();
  const record = new RecordMap();

  for (const [i, value] of pattern.entries()) {
    const iterResult = insert(map, i, handler);
    if (iterResult.done) return None;

    // Detect empty item and if empty item, pass it.
    if (!Reflect.has(pattern, i)) continue;

    const result = matchElement(value, iterResult.value, cache);

    if (result.isNone()) return result;

    record.add(result.get);
  }

  const result = insert(map, map.size, handler);

  if (!result.done) return None;

  return Some.of(record.get);
}

export function matchObject<T extends string>(
  pattern: ObjectPattern<T>,
  matchable: Record<T, unknown>,
  cache: Cache,
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
  cache: Cache,
): Option<KeyValue> {
  if (!isObject(pattern)) return matchNearLiteral(pattern, matchable);

  if (isMatcher(pattern)) {
    const result = invokeCustomMatcher(pattern, matchable);

    if (result === notMatched) return None;

    return Some.of({});
  }

  if (isIdentifierPattern(pattern)) return matchIdentifier(pattern, matchable);

  if (pattern instanceof RegExp) return matchNearLiteral(pattern, matchable);

  if (Array.isArray(pattern)) {
    if (!isIterable(matchable)) return None;

    return matchArrayObject(pattern, iter(matchable), cache);
  }

  if (!isObject(matchable)) return None;

  for (const key in pattern) if (!(key in matchable)) return None;

  return matchObject(pattern, matchable as Record<string, unknown>, cache);
}

export function isMatcher(value: {}): value is Matchable {
  return matcher in value &&
    typeof value[matcher] === "function";
}

const notMatched = {};

function invokeCustomMatcher<T, U>(
  val: Matchable<T, U>,
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

export function matchElement(
  pattern: PatternItem | Rest,
  matchable: unknown,
  cache: Cache,
): Option<KeyValue> {
  if (isObject(pattern) && isRest(pattern)) return Some.of({});

  return matchPattern(pattern, matchable, cache);
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
