# Repository Guidelines

## Project Structure & Module Organization
The Vue 3 front end lives in `src/`, with `main.ts` bootstrapping Pinia and UnoCSS. Reusable UI stays in `src/components/`, state in `src/stores/`, and shared contracts in `src/types/`. Assets live in `src/assets/` and site-wide static files in `public/`. The Tauri backend sits in `src-tauri/src/` (`commands.rs`, `db.rs`, `models.rs`, `schema.rs`), with Diesel migrations tracked under `src-tauri/migrations/`.

## Build, Test, and Development Commands
Install dependencies with `pnpm install`. Use `pnpm dev` for the Vite client, and `pnpm tauri dev` to launch the desktop build with Rust commands. Ship builds via `pnpm build` (runs `vue-tsc` before bundling). Backend iteration: `cargo run --manifest-path src-tauri/Cargo.toml` and format with `cargo fmt`.

## Coding Style & Naming Conventions
Stick to TypeScript and `<script setup lang="ts">`. Use two-space indentation, PascalCase component filenames, and `useXStore` for Pinia stores. Keep types in `src/types/`, prefer single quotes, and group imports by source. Rust files remain snake_case and surface public APIs through `lib.rs`.

## Testing Guidelines
Run `cargo test --manifest-path src-tauri/Cargo.toml` for Rust coverage, placing unit tests beside modules with `#[cfg(test)]`. Add integration checks when touching Diesel queries to exercise the matching migration. The front end lacks a default harness; introduce `vitest` specs under `src/__tests__/` for new logic and note how to run them. Always finish with `pnpm build` plus the Rust tests before submitting.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) and keep changes scoped. Reference issue IDs and mention affected migration folders when schema changes land. Pull requests need a concise summary, testing notes (for example, "`pnpm tauri dev` on macOS"), and UI evidence when visuals change. Request review only once the branch builds cleanly.

## Database & Configuration Tips
Configuration loads through `dotenvy`; define `DATABASE_URL` and related secrets in a local `.env` next to `src-tauri/`. Apply schema updates with `diesel migration run` from that directory and commit the new timestamped folder plus any generated schema changes. When adding Tauri commands, update the capability files in `src-tauri/capabilities/` so they remain callable.
