// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

import { identifier, rest } from "./constants.ts";
import type {
  Identifier,
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

export const $: RenameableIdentifier =
  ((name: string) => ({ [identifier]: name })) as RenameableIdentifier;

export interface RenameableIdentifier {
  <const T extends string>(name: T): Identifier<T>;
  [identifier]: undefined;
}

$[identifier] = undefined;

export interface RenameableRest extends Function {
  <const T extends string>(name: T): Rest<T>;
  [rest]: undefined;
}

export const $$: RenameableRest =
  ((name: string) => ({ [rest]: name })) as RenameableRest;

$$[rest] = undefined;

export type Option<T> = Some<T> | None;

export class Some<T> {
  #value: T;
  private constructor(value: T) {
    this.#value = value;
  }

  static of<T>(value: T): Some<T> {
    return new Some(value);
  }

  get get(): T {
    return this.#value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }
}

export interface None {
  isSome: () => false;
  isNone: () => true;
}

export const None: None = {
  isSome(): false {
    return false;
  },
  isNone(): true {
    return true;
  },
};

export function from<T>(input: unknown, value: T): Option<T> {
  if (input) return Some.of(value);

  return None;
}

export function iter<T>(iterable: Iterable<T>): Iterator<T> {
  return iterable[Symbol.iterator]();
}
