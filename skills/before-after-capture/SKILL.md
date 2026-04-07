---
name: before-after-capture
description: Captures before-and-after screenshots and/or video recordings of an iOS app on a simulator to demonstrate UI or behavior changes in a pull request. Only use for iOS repositories with Xcode projects.
---

# Before & After Capture

Capture before-and-after screenshots and/or video recordings of an iOS app running on a simulator, demonstrating UI or behavior changes in a pull request. Screenshots are always taken in both light and dark mode.

**Only use this skill when ALL of the following are true:**
- The repository contains an Xcode project or workspace targeting iOS
- The user is on a feature branch with an associated pull request (or changes relative to a base branch)
- The user wants visual comparison of the app before and after their code changes

## File Naming Convention

All captures use a descriptive naming format:

```
<app_name>_<what_it_shows>_<before|after>_<light|dark>.<png|mp4>
```

- `<app_name>`: short lowercase name for the app (e.g., `github_ios`, `myapp`)
- `<what_it_shows>`: snake_case description of the screen or feature (e.g., `sidebar`, `settings_tab`, `login_flow`)
- `<before|after>`: which state the capture represents
- `<light|dark>`: the appearance mode (for screenshots; omit for video unless both modes are recorded)
- Extension: `.png` for screenshots, `.mp4` for video

Examples:
- `github_ios_sidebar_before_light.png`
- `github_ios_sidebar_after_dark.png`
- `github_ios_login_flow_before.mp4`

## Preparation

1. **Determine what to capture by analyzing context.**
   Rather than asking the user, try to extrapolate what screen, view, or flow to capture from:
   - The current session context and conversation history
   - The pull request title, description, and comments (use GitHub MCP tools to read the PR)
   - The code changes in the pull request (use `get_diff` or `get_files` on the PR)

   From this context, determine:
   - What screen or flow best demonstrates the change
   - What navigation steps are needed to reach that state
   - Whether screenshots, video, or both are appropriate (screenshots for static UI changes, video for behavioral/interactive changes)
   - A short descriptive name for the capture (used in file naming)

   If you cannot determine what to capture from context alone, ask the user for clarification using `ask_user`.

2. **Determine the current branch and base.**
   a. Run `git branch --show-current` to get the current branch name (this is the "after" branch).
   b. Determine the base ref to compare against. Use one of these approaches in order of preference:
      - If an open PR exists for this branch, use the PR's base branch (e.g., `main`).
      - Otherwise, compute the merge-base: `git merge-base HEAD origin/main` (or the repository's default branch).
   c. Store the current branch name and the base ref for later use.

3. **Check for uncommitted changes.** Run `git status --porcelain`. If there are uncommitted changes:
   a. Stash them with `git stash push -m "before-after-capture: auto-stash"`.
   b. Remember to pop the stash at the end.

4. **Establish XcodeBuildMCP session context.**
   a. Call `session_show_defaults` to check the current session configuration.
   b. If the project/workspace, scheme, or simulator are not configured, use `discover_projs` and `list_schemes` to find them, then set defaults with `session_set_defaults`.
   c. Ensure a simulator is configured. If not, use `list_sims` to find an appropriate iOS simulator and set it.

5. **Create the output directory** for captures:
   ```
   mkdir -p ./.local/before-after
   ```
   The `.local` directory should be ignored by the global `.gitignore`. If you find that it is not being ignored (check with `git status`), add `.local/` to the `.gitignore` file in the repository root.

## Phase 1: Capture "Before" State

6. **Check out the base ref.**
   ```
   git checkout <base-ref>
   ```
   Where `<base-ref>` is the PR base branch or merge-base commit determined in step 2.

7. **Build and run the app on the simulator.**
   a. Use `build_run_sim` to build, install, and launch the app.
   b. If the build fails on the base ref (e.g., due to project structure changes), inform the user and skip the "before" capture. Continue to Phase 2.

8. **Wait for the app to be ready.** After launch, give the app a few seconds to finish loading. Navigate to the desired screen state using UI automation tools (`snapshot_ui`, and any available tap/swipe tools).

9. **Capture "before" screenshots in both appearance modes.**
   a. Use `set_sim_appearance` to switch to **light** mode.
   b. Wait briefly for the UI to update.
   c. Use `screenshot` with `returnFormat: "path"`. Move or copy the file to `./.local/before-after/<app>_<what>_before_light.png`.
   d. Use `set_sim_appearance` to switch to **dark** mode.
   e. Wait briefly for the UI to update.
   f. Use `screenshot` with `returnFormat: "path"`. Move or copy the file to `./.local/before-after/<app>_<what>_before_dark.png`.

10. **Capture "before" video (if applicable).**
    If video is being captured:
    a. **Do a practice run first.** Before recording, perform the full navigation and interaction sequence without recording to ensure you can execute the steps smoothly and quickly. UI automation with XcodeBuildMCP is often trial and error — the practice run lets you work out any issues so the actual recording is clean.
    b. Reset the app state back to the starting point for the recording.
    c. Start recording with `record_sim_video` using `start: true` and `outputFile: "./.local/before-after/<app>_<what>_before.mp4"`.
    d. Perform the interaction as quickly and smoothly as possible. The recording should be only as long as needed to clearly demonstrate the change — no unnecessary pauses or extra navigation.
    e. Stop recording with `record_sim_video` using `stop: true`.

## Phase 2: Capture "After" State

11. **Check out the feature branch.**
    ```
    git checkout <feature-branch>
    ```
    Where `<feature-branch>` is the branch name from step 2a.

12. **Build and run the app on the simulator.**
    a. Use `build_run_sim` to build, install, and launch the app.
    b. If the build fails, inform the user and provide the error. Do not silently skip.

13. **Wait for the app to be ready.** Same as step 8 — allow the app to load and navigate to the same screen/state as the "before" capture.

14. **Capture "after" screenshots in both appearance modes.**
    a. Use `set_sim_appearance` to switch to **light** mode.
    b. Wait briefly for the UI to update.
    c. Use `screenshot` with `returnFormat: "path"`. Move or copy the file to `./.local/before-after/<app>_<what>_after_light.png`.
    d. Use `set_sim_appearance` to switch to **dark** mode.
    e. Wait briefly for the UI to update.
    f. Use `screenshot` with `returnFormat: "path"`. Move or copy the file to `./.local/before-after/<app>_<what>_after_dark.png`.

15. **Capture "after" video (if applicable).**
    If video is being captured:
    a. **Do a practice run first** (same as step 10a) to ensure smooth execution.
    b. Reset the app state back to the starting point.
    c. Start recording with `record_sim_video` using `start: true` and `outputFile: "./.local/before-after/<app>_<what>_after.mp4"`.
    d. Perform the same interaction as the "before" recording, as quickly and smoothly as possible.
    e. Stop recording with `record_sim_video` using `stop: true`.

## Cleanup & Summary

16. **Restore working state.**
    a. If changes were stashed in step 3, run `git stash pop` to restore them.
    b. Verify you are on the original feature branch (`git branch --show-current`).
    c. Do **not** stop the simulator or app — leave them running so the user can review captures and continue testing.

17. **Present the results to the user.**
    a. List all files created in `./.local/before-after/`.
    b. If screenshots were taken, show the before and after screenshots to the user using the view tool so they can visually compare (show light and dark pairs together).
    c. For video recordings, inform the user of the file paths so they can review them.
    d. Provide a brief summary: what was captured, what branch/commit each represents, and the file locations.

## Error Handling

- If `git checkout` fails (e.g., due to uncommitted changes not being stashed), stop and inform the user.
- If the build fails on the base ref, inform the user that the "before" capture could not be completed (the code may have been in a non-buildable state at that point). Offer to continue with just the "after" capture.
- If the build fails on the feature branch, this is an error in the user's code — report it clearly.
- Always ensure the user ends up back on their original branch, even if errors occur mid-process. Use a `git checkout <feature-branch>` in error recovery paths.
- Always pop the stash if one was created, even on error paths.
