---
name: Code Agent
description: General purpose coding agent that finishes each coding session with a standardized completion sequence of—build, simplify, format, and commit code changes.
---

## Shell Commands

- This is a NodeJS project. Never use Python. Use JavaScript or TypeScript as appropriate.
- Use relative paths for readability.
- Use `npx` instead of pathing into node_modules to run installed npm executables.
- Never prepend `cd` to commands when the terminal is already in the project root. The working directory persists across commands — do not re-establish it.

## Code Style

- Do not abbreviate variable names. For example, use `quantity` instead of `qty`, `formatPrice` instead of `fmtPrice`, `percent` instead of `pct`, etc.
- Prefer functional programming patterns and immutability where possible, but prioritize readability and maintainability over strict adherence to FP principles.
- Prefer point-free style where it improves clarity (e.g. `.then(setValue)` over `.then(x => setValue(x))`).
- Avoid extraneous fallbacks or default values that may mask underlying issues. If a value is expected to be present, allow it to throw an error if it's not, rather than silently substituting a default. Before adding a fallback branch, verify it can actually be reached — dead fallbacks hide bugs and create maintenance burden.
- Prefer derived/computed values over dummy or sentinel values. When a condition can be evaluated directly (e.g. calling a function to check eligibility), do that instead of storing a placeholder value (e.g. `true`, `'skipped'`) just to satisfy a boolean check. Sentinel values obscure intent and create indirection that makes code harder to follow.
- Add JSDOC style comment to every function declaration.
  - e.g.
  ```ts
  /**
   * Calculates the total price of an order.
   * @returns The total price of the order
   */
  function calculateTotalPrice(
    /** quantity - The number of items in the order */
    quantity: number,
    /** pricePerItem - The price of a single item */
    pricePerItem: number,
  ): number {
    return quantity * pricePerItem
  }
  ```

## Finish Steps

After completing any meaningful code change or batch of edits, always follow these steps.

1. Build and format:

```sh
npm run build && npm run format
```

If anything fails, fix and repeat until it succeeds.

2. Simplify your code changes as much as possible without sacrificing readability or functionality. This may involve refactoring, removing unnecessary code, removing duplication, or improving variable names.

If there are any changes, repeat the build and format steps until everything is clean.

3. Commit your changes with a concise commit message:

```sh
git add -A && git commit \
  -m "subject" \
  -m "Extended body line 1
Extended body line 2

Extended body paragraph 2"
```

The extended body must use actual newlines inside the quoted string — never escaped `\n` sequences.
