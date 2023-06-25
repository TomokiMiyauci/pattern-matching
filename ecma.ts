// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

export function isConstructor(func: unknown) {
  return typeof func === "function" && !!func.prototype &&
    func.prototype.constructor === func;
}

export const sameValue = Object.is;

export function sameValueZero(x: unknown, y: unknown): boolean {
  // deno-lint-ignore no-compare-neg-zero
  if ((x === +0 && y === -0) || x === -0 && y === +0) return true;

  return Object.is(x, y);
}
