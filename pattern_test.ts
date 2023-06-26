// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

// deno-lint-ignore-file ban-types no-explicit-any

import { identifier } from "./constants.ts";
import { iter } from "./utils.ts";
import {
  KeyValue,
  matchArrayObject,
  matchElement,
  matchNearLiteral,
  matchObject,
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
        new WeakMap(),
      );

      assert(result.isSome());
      assertEquals(result.get, {});
    });
  });

  it("should return Some with record if the pattern is identifier", () => {
    const table: [Identifier<string>, unknown, KeyValue][] = [
      [{ [identifier]: "abc" }, "", { abc: "" }],
      [{ [identifier]: "1" }, {}, { 1: {} }],
      [{ [identifier]: "xxx" }, {}, { xxx: {} }],
    ];

    table.forEach(([pattern, matchable, keyValue]) => {
      const result = matchElement(
        pattern,
        matchable,
        new WeakMap(),
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
    const result = matchArrayObject(
      [0, { [identifier]: "1" }],
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
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

    const cache = new WeakMap<object, Map<PropertyKey, any>>();
    const result = matchArrayObject([0], iterator, cache);

    assert(result.isNone());

    assert(cache.has(iterator));
    assertEquals(cache.get(iterator)?.size, 2);
    assertEquals(cache.get(iterator)?.get(0), { done: false, value: 0 });
    assertEquals(cache.get(iterator)?.get(1), { done: false, value: 1 });
  });
});

describe("matchObject", () => {
  it("should return Some and cache matchable", () => {
    const matchable = {};
    const cache = new WeakMap();
    const result = matchObject({}, matchable, cache);

    assert(result.isSome());
    assertEquals(result.get, {});
    assert(cache.has(matchable));
  });

  it("should", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 0 };
    const result = matchObject({ a: 0 }, matchable, cache);

    assert(result.isSome());
    assertEquals(result.get, {});

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), 0);
  });

  it("should capture with property key name", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 0 };
    const result = matchObject(
      { a: { [identifier]: undefined } },
      matchable,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { a: 0 });

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), 0);
  });

  it("should capture with named identifier", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 0 };
    const result = matchObject(
      { a: { [identifier]: "b" } },
      matchable,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { b: 0 });

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), 0);
  });

  it("should capture nested property and cache it", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const nest2 = { c: "" };
    const nest = { b: nest2 };
    const matchable = { a: nest };
    const result = matchObject(
      { a: { b: { c: { [identifier]: undefined } } } },
      matchable,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { c: "" });

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), nest);
    assert(cache.has(nest));
    assertEquals(cache.get(nest)?.get("b"), nest2);
    assert(cache.has(nest2));
    assertEquals(cache.get(nest2)?.get("c"), "");
  });

  it("should override bindings", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 0, b: { a: 1 } };
    const result = matchObject(
      { a: { [identifier]: undefined }, b: { a: { [identifier]: undefined } } },
      matchable,
      cache,
    );

    assert(result.isSome());
    assertEquals(result.get, { a: 1 });
  });

  it("should return None if the property does not match", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 1 };
    const result = matchObject({ a: 0 }, matchable, cache);

    assert(result.isNone());

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), 1);
    assertEquals(cache.get(matchable)?.size, 1);
  });

  it("should not cache if matchable does not have property", () => {
    const cache = new WeakMap<object, Map<unknown, unknown>>();
    const matchable = { a: 0 };
    const result = matchObject({ a: 0, b: 1 }, matchable, cache);

    assert(result.isNone());

    assert(cache.has(matchable));
    assertEquals(cache.get(matchable)?.get("a"), 0);
    assertEquals(cache.get(matchable)?.size, 1);
  });
});
