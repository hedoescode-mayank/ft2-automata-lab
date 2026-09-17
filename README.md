# FT-2 Interactive 3D Learning Platform Specification

This ZIP is the source-of-truth specification for building an interactive FT-2 learning website.

## Start Here

1. `PLAN.md`
2. `content/CURRICULUM.md`
3. `architecture/ARCHITECTURE.md`
4. `rules/TEACHING_RULES.md`
5. `rules/VALIDATION_RULES.md`
6. `tasks/QUESTION_BANK.md`
7. `prompts/CODEX_BUILD_PROMPT.md`

## Goal

The website should feel like a game, but the mathematical engine must be rigorous.

The final learner journey:

**Learn → See → Manipulate → Simulate → Solve → Debug → Exam → Master**

## Suggested Folder Structure

```text
src/
  core/
    automata/
    regex/
    grammar/
    machines/
    validation/
  components/
    scene/
    ui/
  content/
  store/
  pages/
  tests/
```

## Important

The 3D experience is not the educational content by itself. Every interactive scene must correspond to a real mathematical operation.

The platform should be usable for FT-2 exam preparation from zero knowledge.
