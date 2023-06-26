// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

import { Binding } from "./arm.ts";
import type { Identifier } from "./types.ts";
import { assertType, describe, IsExact, it } from "./_dev_deps.ts";

describe("Binding", () => {
  it("should infer unknown type", () => {
    assertType<IsExact<Binding<unknown, string>, unknown>>(true);
    assertType<IsExact<Binding<unknown, number>, unknown>>(true);
    assertType<IsExact<Binding<unknown, null>, unknown>>(true);
    assertType<IsExact<Binding<unknown, bigint>, unknown>>(true);
    assertType<IsExact<Binding<unknown, boolean>, unknown>>(true);
    assertType<IsExact<Binding<unknown, []>, { [k: string]: unknown }>>(true);
    // deno-lint-ignore ban-types
    assertType<IsExact<Binding<unknown, [undefined, undefined]>, {}>>(
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
    assertType<IsExact<Binding<unknown, { a: Identifier }>, { a: unknown }>>(
      true,
    );
    assertType<
      IsExact<Binding<unknown, { a: Identifier; b: string }>, { a: unknown }>
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, { a: Identifier; b: { b: Identifier } }>,
        { a: unknown; b: unknown }
      >
    >(true);

    assertType<
      IsExact<
        Binding<
          unknown,
          { a: { b: { c: Identifier } } }
        >,
        { c: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          { a: Identifier; b: { a: { a: { a: { a: Identifier } } } } }
        >,
        { a: unknown }
      >
    >(true);
  });

  it("should infer matchable property", () => {
    assertType<
      IsExact<Binding<{ a: string }, { a: Identifier }>, { a: string }>
    >(true);

    assertType<
      IsExact<Binding<{ a: "test" }, { a: Identifier }>, { a: "test" }>
    >(true);

    assertType<
      IsExact<
        Binding<{ a: { b: string } }, { a: { b: Identifier } }>,
        { b: string }
      >
    >(true);

    assertType<
      IsExact<
        Binding<{ a: string }, { a: { b: Identifier } }>,
        { b: unknown }
      >
    >(true);
  });

  it("should intersect inferred type if the binding name is duplicated", () => {
    assertType<
      IsExact<
        Binding<
          { a: string; b: { a: number } },
          { a: Identifier; b: { a: Identifier } }
        >,
        { a: never }
      >
    >(true);
  });

  it("should infer captured array index", () => {
    assertType<IsExact<Binding<unknown, [Identifier<"0">]>, { "0": unknown }>>(
      true,
    );
    assertType<
      IsExact<Binding<unknown, [Identifier<"0">, string]>, { 0: unknown }>
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [Identifier<"0">, undefined, Identifier<"2">]>,
        { 0: unknown; 2: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [Identifier<"0">, [Identifier<"0">]]>,
        { 0: unknown }
      >
    >(
      true,
    );

    assertType<
      IsExact<
        Binding<unknown, [Identifier<"0">, [[[[[Identifier<"0">]]]]]]>,
        { 0: unknown }
      >
    >(
      true,
    );
  });

  it("should infer with complex", () => {
    assertType<IsExact<Binding<unknown, [{ a: Identifier }]>, { a: unknown }>>(
      true,
    );
    assertType<
      IsExact<
        Binding<
          unknown,
          [{ a: Identifier }, Identifier<"1">, string, { a: Identifier }]
        >,
        { a: unknown; 1: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<unknown, [Identifier<"0">, { 0: Identifier }]>,
        { 0: unknown }
      >
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          [
            Identifier<"0">,
            { a: { b: { c: [string, { d: [Identifier<"0">] }] } } },
          ]
        >,
        { 0: unknown }
      >
    >(true);
  });

  it("should infer matchable of array item", () => {
    assertType<IsExact<Binding<[0], [Identifier<"0">]>, { 0: 0 }>>(true);
    assertType<IsExact<Binding<["test"], [Identifier<"0">]>, { 0: "test" }>>(
      true,
    );
    assertType<
      IsExact<
        Binding<[undefined, undefined], [undefined, Identifier<"1">]>,
        { 1: undefined }
      >
    >(true);

    assertType<
      IsExact<Binding<[[["test"]]], [[[Identifier<"0">]]]>, { 0: "test" }>
    >(true);
  });
});
