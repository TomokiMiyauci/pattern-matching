// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

export function destLast<T, U>(input: readonly [...readonly T[], U]): [T[], U];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined];
export function destLast<T>(input: Iterable<T>): [T[], T | undefined] {
  const array = [...input];
  const last = array.pop();

  return [array, last];
}
