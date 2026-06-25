# xmllm — Bug Tracker & TDD Remediation Plan

Living document tracking defects found during a familiarity/bug-hunt pass and the
test-driven plan to fix them. Each bug has a stable ID (`BUG-NN`) used in test
names and commit messages so fixes are traceable to regression coverage.

---

## 0.3.9 follow-ups (all FIXED, each Red→Green; suite 753 passing)

Resolves the items deferred from 0.3.8, plus a packaging gap found during the published smoke test. Read-only adversarial review: no correctness blockers.

| ID | Fix | Behavior change? |
|----|-----|------------------|
| BUG-22 | `reinitializeCache` now refreshes `cachePromise`, so `configure({cache})` actually takes effect at runtime (also makes the BUG-19 ttl fix real) | **yes** — shrinking cache capacity now genuinely evicts (was a silent no-op) |
| BUG-23 | Proper concurrent coalescing (content-promise replay + cleanup on settle) replacing the dead stub removed in 0.3.8; one upstream call serves overlapping identical requests, joiners get the COMPLETE body | no (new capability) |
| BUG-24 | `String`/`[String]` mapping now trims, consistent with `Number`/`Boolean`/`types.string()` and the documented `[String]` ≡ `types.items(types.string())` | **yes** — extracted string values are trimmed; mid-stream boundary whitespace shifts to the next delta. Internal whitespace preserved. |
| pkg | `exports` now exposes `./package.json` (so `require('xmllm/package.json')` works); bin path de-prefixed (`npm pkg fix`); added `prepublishOnly: npm run build` so `dist/` can never ship stale | no |

**Known limitations / follow-ups (non-blocking, from the review):**
- BUG-23 joiners hold a p-queue concurrency slot while parked (head-of-line blocking under bursts of identical slow requests; not a deadlock). A lazier join inside the returned stream's `start()` would avoid it.
- BUG-23 coalescing only spans the concurrency window; without caching, requests queued beyond the window still fetch independently.
- BUG-23 cancel/abnormal-exit is guarded by a `finally` backstop that settles the coalescing promise (joiners retry rather than hang); not exercised by current callers.

**Baseline:** `pnpm install && npm test` → **722/722 tests pass**. The lone failing
*suite*, `tests/integration-package/esm.test.mjs`, is a jest package self-reference
resolution limitation (bare `import 'xmllm'` with no `node_modules/xmllm`), **not** a
product bug — its CJS twin passes by requiring from `dist`.

**Status legend:** `OPEN` · `TEST-WRITTEN` (failing test committed, red) · `FIXED`
(green + full suite passing) · `WONTFIX` · `NEEDS-DECISION` (intended behavior must be
confirmed before writing the pinning test).

**Repro legend:** ⛏️ reproduced empirically · 🔎 verified by code inspection · 🌐 found via live API.

---

## Resolution status — ALL FIXED ✅ (branch `fix/bug-remediation`)

All 19 tracked bugs (+ BUG-20 found during the work) are fixed, each with a strict
Red→Green regression test. Suite: **749 passing** (was 722; +27 new tests), 0 regressions.
`dist/` intentionally not rebuilt — run `npm run build` before publish.

A read-only multi-agent adversarial review of the diff returned **SHIP — no blocking
issues**. Its genuine low-severity findings were then hardened in-place:
- **BUG-02** key now also includes `max_completion_tokens` (the o-series response-length
  alias) — closes the same collision class for o1/o3/o4 requests.
- **BUG-08** `getProviderByPreference` now uses the shared `isUnusableKey` (parity with
  `createCustomProvider`: treats `''`/`NO_KEY` as unusable, not just `null`).
- **BUG-07** added a test pinning the new 429 fail-fast-at-manager behavior.
- **BUG-12** invalid `forcedConcurrency` (NaN/negative/non-integer) is now ignored
  instead of throwing in p-queue; `soonestReset`→`latestResetInMs` rename (BUG-16) for clarity.
- **BUG-01 parity**: client-side `simple()` (`xmllm-client.mjs`) no longer mutates the
  caller's options object (mirrors the main-side immutable threading).
- **BUG-11** test relabelled as a behavioral guard (dead-code removal is green-both-ways).

| ID | Resolution | Test(s) added |
|----|-----------|---------------|
| BUG-01 | `simple()` threads resolved mode → `stream()`; dead `config` removed | `xmllm.simple.test.mjs` |
| BUG-02 | `max_tokens`/`stop` added to key; extracted pure `deriveCacheKey`; `CACHE_VERSION`→`1.1` | `Stream.deriveCacheKey.test.mjs` |
| BUG-03 | `estimateMessagesTokens(payload.messages)` at both sites | `Provider.test.mjs` |
| BUG-04 | null-key throws first; no more `Bearer undefined` | `Provider.test.mjs` |
| BUG-05 | `window` validated as positive finite | `ResourceLimiter.test.mjs` |
| BUG-06 | split provider:model on first colon only (+ sibling in `ValidationService`) | `ProviderManager.test.mjs` |
| BUG-07 | retries gated on `shouldRetry`; timeouts kept retryable | `ProviderManager.test.mjs` |
| BUG-08 | warn only when effective key (custom OR inherited) is unusable | `ProviderManager.test.mjs` |
| BUG-09 | `retryDelay` reset per provider | `ProviderManager.test.mjs` |
| BUG-10 | delay guard `retry < MAX` (delay before final retry) | `ProviderManager.test.mjs` |
| BUG-11 | **REMOVED** dead `ongoingRequests` tee coalescing | `Stream.queue.test.mjs` (guard) |
| BUG-12 | live `queue.concurrency` update each call; `_resetStreamState`/`_getConcurrency` hooks | `Stream.queue.test.mjs` |
| BUG-13 | added `o4` to the o-series regex (minimal) | `Provider.test.mjs` |
| BUG-14 | throw `ProviderError` on unrecognized 200 (not silent `undefined`) | `Provider.test.mjs` |
| BUG-15 | `parseRetryAfter` handles delta-seconds, HTTP-date, missing → finite | `Provider.test.mjs` |
| BUG-16 | rate-limit reset derived from tripped buckets (no `limits.rpm` assumption) | `Provider.test.mjs` |
| BUG-17 | **REMOVED** dead `purgeOldEntries` + unwired `purgeInterval`/`memoryCheckInterval` | suite guard |
| BUG-18 | `calculateExpiry` honors explicit `ttl: 0` | `mainCache.test.mjs` |
| BUG-19 | `reinitializeCache` builds LRU with `ttl` (matches init) | `mainCache.reinit-ttl.test.mjs` |
| BUG-20 | removed stray `console.log('err debug'…)` from `ProviderError` ctor (found mid-work) | `Provider.test.mjs` |

**NEEDS-DECISION outcomes** (decided against existing paradigms — cache = dedup, lru-cache = eviction):
- **BUG-11 → REMOVE.** The cache is the dedup paradigm; the tee path was dead *and* its naive repair truncates late joiners. Removed; correct concurrent-coalescing tracked as **BUG-23 (enhancement)** below.
- **BUG-12 → live-resize.** p-queue supports live `.concurrency`; honor the existing knob every call (global, last-writer-wins).
- **BUG-17 → REMOVE.** Eviction/expiry already owned by lru-cache + `expires` + on-demand `clearExpired`. Removed dead/wrong purge; kept exported on-demand helpers.

**New follow-ups surfaced during the work (not yet fixed):**
- **BUG-22** (P3, deferred): `reinitializeCache()` reassigns `cache` but never refreshes `cachePromise`, so `configure({cache})` reinit is inert at runtime (the live cache is reached via `cachePromise`). The BUG-19 ttl fix is correct but only observable via the LRU constructor until this wiring is addressed. Needs a decision: make `configure` reinit effective (refresh `cachePromise`) vs. document reset-required.
- **BUG-23** (enhancement): proper concurrent in-flight coalescing (tee-before-read + spare-branch + cleanup), if desired — replaces the removed BUG-11 stub.

---

## Triage / Priority

| ID | Severity | Pri | Title | Area | Behavior-changing? |
|----|----------|-----|-------|------|--------------------|
| BUG-06 | High | **P0** | Model ids containing `:` truncated (`:free`/`:nitro`/…) | ProviderManager | no (fixes broken case) |
| BUG-07 | High | **P0** | Permanent 4xx (404/400) retried full attempt count | ProviderManager | yes (fail-fast) |
| BUG-02 | High | **P0** | Cache key omits `max_tokens`/`stop` → stale/truncated hits | Stream/cache | yes (cache keys change) |
| BUG-01 | Medium | **P1** | `simple()` discards config → runs `state_open` not `state_closed` | Public API | yes (output for partial streams) |
| BUG-03 | Medium | **P1** | tpm estimate computed from `"[object Object]"` | Provider | no |
| BUG-08 | Medium | **P1** | "No API key" warning logic inverted | ProviderManager | no (diagnostics) |
| BUG-09 | Medium | **P1** | `retryDelay` leaks across providers in fallback loop | ProviderManager | no |
| BUG-04 | Medium | **P1** | `getHeaders()` null-key throw is dead code → `Bearer undefined` | Provider | yes (throws earlier) |
| BUG-05 | Low | **P2** | ResourceLimiter: missing `window` → `resetTime` NaN → permanent jam | ResourceLimiter | no (adds validation) |
| BUG-10 | Low | **P2** | Backoff off-by-one: no delay before final retry | ProviderManager | no |
| BUG-13 | Low | **P2** | o-series regex drift (`o1|o3` vs `o1|o3|o4`) | Provider/PROVIDERS | no |
| BUG-14 | Low | **P2** | `attemptRequest` returns `undefined` (silent success) on odd 200 | Provider | yes (throws) |
| BUG-15 | Low | **P2** | `Retry-After` parse → `NaN` for HTTP-date / missing header | Provider | no |
| BUG-16 | Low | **P2** | Rate-limit error assumes `limits.rpm` exists → TypeError | Provider | no |
| BUG-11 | Low | **P2** | In-flight dedup/`tee` is dead code (never registered) | Stream | NEEDS-DECISION |
| BUG-12 | Low | **P2** | `forcedConcurrency` honored only on first-ever call | Stream | NEEDS-DECISION |
| BUG-17 | Trivial | **P3** | `purgeOldEntries` hardcodes 5-day TTL & is never scheduled | mainCache | NEEDS-DECISION |
| BUG-18 | Trivial | **P3** | `calculateExpiry(0)` treats `ttl:0` as default 5 days | mainCache | no |
| BUG-19 | Trivial | **P3** | `reinitializeCache` drops native LRU `ttl` that init sets | mainCache | no |

**Priority rationale**
- **P0** = breaks real usage *today* or silently returns wrong data. BUG-06 makes the
  documented `provider:model` string syntax unusable for most of the OpenRouter catalog;
  BUG-07 burns latency/quota on permanent errors; BUG-02 can serve a truncated cached
  answer for a larger request (a correctness bug, opt-in via caching).
- **P1** = genuine logic/behavior errors with clear correct fixes, lower blast radius.
- **P2** = robustness/edge/latent — real but needs misconfiguration, an unusual response,
  or only degrades diagnostics/efficiency.
- **P3** = dead/unwired code; fix or delete, low risk either way.

**Suggested batching into reviewable PRs**
1. **PR-1 (P0 provider routing):** BUG-06, BUG-07 (+ BUG-13, BUG-15, BUG-16 ride along — same files).
2. **PR-2 (P0 cache correctness):** BUG-02 (+ BUG-18, BUG-19 cache cleanup).
3. **PR-3 (P1 public API + provider):** BUG-01, BUG-03, BUG-04, BUG-08, BUG-09.
4. **PR-4 (P2 robustness):** BUG-05, BUG-10, BUG-14.
5. **PR-5 (decisions):** BUG-11, BUG-12, BUG-17 — resolve intent first, then fix or remove.

---

## TDD remediation methodology

Every fix follows a strict **Red → Green → Refactor** loop. The test is written *first*
and is the deliverable that prevents regression.

1. **RED — pin the correct behavior.** Write a test asserting the *intended* result and
   run only that test. Confirm it fails **for the right reason** (assertion mismatch, not
   a setup/import error). This proves the bug exists *and* that the test can detect it.
   For `NEEDS-DECISION` bugs, first agree the intended behavior, then write the test.
2. **GREEN — minimal fix.** Change the smallest amount of code to pass. Run the new test,
   then `npm test` in full (all 722 must stay green).
3. **REFACTOR.** Tidy; re-run full suite.
4. **COMMIT.** One commit per bug (or tight same-file group). Message: `fix(BUG-NN): …`.
   Reference the test file. Update this doc's status column.

**Test levels — use the cheapest that captures the bug:**

| Level | Mechanism | Use for |
|-------|-----------|---------|
| **L1 unit** | import module, call function directly | BUG-03 (estimateTokens), BUG-04 (getHeaders), BUG-05 (ResourceLimiter), BUG-13/15/16, BUG-18/19 |
| **L2 component + mock I/O** | `Provider.setGlobalFetch(fakeFetch)`; `ProviderManager` direct; `mainCache` with `setFileOps`/`_reset` | BUG-06, BUG-07, BUG-08, BUG-09, BUG-10, BUG-14 |
| **L3 public API + injected stream** | `stream(prompt,{ llmStream })` / mocked fetch + isolated cache | BUG-01, BUG-02, BUG-11, BUG-12 |
| **L4 live smoke (opt-in, not CI)** | real provider, gated `if (!process.env.OPENROUTER_API_KEY) test.skip` | end-to-end sanity; catches catalog-shaped issues like BUG-06/07 |

**Conventions**
- Co-locate each regression test in the relevant existing suite (e.g. `tests/ProviderManager.test.mjs`)
  inside a `describe('BUG-06: colon model ids', …)` block, so module coverage stays cohesive
  and the bug id is greppable.
- Determinism: never assert on live LLM text. Mock fetch/streams; assert on parsed
  structure, request payloads, retry counts, cache keys, thrown error types.
- Isolation: reset global singletons between tests — `resetConfig()` (config + cache),
  `mainCache._reset()`, and create fresh `ProviderManager`/`ResourceLimiter` instances.
  The module-level `queue`/`ongoingRequests` in `Stream.mjs` are shared (see BUG-11/12) —
  prefer L3 tests that don't depend on queue identity, or expose a reset hook as part of the fix.
- **Coverage:** add `jest --coverage` (start by reporting, then set per-file thresholds on
  touched modules and ratchet upward). Target ≥90% lines on `Provider`, `ProviderManager`,
  `Stream`, `ResourceLimiter`, `mainCache`, `xmllm-main` once this effort lands.

---

## Bug details

### BUG-06 · Model ids containing `:` are truncated · P0 · 🌐⛏️
`ProviderManager.mjs:68` — `let [providerName, modelName] = preference.split(':')`.
For `openrouter:meta-llama/llama-3.3-70b-instruct:free`, `split(':')` returns 3 parts and
destructuring keeps the first two, so `modelName` becomes
`meta-llama/llama-3.3-70b-instruct` — the `:free` suffix is dropped. Breaks OpenRouter's
`:free`/`:nitro`/`:floor`/`:beta`/`:extended` variants via the documented `provider:model`
string syntax. Object form `{inherit,name}` is unaffected.
- **Fix:** split on the first colon only (`const i = preference.indexOf(':')`).
- **Test (L2):** `getProviderByPreference('openrouter:vendor/model:free')` ⇒ resolved model
  name `=== 'vendor/model:free'`. Add an L4 skip-unless-key live assertion that the request 404s before fix.

### BUG-07 · Permanent 4xx retried full attempt count · P0 · 🌐
`ProviderManager.mjs:116-173` (`pickProviderWithFallback`) only short-circuits on
`ProviderAuthenticationError` and special-cases `statusCode === 500`. A 404/400
`ProviderNetworkError` is retried `MAX_RETRIES_PER_PROVIDER+1` times. `Provider.shouldRetry()`
(`Provider.mjs:578-607`) already classifies these as non-transient — the orchestrator just
doesn't consult it. 429s are likewise hammered without honoring `Retry-After`.
- **Fix:** consult a retryability predicate (reuse/lift `shouldRetry`); break immediately on
  non-transient errors. Decide 429 policy (respect `resetInMs`/`Retry-After`).
- **Test (L2):** fake fetch returns 404 → assert exactly **1** attempt then throw; returns
  500 → assert it still retries; 401 → 1 attempt (existing behavior).

### BUG-02 · Cache key omits `max_tokens`/`stop` · P0 · ⛏️
`Stream.mjs:74-85` builds `cacheKeyParams` from messages/model/temperature/top_p/penalties/system
only. Two identical prompts differing solely in `max_tokens` (50 vs 2000) hash identically —
reproduced: one network call, the 2000-token request served the 50-token cached body.
- **Fix:** include `max_tokens`/`maxTokens` and `stop`/`stop_sequences` in the key; bump
  `CACHE_VERSION`. Consider extracting key derivation into a pure exported function for L1 testing.
- **Test (L1 if extracted, else L3):** keys for `{…,max_tokens:50}` vs `{…,max_tokens:2000}`
  differ; otherwise-identical requests still share a key. L3: mocked fetch returns distinct
  bodies per call; second request with larger `max_tokens` triggers a **second** fetch.

### BUG-01 · `simple()` ignores its own config (mode) · P1 · ⛏️
`xmllm-main.mjs:142-169` computes `config`, sets `config.mode ||= 'state_closed'`, then
`return stream(promptOrConfig, options).last()` — discarding `config`. So `simple()` runs in
`stream()`'s default `state_open`. For truncated output: `<name>Daisy</name><name>Whiskers`
yields `["Daisy","Whiskers"]` (partial, unclosed included) instead of the intended `["Daisy"]`.
- **Fix:** pass the merged `config` (with mode) through to `stream`, or set the mode default in
  one place. Beware double validation / key-merge already done by `stream`.
- **Test (L3):** `simple(prompt,{schema, llmStream: fakeStream('<name>Daisy</name><name>Whiskers')})`
  ⇒ `{name:["Daisy"]}`; equals `state_closed`, differs from `state_open`.

### BUG-03 · tpm estimate from `messages.join('')` · P1 · ⛏️
`Provider.mjs:150` & `:502` — `estimateTokens(payload.messages.join(''))` stringifies the
message objects to `"[object Object]…"` (8000 chars of content estimated as ~10 tokens vs
~2668). `estimateMessagesTokens` is imported (`:17`) but unused.
- **Fix:** `estimateMessagesTokens(payload.messages)`.
- **Test (L1):** `estimateMessagesTokens([{role,content:'A'.repeat(4000)},…]) > 1000` and ≫ the
  old join value. Optionally L2: assert the tpm amount consumed reflects content length.

### BUG-08 · Inverted "No API key" warning · P1 · 🔎
`ProviderManager.mjs:225-238` — `if (!( key==null || …NO_KEY… )) logger.error('No API key…')`
logs precisely when a **valid** key is present and stays silent when it's missing.
- **Fix:** drop the negation (warn when the effective key *is* null/empty/`NO_KEY`).
- **Test (L2):** spy on logger; missing key ⇒ warned once; present key ⇒ not warned.

### BUG-09 · `retryDelay` leaks across providers · P1 · 🔎
`ProviderManager.mjs:107,170` — `retryDelay` declared once outside the provider loop and
mutated via `retryDelay *= backoffMultiplier`; never reset, so each fallback provider inherits
the previous provider's inflated backoff.
- **Fix:** reset per provider (compute base inside the `for (preference …)` loop).
- **Test (L2):** stub `delay`/timers, capture delays; two failing providers ⇒ the 2nd starts at
  base delay, not continued growth.

### BUG-04 · `getHeaders()` null-key throw is dead code · P1 · ⛏️
`Provider.mjs:614-618` — for `key == null` the first branch is truthy, so it sets
`Authorization: "Bearer undefined"`; the `else if (this.key == null) throw` is unreachable.
- **Fix:** check null first (throw), then build header.
- **Test (L1):** `new Provider('p',{key:undefined,…}).getHeaders()` throws; with a real key,
  returns `Bearer <key>`; `NO_KEY`/`''` ⇒ no Authorization header (existing behavior).

### BUG-05 · ResourceLimiter NaN window · P2 · ⛏️
`ResourceLimiter.mjs:35` — `config.window <= 0` doesn't catch `undefined`; `resetTime` becomes
`NaN`, so `now >= NaN` is always false and the bucket never refills.
- **Fix:** require a positive finite `window` (throw on missing/invalid).
- **Test (L1):** `new ResourceLimiter({rpm:{limit:2}})` (no window) throws; with a valid window,
  exhaust-then-advance-time resets.

### BUG-10 · Backoff off-by-one · P2 · 🔎
`ProviderManager.mjs:163` — `if (retry < MAX_RETRIES_PER_PROVIDER - 1)` skips the delay before
the final retry (loop runs `0..MAX`).
- **Fix:** `retry < MAX_RETRIES_PER_PROVIDER` (delay before every retry except after the last attempt).
- **Test (L2):** count delays for MAX=3 ⇒ 3 delays across 4 attempts (or agreed semantics).

### BUG-13 · o-series regex drift · P2 · 🔎
`Provider.mjs:644` `/^(?:o1|o3)/` vs `PROVIDERS.mjs:84` `/^(?:o1|o3|o4)/`. For `o4*` models the
truncation `maxTokensParam`/`responseTokens` (`Provider.mjs:648,659`) diverge from the payloader.
- **Fix:** single shared `isOSeriesModel()` helper.
- **Test (L1/L2):** `o4-mini` classified consistently; payload uses `max_completion_tokens`.

### BUG-14 · Silent `undefined` success · P2 · 🔎
`Provider.mjs:217-220` — a 200 matching neither `content[0].text` nor `choices[0].message`
returns `undefined`, treated as success (resets circuit breaker).
- **Fix:** throw a `ProviderError` for unrecognized shapes.
- **Test (L2):** fake fetch returns `{}` 200 ⇒ throws, not silent `undefined`.

### BUG-15 · `Retry-After` → NaN · P2 · 🔎
`Provider.mjs:285-288` — `parseInt(retryAfter)*1000` is `NaN` for HTTP-date form or missing header.
- **Fix:** parse delta-seconds and HTTP-date; default sanely when absent.
- **Test (L2):** 429 with numeric, date, and absent `Retry-After` ⇒ finite `resetInMs`.

### BUG-16 · Rate-limit error assumes `rpm` bucket · P2 · 🔎
`Provider.mjs:160,509` — `limitCheck.limits.rpm.resetInMs` throws `TypeError` when only a
tpm/rph bucket trips and no rpm bucket exists (rpm defaults to `Infinity`, deleted by `setLimits`).
- **Fix:** derive `resetInMs` from the tripped buckets, not a hardcoded `rpm`.
- **Test (L2):** provider with only `tokensPerMinute`, exhaust tpm ⇒ `ProviderRateLimitError`, no TypeError.

### BUG-11 · In-flight dedup/`tee` dead code · P2 · NEEDS-DECISION · 🔎
`Stream.mjs:102-109` — `ongoingRequests.set(hash, …)` only runs inside the branch that requires
a prior `set`; fresh requests never register, so identical concurrent requests all hit the
provider and the `tee()` path is unreachable.
- **Decision needed:** is in-flight coalescing wanted? If yes, register the pending stream
  before awaiting and clean up on settle (and make the map testable/resettable). If no, delete it.
- **Test (L3):** two concurrent identical requests ⇒ exactly one fetch; both receive content.

### BUG-12 · `forcedConcurrency` only first call · P2 · NEEDS-DECISION · 🔎
`Stream.mjs:47` — module singleton `queue = queue || new PQueue(...)` ignores later
`forcedConcurrency`. Decide whether concurrency is global-immutable (document it) or
per-config (recreate/resize queue). Add a reset hook for tests either way.

### BUG-17 · `purgeOldEntries` hardcoded & unwired · P3 · NEEDS-DECISION · 🔎
`mainCache.mjs:392-405` uses a constant 5-day period (ignoring configured `ttl`) and is never
scheduled (`purgeInterval` only cleared, never set); `checkMemoryPressure`/`memoryCheckInterval`
likewise unwired. Decide: wire them up (and key off `expires`/`ttl`) or delete the dead code.

### BUG-18 · `calculateExpiry(0)` → default TTL · P3 · 🔎
`mainCache.mjs:159-162` — `ttl:0` falls through `ttl || CONFIG.ttl` to the 5-day default.
Internal `set(key,val,ttl)` path only (public flow passes no ttl). Fix to honor explicit 0.
- **Test (L1):** `calculateExpiry(0)` ⇒ immediate/explicit, not default.

### BUG-19 · `reinitializeCache` drops native `ttl` · P3 · 🔎
`mainCache.mjs:174-181` omits `ttl: CONFIG.ttl` that `initializeCache` (`:273-280`) sets;
post-`configure()` the LRU loses native expiry (manual `expires` check still applies).
- **Fix:** include `ttl` in the reinit options. **Test (L2):** entries expire by native ttl after reconfigure.

---

## Not bugs (checked, documented to prevent re-flagging)
- `cache: null` looks like it would crash `Stream.mjs:68` (`typeof null === 'object'` → `null.read`),
  but `ValidationService.validateLLMPayload` (`:207-231`) rejects it first — unreachable via the public API.
- `tests/integration-package/esm.test.mjs` failure = jest self-reference resolution, not a defect.
- "A worker process failed to exit gracefully" in jest = open timers (`mainCache` persistInterval / lru-cache / p-queue), a teardown nuisance, not a correctness bug.
