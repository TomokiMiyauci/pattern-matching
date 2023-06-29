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

// if N is negative, convert it to its positive counterpart by the Arr
type ToPositive<N extends number, Arr extends readonly unknown[]> =
  `${N}` extends `-${infer P extends number}` ? Slice<Arr, P>["length"]
    : N;

// get the initial N items of Arr
type InitialN<
  Arr extends readonly unknown[],
  N extends number,
  _Acc extends readonly unknown[] = [],
> = _Acc["length"] extends N | Arr["length"] ? _Acc
  : InitialN<Arr, N, [..._Acc, Arr[_Acc["length"]]]>;

/**
 * @see https://github.com/type-challenges/type-challenges/issues/22110#issue-1533202988
 */
export type Slice<
  Arr extends readonly unknown[],
  Start extends number = 0,
  End extends number = Arr["length"],
> = InitialN<Arr, ToPositive<End, Arr>> extends
  [...InitialN<Arr, ToPositive<Start, Arr>>, ...infer Rest] ? Rest
  : [];

type ParseInt<T extends string> = T extends `${infer Digit extends number}`
  ? Digit
  : never;
type ReverseString<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${ReverseString<Rest>}${First}`
  : "";
type RemoveLeadingZeros<S extends string> = S extends "0" ? S
  : S extends `${"0"}${infer R}` ? RemoveLeadingZeros<R>
  : S;
type InternalMinusOne<
  S extends string,
> = S extends `${infer Digit extends number}${infer Rest}`
  ? Digit extends 0 ? `9${InternalMinusOne<Rest>}`
  : `${[9, 0, 1, 2, 3, 4, 5, 6, 7, 8][Digit]}${Rest}`
  : never;

/**
 * @see https://github.com/type-challenges/type-challenges/issues/13507#issue-1315903507
 */
export type MinusOne<T extends number> = ParseInt<
  RemoveLeadingZeros<ReverseString<InternalMinusOne<ReverseString<`${T}`>>>>
>;
