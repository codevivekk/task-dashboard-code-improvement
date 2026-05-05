# Architectural Decisions & Refactoring Log

## 1. Problem Identification & Initial Assessment
Upon reviewing the initial codebase, several critical issues were identified that went beyond simple syntax errors. These directly impacted performance, maintainability, and user experience:

- **Severe Performance Bottlenecks (Un-debounced Search & Expensive Rendering):** The search input was directly tied to the global Redux store without debouncing. Every keystroke triggered a re-evaluation of selectors over 500 items and synchronously re-rendered 50 task cards. Furthermore, the `highlight` utility dynamically compiled two Regular Expressions per card on every render, causing massive CPU spikes and UI stuttering.
- **Async UX Failures (Lack of Optimistic Updates & Error Handling):** Status changes via the dropdown incurred a ~400ms network delay before the UI updated, making the app feel sluggish. Furthermore, if the simulated API rejected the change, the error was silently swallowed, leaving the UI state desynced from the backend.
- **Derived State Anti-Patterns:** The `TaskList` component utilized a `useEffect` hook to synchronize the `currentPage` state when the `tasks` array changed. This caused unnecessary double-renders and flashes of empty content.
- **Architectural Coupling:** Presentational components like `TaskCard` were reaching directly into the global Redux store via hooks to read state and dispatch actions, defeating the purpose of separation of concerns and making them difficult to reuse or test.

## 2. Refactoring & Implementation Details

### Performance Optimizations
- **Search Debouncing:** Decoupled the search input from the Redux store using local component state. Added a 300ms debounce before dispatching the query to the store, completely eliminating UI stuttering while typing.
- **Regex Caching:** Refactored the `highlight` utility to utilize a module-level `Map` to cache compiled `RegExp` instances, reducing the regex compilation overhead from O(N) per render to O(1) globally.

### State & Architecture Improvements
- **Optimistic Updates:** Enhanced the `updateTaskStatusAsync` Redux thunk by capturing the `oldStatus` and eagerly applying the new status in the `.pending` reducer case. If the API request fails, the `.rejected` handler automatically rolls back the UI to the previous state and surfaces an error.
- **Component Decoupling:** Hoisted the Redux hook subscriptions out of `TaskCard` and up to `TaskList`. `TaskCard` is now a pure presentational component that accurately respects `React.memo` prop equality checks.
- **Fixing Derived State:** Removed the `useEffect` state-synchronization trap in `TaskList`. By leveraging React's rendering phase to update `prevTasks` and reset `currentPage`, the component now immediately processes the new state in a single render pass.
- **URL Synchronization:** Implemented bi-directional syncing of the `searchTerm` and `statusFilter` to the browser's URL query parameters. This allows the dashboard to be seamlessly bookmarked and shared.

## 3. Testing Strategy
Added a comprehensive integration test suite (`App.test.tsx`) leveraging Jest and React Testing Library:
- **Behavior-Driven:** Tests avoid asserting on implementation details (e.g., checking internal Redux state trees) and instead simulate real user flows (typing, clicking, submitting).
- **Async Handling:** Tests utilize `waitFor` and `act`-wrapped `fireEvent` dispatches to properly flush promises and validate the UI state after the mocked API layers resolve.

## 4. Future Improvements (With More Time)
If given more time, I would consider:
- **List Virtualization (`react-virtuoso`):** Upgrading the current pagination model to a windowed infinite scroll for an even smoother experience.
- **Advanced API State Management (`RTK Query`):** Replacing the standard `createAsyncThunk` boilerplate with RTK Query to get caching, automated refetching, and simplified optimistic update lifecycle hooks out-of-the-box.
