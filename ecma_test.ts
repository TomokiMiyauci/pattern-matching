// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

import { sameValue, sameValueZero } from "./ecma.ts";
import { assert, assertFalse, describe, it } from "./_dev_deps.ts";

describe("sameValue", () => {
  it("should return true", () => {
    const table: [unknown, unknown][] = [
      [NaN, NaN],
      [0, 0],
      [null, null],
      [undefined, undefined],
      ["", ""],
      ["abc", "abc"],
      ["あ亜\x20", "あ亜\x20"],
      [0n, 0n],
      [1n, 1n],
      [0n, -0n],
      [-0n, 0n],
    ];

    table.forEach(([left, right]) => {
      assert(sameValue(left, right));
    });
  });

  it("should return false", () => {
    const table: [unknown, unknown][] = [
      [+0, -0],
      [-0, +0],
      [0, -0],
      [-0, 0],
      [1n, -1n],
    ];

    table.forEach(([left, right]) => {
      assertFalse(sameValue(left, right));
    });
  });
});

describe("sameValueZero", () => {
  it("should return true", () => {
    const table: [unknown, unknown][] = [
      [NaN, NaN],
      [0, 0],
      [null, null],
      [undefined, undefined],
      ["", ""],
      ["abc", "abc"],
      ["あ亜\x20", "あ亜\x20"],
      [0n, 0n],
      [1n, 1n],
      [0n, -0n],
      [-0n, 0n],
      [+0, -0],
      [-0, +0],
      [0, -0],
      [-0, 0],
    ];

    table.forEach(([left, right]) => {
      assert(sameValueZero(left, right));
    });
  });

  it("should return false", () => {
    const table: [unknown, unknown][] = [
      ["", 0],
      ["", "a"],
      [{}, {}],
    ];

    table.forEach(([left, right]) => {
      assertFalse(sameValueZero(left, right));
    });
  });
});
