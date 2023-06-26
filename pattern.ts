// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";
import { EmplaceableMap, filterKeys, isIterable, isObject } from "./deps.ts";
import type {
  ArrayPattern,
  Cache,
  Identifier,
  Matchable,
  ObjectPattern,
  Pattern,
  PatternItem,
  Rest,
} from "./types.ts";
import { sameValue } from "./ecma.ts";
import { from, iter, None, Option, Some } from "./utils.ts";

export type KeyValue = Record<string, unknown>;

export function matchNearLiteral(
  pattern: string | bigint | number | boolean | null | undefined | RegExp,
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

export function matchArrayObject(
  pattern: ArrayPattern,
  matchable: Iterator<unknown>,
  cache: Cache,
): Option<KeyValue> {
  const map = cache.emplace(matchable, {
    insert: () => new EmplaceableMap(),
  });
  const handler = { insert: () => matchable.next() };
  const record = new RecordMap();

  for (const [i, value] of pattern.entries()) {
    const iterResult = map.emplace(i, handler);

    if (iterResult.done) return None;

    // Detect empty item and if empty item, pass it.
    if (!Reflect.has(pattern, i)) continue;

    const result = matchElement(value, iterResult.value, i, cache);

    if (result.isNone()) return result;

    record.add(result.get);
  }

  const result = map.emplace(map.size, handler);

  if (!result.done) return None;

  return Some.of(record.get);
}

export class ObjectMatchPattern {
  static match(
    pattern: ObjectPattern,
    matchable: unknown,
    cache: Cache,
  ): Option<KeyValue> {
    if (!isObject(matchable)) return None;

    const { "...": $$, ...restPattern } = pattern;

    const hasRest = isObject($$) && isRest($$);

    pattern = hasRest ? restPattern : pattern;

    let x: KeyValue = {};

    for (const [key, value] of Object.entries(pattern)) {
      if (!Reflect.has(matchable, key)) return None;

      const actValue = Reflect.get(matchable, key);

      if (isObject(value) && isIdentifier(value)) {
        const k = value[identifier] ?? key;

        x[k] = actValue;
        continue;
      }

      const result = matchPattern(value, actValue, cache);

      if (result.isNone()) return None;

      x = { ...x, ...result.get };
    }

    if (!hasRest) return Some.of(x);

    const name = $$[rest];
    const keys = Object.keys(pattern);
    const obj = filterKeys({ ...matchable }, (key) => !keys.includes(key));

    return Some.of({ ...x, [name]: obj });
  }
}

export function matchPattern(
  pattern: Pattern,
  matchable: unknown,
  cache: Cache,
): Option<KeyValue> {
  if (pattern === null) {
    return matchNearLiteral(pattern, matchable);
  }

  switch (typeof pattern) {
    case "object": {
      if (isMatcher(pattern)) {
        const result = invokeCustomMatcher(pattern, matchable);

        if (result === notMatched) return None;

        return Some.of({});
      }

      if (pattern instanceof RegExp) {
        return matchNearLiteral(pattern, matchable);
      }

      if (Array.isArray(pattern)) {
        if (!isIterable(matchable)) return None;

        return matchArrayObject(pattern, iter(matchable), cache);
      }

      return ObjectMatchPattern.match(pattern, matchable, cache);
    }

    default: {
      return matchNearLiteral(pattern, matchable);
    }
  }
}

// deno-lint-ignore ban-types
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

// deno-lint-ignore ban-types
export function isIdentifier(object: object): object is Identifier {
  return identifier in object;
}

// deno-lint-ignore ban-types
export function isRest(object: object): object is Rest {
  return rest in object;
}

export function matchElement(
  pattern: PatternItem | Rest,
  matchable: unknown,
  key: PropertyKey,
  cache: Cache,
): Option<KeyValue> {
  if (isObject(pattern)) {
    if (isIdentifier(pattern)) {
      const k = pattern[identifier] ?? key;

      return Some.of({ [k]: matchable });
    } else if (isRest(pattern)) {
      return Some.of({});
    }
  }

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

  get get(): Record<K, V> {
    return this.#value;
  }
}
