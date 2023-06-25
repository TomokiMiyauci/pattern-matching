// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

export { isObject } from "https://deno.land/x/isx@1.4.0/is_object.ts";
export { isIterable } from "https://deno.land/x/isx@1.4.0/is_iterable.ts";
export { filterKeys } from "https://deno.land/std@0.192.0/collections/filter_keys.ts";
export {
  EmplaceableMap,
  EmplaceableWeakMap,
} from "https://deno.land/x/upsert@1.2.0/mod.ts";

export function destLast<T, U>(input: readonly [...readonly T[], U]): [T[], U];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined] {
  const array = [...input];
  const last = array.pop();

  return [array, last];
}
