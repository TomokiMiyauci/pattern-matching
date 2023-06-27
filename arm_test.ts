// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

import { Binding } from "./arm.ts";
import type { IdentifierPattern } from "./types.ts";
import { assertType, describe, IsExact, it } from "./_dev_deps.ts";

describe("Binding", () => {
  it("should infer unknown type", () => {
    assertType<IsExact<Binding<unknown, string>, unknown>>(true);
    assertType<IsExact<Binding<unknown, number>, unknown>>(true);
    assertType<IsExact<Binding<unknown, null>, unknown>>(true);
    assertType<IsExact<Binding<unknown, bigint>, unknown>>(true);
    assertType<IsExact<Binding<unknown, boolean>, unknown>>(true);
    assertType<IsExact<Binding<unknown, []>, unknown>>(true);
    assertType<IsExact<Binding<unknown, [undefined, undefined]>, unknown>>(
      true,
    );
    // deno-lint-ignore ban-types
    assertType<IsExact<Binding<unknown, {}>, unknown>>(true);
  });

  it("should infer regex capture group", () => {
    assertType<IsExact<Binding<unknown, RegExp>, { [k: string]: string }>>(
      true,
    );
  });

  it("should infer captured index", () => {
    assertType<
      IsExact<
        Binding<unknown, { a: IdentifierPattern }>,
        { [k: string]: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, { a: IdentifierPattern<"a">; b: string }>,
        { a: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<
          unknown,
          { a: IdentifierPattern<"a">; b: { b: IdentifierPattern<"b"> } }
        >,
        { a: unknown; b: unknown }
      >
    >(true);

    assertType<
      IsExact<
        Binding<
          unknown,
          { a: { b: { c: IdentifierPattern<"c"> } } }
        >,
        { c: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          {
            a: IdentifierPattern;
            b: { a: { a: { a: { a: IdentifierPattern<"a"> } } } };
          }
        >,
        { a: unknown }
      >
    >(true);
  });

  it("should infer matchable property", () => {
    assertType<
      IsExact<
        Binding<{ a: string }, { a: IdentifierPattern<"a"> }>,
        { a: string }
      >
    >(true);

    assertType<
      IsExact<
        Binding<{ a: "test" }, { a: IdentifierPattern<"a"> }>,
        { a: "test" }
      >
    >(true);

    assertType<
      IsExact<
        Binding<{ a: { b: string } }, { a: { b: IdentifierPattern<"b"> } }>,
        { b: string }
      >
    >(true);

    assertType<
      IsExact<
        Binding<{ a: string }, { a: { b: IdentifierPattern<"b"> } }>,
        { b: unknown }
      >
    >(true);
  });

  it("should intersect inferred type if the binding name is duplicated", () => {
    assertType<
      IsExact<
        Binding<
          { a: string; b: { a: number } },
          { a: IdentifierPattern<"a">; b: { a: IdentifierPattern<"a"> } }
        >,
        { a: never }
      >
    >(true);
  });

  it("should infer captured array index", () => {
    assertType<
      IsExact<Binding<unknown, [IdentifierPattern<"0">]>, { "0": unknown }>
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [IdentifierPattern<"0">, string]>,
        { 0: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<
          unknown,
          [IdentifierPattern<"0">, undefined, IdentifierPattern<"2">]
        >,
        { 0: unknown; 2: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [IdentifierPattern<"0">, [IdentifierPattern<"0">]]>,
        { 0: unknown }
      >
    >(
      true,
    );

    assertType<
      IsExact<
        Binding<
          unknown,
          [IdentifierPattern<"0">, [[[[[IdentifierPattern<"0">]]]]]]
        >,
        { 0: unknown }
      >
    >(
      true,
    );
  });

  it("should infer with complex", () => {
    assertType<
      IsExact<Binding<unknown, [{ a: IdentifierPattern<"a"> }]>, { a: unknown }>
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          [
            { a: IdentifierPattern<"a"> },
            IdentifierPattern<"1">,
            string,
            { a: IdentifierPattern<"a"> },
          ]
        >,
        { a: unknown; 1: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          [IdentifierPattern<"0">, { 0: IdentifierPattern<"0"> }]
        >,
        { 0: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          [
            IdentifierPattern<"0">,
            { a: { b: { c: [string, { d: [IdentifierPattern<"0">] }] } } },
          ]
        >,
        { 0: unknown }
      >
    >(true);
  });

  it("should infer matchable of array item", () => {
    assertType<IsExact<Binding<[0], [IdentifierPattern<"0">]>, { 0: 0 }>>(true);
    assertType<
      IsExact<Binding<["test"], [IdentifierPattern<"0">]>, { 0: "test" }>
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<[undefined, undefined], [undefined, IdentifierPattern<"1">]>,
        { 1: undefined }
      >
    >(true);

    assertType<
      IsExact<
        Binding<[[["test"]]], [[[IdentifierPattern<"0">]]]>,
        { 0: "test" }
      >
    >(true);
  });
});
