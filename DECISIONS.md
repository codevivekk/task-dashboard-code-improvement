# Architectural Decisions

## 1. Key Problems & Real-World Impact
When reviewing the initial codebase, three core issues stood out that would immediately degrade the user experience in a production environment:

- **Monolithic State & Prop Drilling:** `App.tsx` held all application state and bubbled events 4 levels deep. In a real-world app, this tightly couples the UI, makes refactoring dangerous, and forces intermediate components to re-render unnecessarily just to pass down props.
- **Main Thread Blocking (No Pagination):** The `TaskList` was dumping 500 `TaskCard` DOM nodes onto the page simultaneously, and `TaskStats` was running an array filter across all 500 items on every render. On mobile or low-end devices, this causes severe layout thrashing and freezes the UI when typing in the search bar.
- **Unsafe Async Handling:** The `AddTaskForm` had no loading state and allowed double-submissions. Operations lacked proper error feedback, leaving the user guessing whether their action succeeded or silently failed.

## 2. State Management: Redux Toolkit (RTK)
I migrated the app from an overloaded root state to **Redux Toolkit**. 

**Why RTK?**
While Context API or Zustand could handle the prop-drilling, RTK was chosen because:
- **Built-in Async Thunks:** Handling loading, success, and error states for network requests (`fetchTasks`, `createTask`) is boilerplate-heavy. RTK's `createAsyncThunk` standardizes this out-of-the-box.
- **Memoized Selectors:** By using RTK's `createSelector`, I extracted the expensive filtering logic (`selectFilteredTasks`, `selectTaskCounts`) out of the render cycle. They now only recalculate when the exact slice of data changes, saving CPU cycles.
- **Scalability:** A dashboard application inherently grows in complexity (e.g., adding user permissions, complex filtering, websockets). RTK provides a structured, predictable pattern that scales gracefully across a larger team.

## 3. Future Improvements (With More Time)
If I had more time to invest in this dashboard, I would prioritize:

- **Optimistic UI Updates:** Currently, changing a task status forces the UI to wait for the network. I would update the Redux store instantly and roll back the action on rejection to make the app feel instantaneous.
- **List Virtualization (`react-virtuoso`):** While pagination fixed the immediate DOM node overload, modern dashboards often benefit from smooth infinite scrolling. I'd replace pagination with a windowed list that handles dynamic row heights (for expanded cards) perfectly.
- **Robust Form Management:** Moving `AddTaskForm` to React Hook Form + Zod. Individual `useState` bindings work for four fields, but they scale poorly once we need to add complex validation, dirty states, or touch tracking.
