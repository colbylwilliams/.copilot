---
name: submit-pr
description: Commits outstanding changes, pushes the branch, and creates or updates a pull request. Use this when asked to create a PR, submit a PR, update a PR title or description, or after completing work on a branch.
---

Follow these steps to submit or update a pull request:

1. Determine the currently checked out Git branch.
2. Check for any uncommitted changes (staged or unstaged). If there are changes:
   a. Stage all changes (`git add` the relevant files — avoid adding unrelated or temporary files).
   b. Create a clear, concise commit message summarizing the changes.
   c. Commit the changes.
   d. Push the branch to the remote (set upstream if needed).
3. If the branch has no corresponding remote tracking branch yet, push with `--set-upstream`.
4. Check if an open pull request already exists for this branch using the GitHub MCP server tools.
5. If **no PR exists**, create one:
   a. Use the repository's default branch (e.g., `main`) as the base.
   b. Set the title and description following the guidance in step 7.
6. If a **PR already exists**, update its title and description following the guidance in step 7.
7. **PR title and description guidance:**
   a. Look for a pull request template in the repository's `.github` folder (e.g., `.github/PULL_REQUEST_TEMPLATE.md` or `.github/pull_request_template.md`). If one exists, use it as the structure for the PR description.
   b. Review the diff of the pull request to understand what changed.
   c. Set the PR title to be a concise, descriptive summary of the changes.
   d. Write the PR description based on the template (if found) or write a clear summary. Do **not** describe every file change — that's already available in the PR UX. Focus on the **what**, **why**, and any important design decisions.
