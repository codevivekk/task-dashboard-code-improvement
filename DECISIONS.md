# Architectural Decisions

## 1. Main Problems in Starter Code & Their Impact

When reviewing the initial codebase, three core issues stood out that would immediately degrade the user experience in a production environment:

- **Monolithic State & Prop Drilling:** `App.tsx` held all application state and bubbled events 4 levels deep. In a real-world app, this tightly couples the UI, makes refactoring dangerous, and forces intermediate components to re-render unnecessarily just to pass down props.
- **Main Thread Blocking (No Debouncing & Expensive Rendering):** The search input was tied directly to global state without debouncing. Every single keystroke synchronously re-evaluated Redux selectors over hundreds of items and forced massive DOM re-renders. Additionally, the text highlighting utility synchronously compiled hundreds of un-cached Regular Expressions per render pass. On mobile or low-end devices, this causes severe layout thrashing and freezes the UI when typing.
- **Unsafe Async Handling & Poor UX:** The `AddTaskForm` lacked loading states and error boundaries, leaving users guessing whether their form submitted or silently failed. Similarly, status changes forced the user to wait for network roundtrips with no immediate visual feedback, making the app feel slow and unresponsive.

## 2. State Management Approach

I migrated the app to **Redux Toolkit (RTK)**. 

**Why RTK?**
While the Context API or Zustand could have easily resolved the prop-drilling issue, RTK was chosen for a few crucial reasons:
- **Built-in Async Thunks:** Handling loading, success, and error states for the simulated network requests (`fetchTasks`, `createTask`) is boilerplate-heavy in raw React. RTK's `createAsyncThunk` standardizes this workflow cleanly out-of-the-box.
- **Memoized Selectors:** By leveraging RTK's `createSelector`, I extracted the expensive filtering logic out of the render cycle. Selectors now only recalculate when the exact slice of dependent data changes, significantly saving CPU cycles.
- **Scalability:** A task dashboard inherently grows in complexity over time (e.g., adding user permissions, complex filtering logic, optimistic UI patterns, websockets). RTK provides a structured, predictable pattern that scales gracefully across a larger team.

## 3. Future Improvements (With More Time)

If I had more time to invest in this dashboard, I would prioritize:

- **List Virtualization (`react-virtuoso`):** While client-side pagination fixed the immediate DOM node overload, modern dashboards often benefit from smooth infinite scrolling. I'd replace pagination with a windowed list that handles dynamic row heights perfectly, keeping the DOM extremely light regardless of how many tasks exist.
- **Advanced API State Management (`RTK Query`):** I would replace the standard `createAsyncThunk` boilerplate entirely with RTK Query. This would provide automated request deduplication, sophisticated caching, background refetching, and drastically simplify the optimistic update lifecycle hooks I manually implemented.
- **Robust Form Management:** I would move `AddTaskForm` to React Hook Form + Zod. Individual `useState` bindings work fine for four fields, but they scale poorly once we need to add complex validation rules, dirty states, and touch tracking.
