# pattern-matching

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/pattern_matching)
[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/pattern_matching?doc)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/TomokiMiyauci/pattern-matching)](https://github.com/TomokiMiyauci/pattern-matching/releases)
[![codecov](https://codecov.io/github/TomokiMiyauci/pattern-matching/branch/main/graph/badge.svg)](https://codecov.io/gh/TomokiMiyauci/pattern-matching)
[![License](https://img.shields.io/github/license/TomokiMiyauci/pattern-matching)](LICENSE)

[![test](https://github.com/TomokiMiyauci/pattern-matching/actions/workflows/test.yaml/badge.svg)](https://github.com/TomokiMiyauci/pattern-matching/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@miyauci/pattern-matching.png?mini=true)](https://nodei.co/npm/@miyauci/pattern-matching/)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Syntax-free pattern matching, feature parity with TC39
[proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching).

This project provides syntax-independent, **type-safe** pattern matching tools.

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Binding](#binding)
- [Documentation](#documentation)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Install

deno.land:

```ts
import * as mod from "https://deno.land/x/pattern_matching/mod.ts";
```

npm:

```bash
npm i @miyauci/pattern-matching
```

## Usage

To start pattern matching, use the `match` function and the arm function.

arm takes the role of
[Clause](https://github.com/tc39/proposal-pattern-matching#clause).

The names of the arm function and the proposal clause are as follows:

| Name      | Proposal name |
| --------- | ------------- |
| when      | when          |
| whether   | if            |
| otherwise | default       |

```ts
import {
  match,
  otherwise,
  when,
} from "https://deno.land/x/pattern_matching/mod.ts";

declare const num: number;

const result = match(num)(
  when(1, () => "one"),
  when(2, () => "two"),
  otherwise(() => "many"),
);
```

### Binding

Binding binds the value of matchable when matched. This allows subsequent
handlers to reference the binding.

```ts
import {
  _,
  match,
  otherwise,
  when,
  whether,
} from "https://deno.land/x/pattern_matching/mod.ts";
import {
  assertType,
  type IsExact,
} from "https://deno.land/std/testing/types.ts";

interface Person {
  name: string;
  age: number;
  hobby?: string;
  greet?: string;
}
declare const person: Person;

const result = match(person)(
  whether(({ name, age }) => !name || !age, () => {
    throw new Error();
  }),
  when(
    { greet: _("introduction") },
    ({ introduction }) => `${introduction}`,
  ),
  when(
    { name: _("name"), hobby: _("hobby") },
    ({ name, hobby }) => `${name} hobby is ${hobby}`,
  ),
  otherwise(() => "profile does not exist"),
);

assertType<IsExact<typeof result, string>>(true);
```

## Documentation

- [Pattern](docs/pattern.md)

## API

See [deno doc](https://deno.land/x/pattern_matching?doc) for all APIs.

## Contributing

See [contributing](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2023 Tomoki Miyauchi
