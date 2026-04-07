---
name: merge-main
description: Merges the latest changes from main into the current branch, resolves any conflicts, reviews main's recent changes for applicability to branch files, and pushes. Use this when asked to merge main, update from main, or sync with main.
---

Follow these steps to merge the latest changes from main into the current branch:

1. **Preflight checks**
   a. Determine the currently checked out branch. If it is `main`, stop and inform the user — do not merge main into itself.
   b. Check for uncommitted changes (staged or unstaged). If any exist, stash them with `git stash push -m "merge-main: auto-stash"` and remember to pop them at the end.

2. **Fetch and merge**
   a. Run `git fetch origin main` to get the latest remote changes.
   b. Run `git merge origin/main --no-edit`.
   c. If the merge completes cleanly with no conflicts, skip to step 4.

3. **Resolve conflicts** (only if the merge produced conflicts)
   a. List all conflicted files with `git diff --name-only --diff-filter=U`.
   b. For each conflicted file:
      - Read the file and understand both sides of the conflict.
      - Determine the correct resolution by understanding the intent of both changes.
      - Edit the file to resolve the conflict, removing all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
      - Stage the resolved file with `git add <file>`.
   c. After all conflicts are resolved, finalize the merge with `git commit --no-edit`.

4. **Review main's changes for applicability**
   a. Get the list of files changed on the current branch vs `origin/main` using `git diff --name-only origin/main...HEAD` (the three-dot diff shows what the branch introduced).
   b. Get the list of files changed on main since the branch's merge-base using `git diff --name-only $(git merge-base HEAD origin/main)..origin/main`.
   c. Look for overlap or related files between these two lists — for example, if the branch modified a function and main changed how that function is called elsewhere, or if main introduced patterns/conventions that the branch's new files should follow.
   d. If you find changes on main that are relevant to the branch's files (e.g., API changes, renamed imports, updated patterns, new shared utilities), apply those adjustments to the branch's files. Commit these as a separate commit with a descriptive message.
   e. If nothing needs adjustment, move on.

5. **Restore and push**
   a. If changes were stashed in step 1b, run `git stash pop` to restore them. Do **not** commit the restored stash — leave those as uncommitted working changes.
   b. Push the branch to the remote with `git push`.
   c. If the push is rejected (e.g., due to a force-push or diverged history), do **not** force push. Inform the user and ask how to proceed.

6. **Summary**
   a. Provide a brief summary: how many commits were merged, whether conflicts were resolved, and whether any applicability adjustments were made.
