# Legacy development scripts

These scripts were used during earlier refactors and are kept for reference only. They are not part of the application runtime, CI, deployment or supported tooling.

- `check-accounts.ps1` — searched an older frontend path for duplicated function names.
- `dedupe-consts.cjs` — removed duplicate `const ... = async (...)` declarations from a file passed on the command line.

Review the script and the target file before running either one. Some paths and assumptions may no longer match the current codebase.
