# Frontend Testing

The frontend tests use [Vitest](https://vitest.dev/) with React Testing Library. The Vitest docs are the main reference if you need more detail than what's covered here.

## Where the test files are

Each test file sits next to the component or page it tests, with the same name plus `.test`:

```text
src/components/ProjectCard.tsx
src/components/ProjectCard.test.tsx
```

Vitest finds any file under `src` ending in `.test.ts` or `.test.tsx`, so new tests don't need to be registered anywhere.

The shared setup is in `src/test/setup.ts`. 

## Running the tests

Run these from the `client` folder.

```bash
npm test                                        # run all tests once
npx vitest run src/pages/ProjectPage.test.tsx   # run one file
```

Before opening a PR, also run `npm run typecheck` and `npm run lint`. Vitest doesn't type-check, so a test can pass while TypeScript still has errors in it.

## What a test looks like

Every test file follows the same layout: import what you need, render the component, do something a user would do, then check the result.

```tsx
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import {HeartButton} from "./HeartButton.tsx";

describe("HeartButton", () => {
    it("calls toggle when clicked", async () => {
        const user = userEvent.setup();
        const toggle = vi.fn();

        render(<HeartButton active={false} toggle={toggle}/>);

        await user.click(screen.getByRole("button"));

        expect(toggle).toHaveBeenCalledTimes(1);
    });
});
```

Vitest globals are turned off, so `describe`, `it`, `expect` and `vi` are imported from `vitest` in every file.

## Adding a new test

1. Create `Name.test.tsx` next to the component you want to test.
2. Copy the layout from the example above: render the component, interact with it using `userEvent`, then check the result with `expect`.
3. Find elements the way a user would, for example `getByRole("button", {name: "Save"})`.
4. Run the test file, then `npm run typecheck` and `npm run lint`.

Some components need extra setup before they can be tested. If the component you're testing does any of these, find an existing test that does the same thing and copy how it sets it up:

- **Links or page navigation:** see `ProjectCard.test.tsx`
- **Loading data from the server:** see `ProjectList.test.tsx`
- **Needs a logged-in user:** see `Header.test.tsx`
