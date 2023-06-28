# Compliance with specification

This section discusses the differences from the
[specifications](https://tc39.es/proposal-pattern-matching).

| Short Name                                                                                                       |        Compatibility         | Description                                                         |
| ---------------------------------------------------------------------------------------------------------------- | :--------------------------: | ------------------------------------------------------------------- |
| [Close iterator](https://tc39.es/proposal-pattern-matching/#sec-close-iterators)                                 |              ✅              | If pattern is `ArrayPattern` and matchable is `Iterator`, close it. |
| [Close iterator before RHS](https://github.com/tc39/proposal-pattern-matching/issues/235#issuecomment-992969672) | [❌](#close-on-matching-end) | `Iterator` is closed just before RHS.                               |

## Close on matching end

Because the `match` and `arm` functions are independent, `match` cannot
recognize the RHS.

Iterator will close after RHS.
