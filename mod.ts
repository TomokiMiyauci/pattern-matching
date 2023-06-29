// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

/** Syntax-free pattern matching, feature parity with TC39
 * [proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching).
 *
 * @module
 */

export { match } from "./match.ts";
export { otherwise, when, whether } from "./arm.ts";
export { identifier, matcher, rest } from "./constants.ts";
export { _ } from "./utils.ts";
export {
  CacheGroup,
  type MatchedResult,
  type Matcher,
  type MatchResult,
  type Pattern,
  type UnmatchedResult,
} from "./types.ts";
