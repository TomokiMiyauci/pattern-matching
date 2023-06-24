// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { matcher } from "./constants.ts";
import { isObject } from "./deps.ts";
import type { Matchable, Pattern } from "./types.ts";
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

export class ArrayObjectMatchPattern {
  static match(
    pattern: readonly Pattern[],
    matchable: unknown,
  ): boolean {
    if (!Array.isArray(matchable)) return false;

    return pattern.every((value, i) => {
      if (!Reflect.has(matchable, i)) return false;

      return matchPattern(value, Reflect.get(matchable, i));
    });
  }
}

export class ObjectMatchPattern {
  static match(
    pattern: Record<PropertyKey, Pattern>,
    matchable: unknown,
  ): boolean {
    if (!isObject(matchable)) return false;

    return Object.entries(pattern).every(([key, value]) => {
      if (!Reflect.has(matchable, key)) return false;

      return matchPattern(value, Reflect.get(matchable, key));
    });
  }
}

export function matchPattern(
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
        return ArrayObjectMatchPattern.match(pattern, matchable);
      }

      return ObjectMatchPattern.match(pattern, matchable);
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
