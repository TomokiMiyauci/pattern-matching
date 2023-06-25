// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.

import { Binding } from "./arm.ts";
import type { Identifier } from "./types.ts";
import { assertType, describe, IsExact, it } from "./_dev_deps.ts";

describe("Binding", () => {
  it("should infer never type", () => {
    assertType<IsExact<Binding<unknown, string>, never>>(true);
    assertType<IsExact<Binding<unknown, number>, never>>(true);
    assertType<IsExact<Binding<unknown, null>, never>>(true);
    assertType<IsExact<Binding<unknown, bigint>, never>>(true);
    assertType<IsExact<Binding<unknown, boolean>, never>>(true);
    assertType<IsExact<Binding<unknown, []>, never>>(true);
    assertType<IsExact<Binding<unknown, [undefined, undefined]>, never>>(true);
    // deno-lint-ignore ban-types
    assertType<IsExact<Binding<unknown, {}>, never>>(true);
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

  it("should infer captured array index", () => {
    assertType<IsExact<Binding<unknown, [Identifier]>, { 0: unknown }>>(true);
    assertType<IsExact<Binding<unknown, [Identifier, string]>, { 0: unknown }>>(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [Identifier, undefined, Identifier]>,
        { 0: unknown; 2: unknown }
      >
    >(
      true,
    );
    assertType<
      IsExact<
        Binding<unknown, [Identifier, [Identifier]]>,
        { 0: unknown }
      >
    >(
      true,
    );

    assertType<
      IsExact<
        Binding<unknown, [Identifier, [[[[[Identifier]]]]]]>,
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
          [{ a: Identifier }, Identifier, string, { a: Identifier }]
        >,
        { a: unknown; 1: unknown }
      >
    >(true);
    assertType<
      IsExact<Binding<unknown, [Identifier, { 0: Identifier }]>, { 0: unknown }>
    >(true);
    assertType<
      IsExact<
        Binding<
          unknown,
          [Identifier, { a: { b: { c: [string, { d: [Identifier] }] } } }]
        >,
        { 0: unknown }
      >
    >(true);
  });
});
