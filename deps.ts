// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

// TODO(miyauci): This module should externalize

import { isObject as isObjectType } from "https://deno.land/x/isx@1.4.0/is_object.ts";
import { isFunction } from "https://deno.land/x/isx@1.4.0/is_function.ts";
export { isRegExp } from "https://deno.land/x/isx@1.4.0/is_reg_exp.ts";
import { isIterable } from "https://deno.land/x/isx@1.4.0/is_iterable.ts";
export { isString } from "https://deno.land/x/isx@1.4.0/is_string.ts";
export { isArray } from "https://deno.land/x/isx@1.4.0/is_array.ts";
export { insert } from "https://deno.land/x/upsert@1.2.0/mod.ts";
export { iter } from "https://esm.sh/itertools@2.1.1?pin=v126";

export { isIterable, isObjectType };
export function destLast<T, U>(input: readonly [...readonly T[], U]): [T[], U];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined] {
  const array = [...input];
  const last = array.pop();

  return [array, last];
}

// deno-lint-ignore ban-types
export function isObject(input: unknown): input is object {
  return isObjectType(input) || isFunction(input);
}

export type UnionToIntersection<U> =
  // deno-lint-ignore no-explicit-any
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I
    : never;

export function last<T>(
  indexable: { length: number; [k: number]: T },
): T | undefined {
  return indexable[indexable.length - 1];
}

export function head<T>(array: readonly T[]): T[] {
  return array.slice(0, -1);
}

export type Option<T> = Some<T> | None;

export class Some<T> {
  #value: T;
  private constructor(value: T) {
    this.#value = value;
  }

  static of<T>(value: T): Some<T> {
    return new Some(value);
  }

  get get(): T {
    return this.#value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }
}

export interface None {
  isSome: () => false;
  isNone: () => true;
}

export const None: None = {
  isSome(): false {
    return false;
  },
  isNone(): true {
    return true;
  },
};

export function from<T>(input: unknown, value: T): Option<T> {
  if (input) return Some.of(value);

  return None;
}

export function omit<T, K extends string>(
  obj: T,
  keys: Iterable<K>,
): Omit<T, K> {
  const set = new Set<unknown>(keys);
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (!set.has(key)) {
      newObj[key] = obj[key];
    }
  }

  return newObj as Omit<T, K>;
}

export function fromIter<T>(
  iterator: Iterator<T>,
): IterableIterator<T> | Iterable<T> {
  if (isIterable<T>(iterator)) return iterator;

  const iterable: Iterable<T> = {
    [Symbol.iterator]() {
      return iterator;
    },
  };

  return iterable;
}
