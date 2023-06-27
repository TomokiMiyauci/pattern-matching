# pattern-matching

Syntax-free pattern matching, feature parity with TC39
[proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching).

This project provides syntax-independent, **type-safe** pattern matching tools.

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Binding](#binding)
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

## API

See [deno doc](https://deno.land/x/pattern_matching?doc) for all APIs.

## Contributing

See [contributing](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2023 Tomoki Miyauchi
