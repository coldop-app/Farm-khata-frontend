# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-beta.1] - 2025-01-27

### Added

- Font loading utility system (`fonts.ts`) with support for Lusitana, Montserrat, and Geist Mono fonts
- Font CSS variables and utility classes (`app.css`) for easy font application
- Select component from shadcn/ui with full Radix UI integration
- Font demonstration in DaybookPage component

## [0.2.0-beta.0] - 2025-01-27

### Added

- Zustand state management library setup with example store
- TanStack Query v5 for server state management
- Sonner toast notification component from shadcn/ui
- QueryClient configuration with default options
- TanStack Query ESLint plugin for better DX
- Example implementations in DaybookPage demonstrating all new features

### Changed

- Updated root route to include QueryClientProvider and Toaster components
- Enhanced ESLint configuration with TanStack Query rules

## [0.1.0-beta.0] - 2025-01-27

### Added

- Initial project setup with React 19 and TypeScript
- Vite build tooling with rolldown for faster builds
- Vitest testing framework with coverage support
- ESLint and Prettier for code quality and formatting
- Husky git hooks for pre-commit and commit-msg validation
- Commitlint with conventional commits configuration
- Tailwind CSS v4 with shadcn/ui components
- React Compiler integration
- Production-ready development and build configuration

### Changed

- Updated `.gitignore` with comprehensive ignore patterns
- Enhanced README with comprehensive documentation
