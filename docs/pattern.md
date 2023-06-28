# Pattern

The pattern uses JavaScript value instead of syntax.

## NearLiteralPattern

NearLiteralPattern replaces
[NearLiteralMatchPattern](https://tc39.es/proposal-pattern-matching/#prod-NearLiteralMatchPattern).

It uses the following JavaScript value:

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `RegExp`

Of these, only `RegExp` may generate bindings.

```ts
import { when } from "https://deno.land/x/pattern_matching/mod.ts";

declare const handler: () => unknown;

const arm1 = when(0, handler);
const arm2 = when("ok", handler);
```

### Regex pattern and binding

If you are using named capture groups in a regular expression, the capture
groups will be bound.

```ts
import { when } from "https://deno.land/x/pattern_matching/mod.ts";

const arm = when(/^(?<timestamp>\d+) (?<message>.+)$/, (binding) => {
  return binding.message!;
});
```

The type `{[k: string]: string}` will add to the binding infer.

> **note** TypeScript does not allow a more detailed analysis of a regular
> expression than `RegExp`, even if it is literal. This means that named capture
> groups cannot be statically parsed.
