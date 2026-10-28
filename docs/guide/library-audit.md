# Library audit — October 28, 2026

This source-level audit covers the reactive runtime, expression evaluator,
DOM initialization and teardown, structural and form directives, legacy handler
compatibility, and full/modular build configuration. It is not an exhaustive
security assessment or a certification of browser behavior.

## Corrected findings

### High impact

- Reactive objects previously shared subscriptions by property name across
  unrelated nested targets. Proxies are now cached per target, subscriptions are
  target-specific, and cyclic references preserve identity.
- Array symbol access could throw during iteration. Array mutations, index
  extension, deletion, and length truncation now participate in dependency tracking.
- Nested effects lost their outer tracking context. Reruns now remove stale
  branch dependencies and restore the previous active effect.
- The scheduler discarded distinct update callbacks in the same batch. Each
  distinct callback now runs once, with errors isolated from other callbacks.
- Expression evaluation eagerly read every data property, including unrelated
  getters, and turned arbitrary object keys into invalid function parameters.
  Expressions now resolve properties on demand.
- Removed DOM retained reactive effects and global event listeners. Effects have
  DOM owners; structural replacement and observed removals dispose subscriptions,
  event listeners, references, and teleported content.
- `ss-model` wrote dotted/bracketed paths as literal object keys. Assignments now
  target the actual member expression, and select controls listen to `change`.
- `ss-for` copied parent state into disconnected snapshots and serialized lists
  with JSON. Loop scopes now delegate parent reads/writes, and cyclic data no
  longer fails serialization.

### Correctness and consistency

- Repeated initialization no longer recreates existing component state or attaches
  duplicate listeners. The observer continues past initialized additions instead
  of abandoning the remaining mutation batch.
- `ss-if` retains its DOM while its condition remains truthy. Structural
  directives preserve text nodes, clean nested template regions, and reject
  non-template hosts with a diagnostic.
- Nested `ss-id` declarations no longer mutate an ancestor's ID map. Executors
  expose `$id`, and ID key `0` is retained.
- `$event` is evaluation-local rather than temporarily overwriting component data.
- Class/style bindings tolerate null values, remove stale dynamic contributions,
  and preserve unrelated static values.
- Legacy handlers delegate to the production directive implementations, so their
  existing unit coverage no longer exercises duplicate implementations.
- Registry and registration dictionaries no longer resolve inherited prototype
  keys as registered directives or factories.
- Null store registrations are rejected. Importing the library outside a DOM
  environment no longer calls `document` during automatic startup.
- The public version and API examples match package version 0.1.7. Bundle banners
  now read their version from `package.json`.

## Regression coverage and validation

New unit and integration regression cases cover the findings above, including
the real installed directive path, observer batches, and component teardown.
With user approval, `npm run test` completed successfully: **18 test files and
145 tests passed**, including the new regression cases. JavaScript syntax checks,
production bundle builds, and the documentation build also passed.

## Remaining limitations and follow-up work

- `ss-for` still rebuilds rows after collection changes; keyed reconciliation is
  not implemented, so collection mutations can lose row-local DOM state.
- Form binding remains scalar: checkbox-array binding, multi-select arrays,
  model modifiers, and automatic number conversion are not implemented.
- Transition interruption and completion fallback remain follow-up work: rapid
  visibility changes or missing `transitionend` events can leave stale classes
  or pending transition listeners. Browser-level transition coverage is needed.
- `$watch` observes a named top-level property, not arbitrary nested paths or
  deep mutations. Watcher callbacks are scheduled after reactive processing.
- `Date`, `Map`, `Set`, and class instances are left unproxied; their internal
  mutations are not reactive.
- Expressions use dynamic JavaScript compilation and are **not a sandbox**.
  Directive expressions must be trusted. `ss-html` does not sanitize HTML.
- Runtime expression errors, invalid scope factory results, and malformed
  teleport selectors still need a consistent framework-wide recovery policy.

Before release, manually verify forms, transitions, dynamic insertion/removal, and modular script loading
in supported browsers. The release workflow still requires updating the public
runtime version when changing the package version.
