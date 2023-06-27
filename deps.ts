// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { isObject as isObjectType } from "https://deno.land/x/isx@1.4.0/is_object.ts";

import { isFunction } from "https://deno.land/x/isx@1.4.0/is_function.ts";
export { isRegExp } from "https://deno.land/x/isx@1.4.0/is_reg_exp.ts";
export { isIterable } from "https://deno.land/x/isx@1.4.0/is_iterable.ts";
export { insert } from "https://deno.land/x/upsert@1.2.0/mod.ts";

export { isObjectType };
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
