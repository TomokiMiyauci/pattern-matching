// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, rest } from "./constants.ts";
import type {
  IdentifierPattern,
  MatchedResult,
  MatchResult,
  Rest,
  UnmatchedResult,
} from "./types.ts";
import { isConstructor, sameValue } from "./ecma.ts";

export function createMatchResult<R>(matched: true, value: R): MatchedResult<R>;
export function createMatchResult(matched: false): UnmatchedResult;
export function createMatchResult<R>(
  matched: boolean,
  value?: R,
): MatchResult<R> {
  return matched ? { matched: true, value: value! } : { matched: false };
}

// deno-lint-ignore ban-types
export function matchConstructorInstance<T extends object>(
  value: T,
  target: unknown,
  intrinsicName?: string,
): MatchResult<T> {
  const ctor = value.constructor;

  if (
    (intrinsicName !== undefined && ctor.name === intrinsicName) ||
    (isConstructor(target) && sameValue(ctor, target))
  ) {
    return createMatchResult(true, value);
  }

  const obj = Object.getPrototypeOf(ctor);

  if (obj === null) return createMatchResult(false);

  return matchConstructorInstance(obj, target, intrinsicName);
}

const SPREAD = "...";

export const _: BindingBuilder = ((name: string) => {
  if (name.startsWith(SPREAD)) {
    const restStr = name.slice(SPREAD.length);
    const value = restStr || undefined;

    return { [rest]: value };
  }

  return { [identifier]: name };
}) as BindingBuilder;

export interface BindingBuilder {
  <const T extends string>(
    name: T,
  ): T extends `...${infer U}` ? U extends "" ? Rest<void> : Rest<U>
    : IdentifierPattern<T>;
  get rest(): typeof rest;
}
