# Current State Audit

## 1. What currently works
- The basic Vite + React + TypeScript setup is functioning (`npm run dev` and `npm run build` succeed).
- Tailwind CSS styling is configured and working.
- A foundational routing mechanism in `App.tsx` exists to switch between the map and workspaces.
- A basic SVG-based 2D canvas allows for states to be rendered (though dragging and interaction are superficial/incomplete).
- A basic string runner and transition table are visually present.
- Primitive `Automaton` and `Grammar` data types exist in `src/core/`.
- A naive `epsilonClosure` and `simulateString` function are implemented.

## 2. What is placeholder
- The entire Dashboard ("Automata Lab") is placeholder. The locked/unlocked states do not depend on actual mastery or XP progression; they are hardcoded.
- The Grammar Workspace currently says "Derivation Workspace (Coming soon)".
- The transition table is visually generated from the state but lacks robust editing capabilities that reflect back to the graph.
- The "Gamification" (XP counter) is a static overlay that does not respond to mathematical achievements.

## 3. What is fake
- The actual interactive connection between creating a transition visually and the mathematical engine strictly validating it is mostly fake/incomplete.
- Edge cases in string simulation (e.g. subset closures during intermediate NFA steps) are visually invisible.
- The UI implies a full laboratory but is currently just a scaffolded shell.

## 4. What can be reused
- The technology stack (Vite, React, TS, Tailwind, Zustand) is correct and fully configured.
- The separation of concerns strategy (`src/core/` for math, `src/components/` for UI) is sound and should be retained.
- The basic domain types in `src/core/automata.ts` and `src/core/grammar.ts` are a good starting point, though they require significant expansion.

## 5. What must be rewritten
- The mathematical engine in `src/core/` needs to be vastly expanded to include actual formal validation, canonicalization, regex parsing, minimization, etc.
- The `Workspace.tsx` canvas needs to be completely rebuilt to support actual graph interactions (drag, drop, create transition paths, bidirectional edges) rather than static SVG rendering.
- The transition table must be made fully bidirectional (editing table updates graph).
- The dashboard must be rewritten to pull from actual mastery states.

## 6. Existing dependencies
- `react`, `react-dom`
- `three`, `@react-three/fiber`, `@react-three/drei` (Currently unused but installed)
- `zustand` (Used for basic view state)
- `lucide-react`
- `tailwindcss`, `@tailwindcss/vite`
- `vitest` (Installed, but no tests exist)

## 7. Existing mathematical logic
- Basic NFA simulation is present (`move`, `epsilonClosure`).
- Basic CNF structural check exists (`isCNF`).
- **Missing:** Minimization, Regex Parsing, Thompson Construction, State Elimination, Equivalence Checking, Derivation engines, Null/Unit/Useless elimination algorithms, 2DFA, Moore/Mealy.

## 8. Existing bugs
- Dragging a state does not update its `x`/`y` coordinates because there are no mouse event handlers hooked up to the Zustand store.
- Creating transitions dynamically via the UI is impossible; it must be hardcoded into the initial state.
- No automated tests exist to verify the current mathematical logic.

## 9. Proposed architecture
- Ensure `src/core/` is completely pure.
- Build comprehensive unit test suites using `vitest` for every module in `src/core/` BEFORE touching the UI.
- Implement the 10-step rebuild plan, strictly enforcing the rule that the mathematical engine drives everything.
