// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";
import {
  EmplaceableMap,
  filterKeys,
  isIterable,
  isObject as _isObject,
} from "./deps.ts";
import type {
  ArrayPattern,
  Env,
  Identifier,
  Matchable,
  ObjectPattern,
  Pattern,
  PatternItem,
  Rest,
} from "./types.ts";
import { sameValue } from "./ecma.ts";

export function matchNearLiteral(
  this: Env,
  pattern: string | bigint | number | boolean | null | undefined | RegExp,
  matchable: unknown,
): boolean {
  if (pattern instanceof RegExp) {
    const result = pattern.exec(String(matchable));

    if (!result) return false;
    if (!result.groups) return true;

    for (const [name, value] of Object.entries(result.groups)) {
      this.binding.set(name, value);
    }

    return true;
  } else {
    return sameValue(matchable, pattern);
  }
}

export class ArrayObjectMatchPattern {
  static match(
    this: Env,
    pattern: ArrayPattern,
    matchable: unknown,
  ): boolean {
    if (!isIterable(matchable)) return false;

    const iterator = matchable[Symbol.iterator]();
    const map = this.cache.emplace(iterator, {
      insert: () => new EmplaceableMap(),
    });
    const handler = { insert: () => iterator.next() };

    for (const [i, value] of pattern.entries()) {
      const result = map.emplace(i, handler);

      if (result.done) return false;

      if (!matchElement.call(this, value, result.value, i)) {
        return false;
      }
    }

    const result = map.emplace(map.size, handler);

    if (!result.done) return false;

    return true;
  }
}

export class ObjectMatchPattern {
  static match(
    this: Env,
    pattern: ObjectPattern,
    matchable: unknown,
  ): boolean {
    if (!isObject(matchable)) return false;

    const { "...": $$, ...restPattern } = pattern;

    const hasRest = isObject($$) && isRest($$);

    pattern = hasRest ? restPattern : pattern;

    const result = Object.entries(pattern).every(([key, value]) => {
      if (!Reflect.has(matchable, key)) return false;

      const actValue = Reflect.get(matchable, key);

      if (isObject(value) && isIdentifier(value)) {
        key = value[identifier] ?? key;
        this.binding.set(key, actValue);
        return true;
      }

      return matchPattern.call(this, value, actValue);
    });

    if (!result || !hasRest) return result;

    const name = $$[rest];
    const keys = Object.keys(pattern);
    const obj = filterKeys({ ...matchable }, (key) => !keys.includes(key));
    this.binding.set(name, obj);

    return true;
  }
}

export function matchPattern(
  this: Env,
  pattern: Pattern,
  matchable: unknown,
): boolean {
  if (pattern === null) {
    return matchNearLiteral.call(this, pattern, matchable);
  }

  switch (typeof pattern) {
    case "object": {
      if (isMatcher(pattern)) {
        const result = invokeCustomMatcher(pattern, matchable);

        if (result === notMatched) return false;

        return true;
      }

      if (pattern instanceof RegExp) {
        return matchNearLiteral.call(this, pattern, matchable);
      }

      if (Array.isArray(pattern)) {
        return ArrayObjectMatchPattern.match.call(this, pattern, matchable);
      }

      return ObjectMatchPattern.match.call(this, pattern, matchable);
    }

    default: {
      return matchNearLiteral.call(this, pattern, matchable);
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

// deno-lint-ignore ban-types
export function isObject(input: unknown): input is object {
  return _isObject(input) || typeof input === "function";
}

function matchElement(
  this: Env,
  item: PatternItem | Rest,
  matchable: unknown,
  i: number,
): boolean {
  if (isObject(item)) {
    if (isIdentifier(item)) {
      const key = item[identifier] ?? i;
      this.binding.set(key, matchable);

      return true;
    } else if (isRest(item)) {
      return true;
    }
  }

  return matchPattern.call(this, item, matchable);
}
