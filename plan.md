# Pythoughts Terminal-Themed UI Overhaul – Development Plan

## Objectives
- Rebrand UI to a macOS-terminal-inspired interface while preserving existing flows.
- Light mode palette: mint green + cyan + dark grey; Dark mode: high-contrast terminal colors.
- Remove book icon; keep 3 traffic dots; wrap primary content in a terminal window frame.
- Adopt terminal-friendly typography (body + mono) with consistent sizing scale.
- Apply the theme across homepage, posts, auth, and admin dashboard with accessible contrast.

## Color System (Design Tokens)
Light Mode (Default)
- --color-bg: #F8FAFC (near-white)
- --color-surface: #FFFFFF
- --color-text: #1F2937 (dark grey)
- --color-muted: #64748B (muted grey)
- --color-primary: #34D399 (mint green 500)
- --color-accent: #06B6D4 (cyan 500)
- --color-border: #E2E8F0
- --color-traffic-red: #EF4444, --color-traffic-yellow: #F59E0B, --color-traffic-green: #10B981

Dark Mode
- --color-bg: #0F172A (slate-900)
- --color-surface: #111827 (gray-900)
- --color-text: #E5E7EB (gray-200)
- --color-muted: #94A3B8 (slate-400)
- --color-primary: #5EEAD4 (mint/turquoise 300)
- --color-accent: #22D3EE (cyan 400)
- --color-border: #334155
- Traffic dots use same hues with slight desaturation for dark.

## Typography
- Headings/Body: Figtree (modern, clean sans)
- UI/Terminal/Code: Roboto Mono (terminal feel)
- Scale: h1 36/44, h2 30/40, h3 24/32, body 16/24, small 14/20

## Terminal Window Aesthetics
- Sticky header with 3 macOS traffic dots (kept). Remove book logo icon; keep text logotype.
- Content "terminal frame" (card with rounded top corners), subtle inner shadow, and grid background.
- Title bar (within content frame) includes dots on the left and optional path/breadcrumb on the center-left.
- Terminal body uses Roboto Mono for content gutter, prompts, and code blocks; posts still use Figtree for readability with monospace accents.

## Implementation Steps (Phased)

Phase 1: Theming Core (No POC needed)
- Add CSS variables in global.css for both modes (above tokens) and map to Tailwind via utility classes.
- Update button/input/card classes to consume tokens; remove hardcoded hex values.
- Refactor Header.astro: remove book icon; keep traffic dots; update colors/hover states; preserve dark toggle.
- Create TerminalFrame.astro wrapper (title bar with dots + content area) and apply to homepage and a sample post page.
- Ensure accessible contrast (>= 4.5:1 for body text).
User Stories
1. As a reader, I want a clean terminal-styled layout that feels familiar and modern in light mode.
2. As a user, I can toggle dark mode and see a high-contrast terminal look instantly.
3. As a user, I can still navigate with clear active states and focus-visible styles.
4. As a contributor, I want inputs/buttons to match the new theme consistently.
5. As a reader, I want inline code and code blocks to look like a terminal.

Phase 2: Apply Across App
- Wrap posts list, post detail, auth pages, and settings with TerminalFrame.
- Refactor admin dashboard shell and tables/cards to new tokens and terminal accenting.
- Replace all inline SVG icons with Lucide system-consistent sizes/colors (keep dots only as custom shapes).
- Add decorative grid/noise background behind terminal frame (low opacity, performant).
- Add empty/loading/error states aligned to the new theme (skeletons use mint/cyan accents subtly).
User Stories
1. As an admin, I want the dashboard to feel cohesive with terminal styling.
2. As a reader, I want the posts index and details to feel like panes inside a terminal.
3. As a user, I want auth forms to be legible with clear errors in both modes.
4. As a moderator, I want tables and badges styled for fast scanning.
5. As a mobile user, I want responsive terminal panes with proper spacing.

Phase 3: Polish, A11y, and QA
- Tune focus rings, hover/active/disabled states with tokens; ensure keyboard navigation.
- Validate color contrast across modes and key components; adjust tokens if needed.
- Audit typography scale and spacing; ensure consistent rhythm.
- Remove any legacy styles; ensure no raw colors remain.
- Performance: limit gradients/filters; keep animations on opacity/transform.
User Stories
1. As a keyboard user, I can operate all key flows with visible focus.
2. As a reader, I experience consistent spacing and readable line lengths.
3. As a user, error messages are clear and accessible.
4. As a developer, I see no console/style warnings related to theming.
5. As a user, the UI feels snappy with no janky animations.

## Next Actions (Immediate)
1. Define tokens in global.css (:root and .dark) and map existing classes to variables.
2. Update Header.astro: remove book icon, verify dots, apply tokens.
3. Create TerminalFrame.astro and apply to homepage and one post page as POC of layout.
4. Swap any hardcoded icon colors to token-driven styles; maintain Lucide consistency.
5. Quick pass on auth pages to adopt new tokens and check contrast.

## Success Criteria
- Tokens-based theming in light/dark with the specified palettes; no hardcoded primary/accent values left.
- Header shows 3 traffic dots; no book icon; logotype readable in both modes.
- TerminalFrame wraps primary surfaces across pages, responsive and accessible.
- Admin dashboard re-styled with tokens (tables, badges, cards) and meets contrast guidelines.
- No regressions in navigation/auth; e2e sanity passes on homepage, posts, login/register, and admin.
