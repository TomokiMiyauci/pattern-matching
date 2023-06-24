// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, matcher, rest } from "./constants.ts";
import { destLast, filterKeys, isObject as _isObject } from "./deps.ts";
import type {
  ArrayPattern,
  Identifier,
  Item,
  Matchable,
  Pattern,
  Rest,
} from "./types.ts";
import { sameValue } from "./ecma.ts";

export class NearLiteralMatchPattern {
  static match(
    pattern: string | bigint | number | boolean | null | RegExp,
    matchable: unknown,
  ): boolean {
    if (pattern instanceof RegExp) {
      return pattern.test(String(matchable));
    } else {
      return sameValue(matchable, pattern);
    }
  }
}

interface Env {
  binding: Map<string | number, unknown>;
}

export class ArrayObjectMatchPattern {
  static match(
    this: Env,
    pattern: ArrayPattern,
    matchable: unknown,
  ): boolean {
    if (!Array.isArray(matchable)) return false;

    const [heads, last] = destLast(pattern);
    const is = isObject(last) && isRest(last);
    const items = (is ? heads : pattern) as Item[];

    const result = items.every((value, i) => {
      if (!Reflect.has(matchable, i)) return false;

      if (value === undefined) return true;

      const v = Reflect.get(matchable, i);

      if (isObject(value) && isIdentifier(value)) {
        this.binding.set(i, v);
        return true;
      }

      return matchPattern.call(this, value, v);
    });

    if (!result) return false;
    if (!is) return true;

    const keys = [...heads.keys()].map(String);
    const obj = filterKeys(
      matchable as Record<number, unknown>,
      (key) => !keys.includes(key),
    );

    this.binding.set(heads.length, obj);

    return true;
  }
}

export class ObjectMatchPattern {
  static match(
    this: Env,
    pattern: Record<PropertyKey, Pattern | Identifier>,
    matchable: unknown,
  ): boolean {
    if (!isObject(matchable)) return false;

    return Object.entries(pattern).every(([key, value]) => {
      if (!Reflect.has(matchable, key)) return false;

      const v = Reflect.get(matchable, key);

      if (isObject(value) && isIdentifier(value)) {
        this.binding.set(key, v);
        return true;
      }

      return matchPattern.call(this, value, Reflect.get(matchable, key));
    });
  }
}

export function matchPattern(
  this: Env,
  pattern: Pattern,
  matchable: unknown,
): boolean {
  if (pattern === null) {
    return NearLiteralMatchPattern.match(pattern, matchable);
  }

  switch (typeof pattern) {
    case "object": {
      if (isMatcher(pattern)) {
        const result = invokeCustomMatcher(pattern, matchable);

        if (result === notMatched) return false;

        return true;
      }

      if (pattern instanceof RegExp) {
        return NearLiteralMatchPattern.match(pattern, matchable);
      }

      if (Array.isArray(pattern)) {
        return ArrayObjectMatchPattern.match.call(this, pattern, matchable);
      }

      return ObjectMatchPattern.match.call(this, pattern, matchable);
    }

    default: {
      return NearLiteralMatchPattern.match(pattern, matchable);
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
function isIdentifier(object: object): object is Identifier {
  return identifier in object;
}

// deno-lint-ignore ban-types
function isRest(object: object): object is Rest {
  return rest in object;
}

// deno-lint-ignore ban-types
function isObject(input: unknown): input is object {
  return _isObject(input) || typeof input === "function";
}
