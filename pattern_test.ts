// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

import { EmplaceableWeakMap } from "./deps.ts";
import { identifier } from "./constants.ts";
import { iter } from "./utils.ts";
import {
  KeyValue,
  matchArrayObject,
  matchElement,
  matchNearLiteral,
} from "./pattern.ts";
import { assert, assertEquals, describe, it } from "./_dev_deps.ts";
import { Identifier } from "./types.ts";

type Primitive = string | bigint | number | boolean | null | undefined;

describe("matchNearLiteral", () => {
  it("should return Some({}) if the pattern is primitive and matched", () => {
    const table: Primitive[] = [
      "",
      0,
      1n,
      false,
      null,
      undefined,
    ];

    table.forEach((pattern) => {
      const result = matchNearLiteral(pattern, pattern);
      assert(result.isSome());
      assertEquals(result.get, {});
    });
  });

  it("should return Some({}) if the pattern is RegExp and matched with non capture", () => {
    const table: [RegExp, unknown][] = [
      [/a/, "abc"],
      [/\d/, 123],
      [/\[.*\]/, {}],
    ];

    table.forEach(([pattern, matchable]) => {
      const result = matchNearLiteral(pattern, matchable);
      assert(result.isSome());
      assertEquals(result.get, {});
    });
  });

  it("should return Some with groups if the pattern is RegExp and matched with named capture groups", () => {
    const table: [RegExp, unknown, KeyValue][] = [
      [/(?<a>abc)/, "abc", { a: "abc" }],
      [/(a)-(b)/, "a-b", {}],
      [/(?<a>1)(?<b>2)(?<c>3)/, 123, { a: "1", b: "2", c: "3" }],
    ];

    table.forEach(([pattern, matchable, keyValue]) => {
      const option = matchNearLiteral(pattern, matchable);

      assert(option.isSome());
      assertEquals(option.get, keyValue);
    });
  });

  it("should return None", () => {
    const table: [Primitive | RegExp, unknown][] = [
      ["", "a"],
      [0, -0],
      [-0, 0],
      [/a/, "b"],
    ];

    table.forEach(([pattern, matchable]) => {
      assert(matchNearLiteral(pattern, matchable).isNone());
    });
  });
});

describe("matchElement", () => {
  it("should return Some({}) if the pattern is primitive and matched", () => {
    const table: Primitive[] = [
      "",
      0,
      false,
      null,
      undefined,
    ];

    table.forEach((pattern) => {
      const result = matchElement(
        pattern,
        pattern,
        "<key>",
        new EmplaceableWeakMap(),
      );

      assert(result.isSome());
      assertEquals(result.get, {});
    });
  });

  it("should return Some with record if the pattern is identifier", () => {
    const table: [Identifier, unknown, PropertyKey, KeyValue][] = [
      [{ [identifier]: undefined }, "", "abc", { abc: "" }],
      [{ [identifier]: undefined }, {}, 1, { 1: {} }],
      [{ [identifier]: "xxx" }, {}, 1, { xxx: {} }],
    ];

    table.forEach(([pattern, matchable, key, keyValue]) => {
      const result = matchElement(
        pattern,
        matchable,
        key,
        new EmplaceableWeakMap(),
      );

      assert(result.isSome());
      assertEquals(result.get, keyValue);
    });
  });
});

describe("matchArrayObject", () => {
  it("should return Some if the pattern number of count is same as matchable", () => {
    function* gen() {}
    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject([], iterator, cache);

    assert(result.isSome());
    assertEquals(result.get, {});

    assert(cache.has(iterator));
    assertEquals(cache.get(iterator)?.size, 1);
    assertEquals(cache.get(iterator)?.get(0), { done: true, value: undefined });
  });

  it("should return Some and cache has all elements", () => {
    function* gen() {
      yield 0;
      yield 1;
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject([0, 1], iterator, cache);

    assert(result.isSome());
    assertEquals(result.get, {});

    assert(cache.has(iterator));
    assertEquals(cache.get(iterator)?.size, 3);
    assertEquals(cache.get(iterator)?.get(0), { done: false, value: 0 });
    assertEquals(cache.get(iterator)?.get(1), { done: false, value: 1 });
    assertEquals(cache.get(iterator)?.get(2), { done: true, value: undefined });
  });

  it("should return Some with bindings", () => {
    function* gen() {
      yield 0;
      yield "abc";
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject(
      [0, { [identifier]: undefined }],
      iterator,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { 1: "abc" });
  });

  it("should pass empty item", () => {
    function* gen() {
      yield 0;
      yield 1;
      yield 2;
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject(
      [, 1, ,],
      iterator,
      cache,
    );

    assert(result.isSome());
  });

  it("should override binding if the name is same", () => {
    function* gen() {
      yield "a";
      yield "b";
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject(
      [/(?<a>a)/, /(?<a>b)/],
      iterator,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { a: "b" });
  });

  it("should check if the item is undefined", () => {
    function* gen() {
      yield 0;
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject(
      [undefined],
      iterator,
      cache,
    );

    assert(result.isNone());
  });

  it("should return None and cache has all elements if the pattern length greater than yield count", () => {
    function* gen() {
      yield 0;
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject([0, 1], iterator, cache);

    assert(result.isNone());

    assert(cache.has(iterator));
    assertEquals(cache.get(iterator)?.size, 2);
    assertEquals(cache.get(iterator)?.get(0), { done: false, value: 0 });
    assertEquals(cache.get(iterator)?.get(1), { done: true, value: undefined });
  });

  it("should return None and cache has part of elements if the pattern length less than yield count", () => {
    function* gen() {
      yield 0;
      yield 1;
      yield 2;
    }

    const iterator = iter(gen());

    const cache = new EmplaceableWeakMap<object, Map<PropertyKey, unknown>>();
    const result = matchArrayObject([0], iterator, cache);

    assert(result.isNone());

    assert(cache.has(iterator));
    assertEquals(cache.get(iterator)?.size, 2);
    assertEquals(cache.get(iterator)?.get(0), { done: false, value: 0 });
    assertEquals(cache.get(iterator)?.get(1), { done: false, value: 1 });
  });
});
