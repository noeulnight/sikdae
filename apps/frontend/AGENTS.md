<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Sikdae Frontend Agent Instructions

## Frontend Conventions

- Use React Query for server-state and query/mutation lifecycle management.
- Use Axios for HTTP transport.
- Keep API request functions separate from React components.
- Do not call `fetch` directly from UI components for backend API access.
- Query keys must be centralized or colocated in typed query modules, not repeated ad hoc across components.
- Mutations must invalidate or update related React Query cache entries explicitly.

## shadcn/ui

- Use the shadcn CLI to add and maintain shared shadcn/ui components.
- Use shadcn/ui components for all standard UI primitives whenever a matching component exists, including buttons, inputs, labels, selects, textareas, checkboxes, switches, tabs, dialogs, dropdowns, cards, badges, tables, skeletons, alerts, and forms.
- Keep generated shadcn components under the configured shared UI component directory.
- Do not manually recreate shadcn components when the CLI can add them.
- Do not implement custom Tailwind-only replacements for standard shadcn/ui primitives.
- Do not apply feature-specific styling directly inside shadcn shared components.
- Do not pass custom Tailwind styling into shadcn/ui primitives for one-off feature design. Prefer shadcn variants, sizes, and composition; put layout classes on surrounding wrapper elements instead.
- Treat shadcn shared components as reusable primitives.
- Apply feature-specific layout and styling through wrapper components, page components, or feature components.
- Feature components may compose shadcn primitives and add layout classes, but must not define new primitive-like components such as custom Card, Badge, Table, Input, Select, Checkbox, Switch, Dialog, or Tabs when the shadcn CLI can provide them.

## Component Structure

- Split components by responsibility.
- Do not place page orchestration, API calls, forms, table/list rendering, and low-level UI primitives in one large file.
- Pages should compose feature components and avoid owning detailed UI implementation.
- Feature components should live under feature-oriented folders.
- Shared reusable components should live under shared component folders.
- Keep files small enough that one file has one clear reason to change.

## File Layout

- Keep backend API clients and query hooks outside page files.
- Prefer typed folders for non-page code, for example:
  - `src/lib/api/*.ts`
  - `src/lib/query/*.ts`
  - `src/features/documents/components/*.tsx`
  - `src/features/documents/queries/*.ts`
  - `src/features/documents/types/*.ts`
  - `src/components/ui/*.tsx`
- Do not put feature DTOs, API clients, query hooks, and components together in a single root file.

## Styling

- Do not style shadcn shared components directly for one feature.
- Keep shared UI primitive styling generic.
- Use composition and wrapper components for feature-specific appearance.
- Do not use direct Tailwind custom styling to create reusable UI primitives that should come from shadcn/ui.
- Tailwind classes are allowed for page layout, spacing, grid/flex composition, and feature-specific wrappers around shadcn primitives.
- Use shadcn/ui skeletons for authentication-state checks and page-level loading placeholders instead of explanatory loading alerts or text-only loading states.
- Avoid adding explanatory product copy, implementation details, API details, or helper text unless it directly helps the user complete the current task.
- Avoid oversized marketing-style layouts for the reader app; prioritize dense, clear document workflows.

## Verification

- After frontend changes, run:
  - `pnpm lint`
  - `pnpm build`
- When adding interactive or visual flows, run the app locally and verify the affected screen in a browser.
