# ExploreJapan.tube Frontend Diagnosis Report

**Date**: 2026-02-15
**Scope**: App.tsx, types.ts, DiscoveryCard.tsx, ActivityDetailModal.tsx
**Perspective**: Frontend Engineer / Code Reviewer

---

## Executive Summary

The application has a well-defined type system and a visually ambitious UI, but suffers from **critical UX bugs that silently break core user flows** (especially on mobile), **state management gaps that cause dead-end interactions**, and **localStorage fragility that will corrupt data as the app evolves**. Below are 27 findings organized by the four diagnostic pillars requested.

---

## 1. Logic Consistency (Gemini API Data → UI)

### CRITICAL-01: `targetAreas` Has No UI Input — AI Always Receives Default Value

**File**: `App.tsx` (state declaration + PLANNER form)

```tsx
const [targetAreas, setTargetAreas] = useState('Tokyo, Osaka, Kyoto');
```

The Planner form shows Budget and Priority inputs, but **there is no `<input>` for `targetAreas`**. The call `createBudgetOptimizedPlan(budget, priority, targetAreas)` always sends `'Tokyo, Osaka, Kyoto'` regardless of user intent. Users who want to plan for Hokkaido, Okinawa, or Hiroshima have no way to do so.

**Fix**: Add a text input or multi-select for target areas in the Planner form.

---

### CRITICAL-02: Clicking a Saved Plan Does NOT Navigate to Planner Tab

**File**: `App.tsx`, MY_PLANS tab section

```tsx
<div key={plan.id} ... onClick={() => setItinerary(plan)}>
```

This sets `itinerary` in state but **never calls `setActiveTab(Tab.PLANNER)`**. The user clicks a saved plan, nothing visibly happens — they stay on MY_PLANS. The "Open Plan" button inside the card also has no separate `onClick`, so it fires the card's handler, which still doesn't navigate.

**Fix**:
```tsx
onClick={() => { setItinerary(plan); setActiveTab(Tab.PLANNER); }}
```

---

### HIGH-03: Trending Topics Failure Is Silently Swallowed

**File**: `App.tsx`, `useEffect`

```tsx
getTrendingTopics().then(setTrending).catch(() => console.warn("Trending failed"));
```

If the API fails, `trending` stays as an empty array `[]`. The TRENDING tab renders an empty grid with no error message, no retry button, and no indication that something went wrong. Users see a blank page with only the header.

**Fix**: Set an error state specific to trending and show `ErrorDisplay` on the TRENDING tab.

---

### MEDIUM-04: URL Query Parameter Is Read-Only

**File**: `App.tsx`, `useEffect`

```tsx
const q = params.get('q') || 'Hidden gems in Tokyo for emotional seekers';
```

The `q` parameter is read on mount but **never updated** when the user types a new search. This means:
- Sharing URLs won't reflect the user's actual search
- Browser refresh resets to the default query
- The URL bar becomes misleading

**Fix**: Update `window.history.replaceState` or use a router to sync URL with search state.

---

### MEDIUM-05: Fake Live Metrics Presented as Real Data

**File**: `App.tsx`

```tsx
const [liveUsers, setLiveUsers] = useState(1284);
const [totalSaved, setTotalSaved] = useState(42890);
// ... randomly incremented every 5 seconds
```

The "Partners Helped: 150k+", "Saved for Users: $2.4M" in `OurStory`, and the footer's "Collective User Travel Savings: $42,890+" are all hardcoded or randomly incremented. These numbers are fabricated. For a brand claiming altruism and trust, presenting fake metrics is a significant **credibility risk** if users discover this.

---

### LOW-06: `useEffect` Missing Dependency on `handleSearchInternal`

**File**: `App.tsx`

The `handleSearchInternal` function is called inside `useEffect` but is not in the dependency array. While React won't re-run the effect due to this (since there are no deps), it violates the Rules of Hooks and can cause stale closure bugs if the code evolves.

---

### LOW-07: Default Search Fires on Every Page Load

**File**: `App.tsx`, `useEffect`

```tsx
const q = params.get('q') || 'Hidden gems in Tokyo for emotional seekers';
handleSearchInternal(q);
```

Every page load consumes a Gemini API call, even if the user immediately navigates to PLANNER or TRENDING. This wastes API quota.

**Fix**: Lazy-load insights only when the DISCOVER tab is active.

---

## 2. UX Defects

### CRITICAL-08: Mobile Users Cannot Access Booking Button on DiscoveryCard

**File**: `DiscoveryCard.tsx`

```tsx
<div className="opacity-0 group-hover:opacity-100 ...">
  <button onClick={(e) => { e.stopPropagation(); onConcierge(title); }}>
    Secure Journey & Support Us
  </button>
</div>
```

The booking button, reason text, and "Altruistic Pick" section are all wrapped in `opacity-0 group-hover:opacity-100`. **On mobile/touch devices, there is no hover state.** This means:
- Users on phones and tablets **can never see** the booking button
- Users on phones can never read the `insight.reason` text
- The only action available is `onShowDetail` (tapping the card)

This is the primary answer to **"Why doesn't the booking button work?"** — it's invisible on mobile.

**Fix**: Use a tap-to-reveal pattern on mobile, or always show the button below the fold:
```tsx
className="opacity-100 md:opacity-0 md:group-hover:opacity-100 ..."
```

---

### CRITICAL-09: ActivityDetailModal Has No Overlay Close or Keyboard Escape

**File**: `ActivityDetailModal.tsx`

The modal occupies `fixed inset-0` with `bg-black/98`, but:
- There is **no `onKeyDown` handler for Escape** key
- There is **no click handler on the backdrop** to close
- The only close mechanism is a back-arrow button in the top-left corner of the image area

Users on desktop expect Escape to close modals. Users on mobile may not notice the small back button overlaid on a dark image.

**Fix**: Add `onKeyDown` escape handler and optional backdrop click.

---

### HIGH-10: ActivityDetailModal Potential Race Condition on Close → Book

**File**: `App.tsx`

```tsx
onBook={() => {
  setIsActivityDetailOpen(false);  // closes detail modal
  openBooking(selectedActivity.name);  // opens booking modal
}}
```

Both state updates happen synchronously in the same event handler, so React batches them. However, this can cause a visual flicker where both modals briefly overlap during the exit animation. The detail modal has a `duration-500` animation class.

**Fix**: Delay `openBooking` until after the detail modal's exit animation completes, or use `setTimeout`.

---

### HIGH-11: No Loading/Error State for ActivityDetailModal API Calls

**File**: `ActivityDetailModal.tsx`

```tsx
getActivityDetails(activityName, region)
  .then(res => { setDetails(res); setLoading(false); })
  .catch(() => setLoading(false));
```

On API failure, `loading` becomes `false` but `details` remains `null`. The modal renders the non-loading branch, which shows:
- "Concierge Verdict" section with a static quote (OK)
- `personalInsight` section if available (OK)
- `{details?.text}` which is **`undefined`** — renders nothing
- The booking button (OK)

The user sees a mostly blank modal with no explanation of the failure and no retry option.

**Fix**: Add an error state and display an error message with retry.

---

### HIGH-12: Budget Input Accepts Invalid Values

**File**: `App.tsx`, PLANNER form

```tsx
<input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
```

Users can enter:
- **0 or negative numbers** → meaningless plan generation
- **Extremely large numbers** → API may produce unrealistic results
- **NaN** (clearing the field) → `Number('')` is `0`

No validation, no min/max constraints.

**Fix**: Add `min={100} max={50000}` and validate before calling `handlePlanGeneration`.

---

### MEDIUM-13: Search Form Has No Empty-Query Guard in UI

**File**: `App.tsx`

```tsx
const handleSearchInternal = async (query: string) => {
  if (!query) return; // silently returns
```

If the user clears the search field and clicks "Explore", nothing happens — no feedback that a query is required. The button appears to be broken.

**Fix**: Disable the submit button when the query is empty, or show a validation message.

---

### MEDIUM-14: Loading State Destroys Previously Loaded Results

**File**: `App.tsx`, DISCOVER tab

When a new search starts, the loading spinner replaces the entire card grid. Previously visible insights disappear. Users lose their scroll position and context.

**Fix**: Show an inline loading indicator while preserving existing results, or use skeleton cards.

---

### MEDIUM-15: `useTransition` Is Unnecessary

**File**: `App.tsx`

```tsx
const [isPending, startTransition] = useTransition();
```

`startTransition` wraps `setActiveTab` and `setSearchQuery` + `handleSearchInternal`. These are simple state updates that don't trigger expensive renders. The `isPending` state applies `opacity-50` to the entire app — which means **the whole page goes translucent** during any tab navigation, creating a flash of dimmed content for no benefit.

**Fix**: Remove `useTransition` and `isPending` opacity. Use per-section loading states instead.

---

### LOW-16: OurStory Statistics Use Picsum for Founder Avatar

**File**: `App.tsx`, `OurStory`

```tsx
<img src="https://picsum.photos/seed/musashi/200/200" />
```

The founder's avatar is a random placeholder image. This undermines the personal brand story being told.

---

### LOW-17: DiscoveryCard Image Uses Deterministic Random Images

**File**: `DiscoveryCard.tsx`

```tsx
src={`https://picsum.photos/seed/${encodeURIComponent(title)}/800/1200`}
```

Images are deterministic by title (same title = same random image), but they have **no relation to the actual activity**. A card for "Tsukiji Market" might show a random landscape. This degrades trust.

---

## 3. AI Prompt Quality (Brand Coherence)

### HIGH-18: Cognitive Dissonance Between "Altruistic" Messaging and Monetization Types

**File**: `types.ts`

```typescript
export interface MonetizationInfo {
  type: 'affiliate' | 'agency' | 'none';
  action_label: string;
  search_keyword: string;
  estimated_spend?: number;
  provider?: string;
}
```

The entire UI is saturated with altruistic messaging ("We aren't here for profit", "Please use us", "Your joy is our success"), yet the data model has explicit monetization tracking with affiliate links and agency referrals. The `DiscoveryCard` even conditionally styles agency items with a red border:

```tsx
const isAgency = insight.monetization?.type === 'agency';
// ... border-red-600/30 for agency items
```

This creates a trust gap. Users are told the service is altruistic while being steered toward monetized options. **The prompt should be transparent about the business model** rather than hiding it behind altruistic language.

**Recommendation**: Either genuinely be non-monetized, or be transparent: "We earn a small commission from partner bookings, which keeps this service free."

---

### HIGH-19: Static "Concierge Verdict" Ignores AI-Generated Content

**File**: `ActivityDetailModal.tsx`

```tsx
<p className="text-3xl font-black ...">
  "We exist to handle the friction, so you can focus on the feeling.
   Please use our intelligence for your peace of mind."
</p>
```

This is a **hardcoded static quote**, not an AI-generated insight. It appears above the actual `details?.text` from `getActivityDetails()`. The static quote is generic and adds no value — it could be replaced with an actual AI-generated summary or recommendation specific to the activity.

---

### MEDIUM-20: PersonalInsight Framing Is Manipulative

**File**: `types.ts` + `ActivityDetailModal.tsx`

```typescript
export interface PersonalInsight {
  problem: string;  // e.g., "Long queues or sold-out tickets"
  solution: string; // e.g., "Book via our priority partner link below to skip the 2-hour wait."
}
```

The `PersonalInsight` interface is designed as a **problem-solution pattern where the solution always involves using a partner link**. Combined with the "Joy-Protection" label in the modal, this creates a fear-based conversion funnel: "Something bad might happen → book through us to avoid it." This contradicts the altruistic brand image.

**Recommendation**: Separate genuine travel advice from monetization CTAs. The `solution` field should offer genuine advice, with the partner link as an optional convenience.

---

### MEDIUM-21: Over-Saturated Altruistic Language

Across all files, phrases like "Please use us", "altruistic", "joy", "mission", "partners", and "support our mission" appear dozens of times. When every element uses this language, it loses meaning and starts feeling performative. Good UX copywriting is subtle.

**Recommendation**: Reserve mission-language for the About/Story section. In the functional UI, use clear, action-oriented labels.

---

## 4. Extensibility

### CRITICAL-22: localStorage Has No Error Handling or Versioning

**File**: `App.tsx`

```tsx
const stored = localStorage.getItem(STORAGE_KEY_PLANS);
if (stored) setSavedPlans(JSON.parse(stored));
```

Problems:
1. **No try-catch**: If localStorage data is corrupted, `JSON.parse` throws and crashes the app on load
2. **No schema versioning**: If `TravelPlan` type changes (adding/removing fields), old saved plans will have missing fields, causing runtime errors throughout the app
3. **No size limit**: Plans accumulate forever. localStorage has a ~5MB limit; large plans with images could hit this
4. **No migration strategy**: Changing the `STORAGE_KEY_PLANS` key orphans existing data

**Fix**:
```tsx
try {
  const stored = localStorage.getItem(STORAGE_KEY_PLANS);
  if (stored) {
    const parsed = JSON.parse(stored);
    // validate schema version and migrate if needed
    setSavedPlans(Array.isArray(parsed) ? parsed : []);
  }
} catch (e) {
  console.error('Failed to load saved plans:', e);
  localStorage.removeItem(STORAGE_KEY_PLANS);
}
```

---

### HIGH-23: No URL-Based Routing — Tabs Are Ephemeral

**File**: `App.tsx`

Tab state is purely in-memory via `useState<Tab>`. This means:
- Users **cannot bookmark** the Planner or Trending tabs
- **Browser back/forward buttons** don't work for tab navigation
- **Page refresh** always resets to DISCOVER
- **Deep linking** is impossible (e.g., sharing a link to a specific trend)

**Fix**: Use a router (React Router, Next.js, or even hash-based routing) to persist tab state in the URL.

---

### HIGH-24: All State Lives in App.tsx — Scalability Ceiling

**File**: `App.tsx`

The root component manages 15+ state variables: `activeTab`, `searchQuery`, `insights`, `trending`, `itinerary`, `savedPlans`, `loading`, `error`, `budget`, `priority`, `targetAreas`, `isBookingOpen`, `bookingTarget`, `selectedActivity`, `isActivityDetailOpen`, `liveUsers`, `totalSaved`.

This monolithic pattern means:
- Every state change re-renders the entire app tree
- Adding new features (e.g., user accounts, favorites, reviews) will make this file unmanageable
- Testing individual features in isolation is impossible

**Fix**: Extract state into a state management solution (Zustand, Jotai, or at minimum React Context) with separate stores for search, planner, UI modals, and user data.

---

### MEDIUM-25: No API Response Caching

**File**: `App.tsx`

Every search calls `getTravelInsights(query)` fresh. Searching for the same query twice makes two API calls. There's no cache for:
- Previous search results
- Trending topics (fetched once but never refreshed)
- Activity details in ActivityDetailModal

**Fix**: Use SWR, React Query, or a simple in-memory cache with TTL.

---

### MEDIUM-26: `useEffect` Cleanup Does Not Cancel Pending API Calls

**File**: `App.tsx`

```tsx
useEffect(() => {
  handleSearchInternal(q);
  getTrendingTopics().then(setTrending)...
  // ...
  return () => clearInterval(interval); // only cleans up interval
}, []);
```

If the component unmounts while `getTravelInsights` or `getTrendingTopics` is in-flight, the `.then(setInsights)` / `.then(setTrending)` callbacks will attempt to update unmounted state, causing a React warning.

**Fix**: Use AbortController or a mounted-ref pattern to cancel/ignore stale responses.

---

### MEDIUM-27: `ItineraryItem` Has Unused Fields in UI

**File**: `types.ts` vs `App.tsx`

`ItineraryItem` defines rich fields that are **never rendered** in the UI:
- `packageCost` / `individualCost` — not shown
- `dollarPowerMultiplier` — not shown
- `isNoTipSaving` — not shown
- `joyScore` — not shown
- `savingHack` — not shown
- `monetization` — not used in itinerary display

The AI generates this data and it's discarded. Either remove unused fields from the prompt (save tokens) or add UI to display them.

---

## Summary Table

| ID | Severity | Category | Issue |
|---|---|---|---|
| 01 | CRITICAL | Logic | `targetAreas` has no UI input |
| 02 | CRITICAL | Logic | Saved plan click doesn't navigate to Planner |
| 08 | CRITICAL | UX | Mobile users can't see/tap booking button |
| 09 | CRITICAL | UX | Modal has no Escape/backdrop close |
| 22 | CRITICAL | Extensibility | localStorage has no error handling or versioning |
| 03 | HIGH | Logic | Trending failure silently swallowed |
| 10 | HIGH | UX | Modal close→book race condition |
| 11 | HIGH | UX | No error state in ActivityDetailModal |
| 12 | HIGH | UX | Budget accepts invalid values |
| 18 | HIGH | AI Prompt | Altruism messaging contradicts monetization model |
| 19 | HIGH | AI Prompt | Static quote ignores AI-generated content |
| 23 | HIGH | Extensibility | No URL-based routing |
| 24 | HIGH | Extensibility | Monolithic state in App.tsx |
| 04 | MEDIUM | Logic | URL query param is read-only |
| 05 | MEDIUM | Logic | Fake live metrics |
| 13 | MEDIUM | UX | No empty-query feedback |
| 14 | MEDIUM | UX | Loading destroys previous results |
| 15 | MEDIUM | UX | Unnecessary useTransition dimming |
| 20 | MEDIUM | AI Prompt | PersonalInsight is manipulative pattern |
| 21 | MEDIUM | AI Prompt | Over-saturated altruistic language |
| 25 | MEDIUM | Extensibility | No API response caching |
| 26 | MEDIUM | Extensibility | useEffect doesn't cancel API calls |
| 27 | MEDIUM | Extensibility | ItineraryItem has unused fields |
| 06 | LOW | Logic | useEffect missing dependency |
| 07 | LOW | Logic | Default search fires on every page load |
| 16 | LOW | UX | Placeholder founder avatar |
| 17 | LOW | UX | Random images unrelated to activities |

---

## Priority Recommendations (Top 5 Actions)

1. **Fix mobile booking button visibility** (CRITICAL-08) — This is likely "why the booking button doesn't work". Make the CTA always visible or use a tap-to-reveal pattern.

2. **Fix saved plan navigation** (CRITICAL-02) — Add `setActiveTab(Tab.PLANNER)` when clicking a saved plan.

3. **Add `targetAreas` input to Planner** (CRITICAL-01) — Without this, the planner is locked to Tokyo/Osaka/Kyoto.

4. **Add localStorage error handling** (CRITICAL-22) — Wrap JSON.parse in try-catch and add schema versioning.

5. **Add modal accessibility** (CRITICAL-09) — Escape key, focus trapping, backdrop close.

---

*Note: `geminiService.ts` was not provided. A full prompt quality audit requires reviewing the system prompt, temperature settings, and response parsing logic in that file.*
