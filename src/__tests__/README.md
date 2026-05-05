# Tests

This directory is where your tests should live.

Write your tests here using **Jest** and **React Testing Library**.

## Requirements

- Minimum **3 meaningful tests**
- At least **one test must cover an async interaction** (e.g. loading tasks, submitting the form, updating a status)
- Tests should assert **behaviour**, not implementation details
- We will read your tests as closely as your components

## Running tests

```bash
npm test
```

## Hints

- `@testing-library/user-event` is installed and preferred over `fireEvent` for simulating real user interactions
- `@testing-library/jest-dom` matchers are available (e.g. `toBeInTheDocument`, `toHaveTextContent`)
- Mock the API module (`src/api/tasks.ts`) rather than making real async calls in tests
