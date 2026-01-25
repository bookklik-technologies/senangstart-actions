# ss-transition

The `ss-transition` directive allows you to apply CSS transitions to elements when they are entering or leaving the DOM (toggled via `ss-show` or `ss-if`).

## Syntax

```html
<!-- Simple default -->
<div ss-show="open" ss-transition></div>

<!-- With Modifiers -->
<div ss-show="open" ss-transition.duration.500ms.scale.90></div>

<!-- Detailed control -->
<div ss-show="open" 
     ss-transition:enter.duration.200ms.ease-out
     ss-transition:leave.duration.100ms.ease-in>
</div>
```

## Modifiers

SenangStart provides a shorthand syntax for configuring transitions directly in the attribute.

| Modifier | Description | Example |
| :--- | :--- | :--- |
| `.duration.{ms}` | Set transition duration | `.duration.300ms`, `.duration.2s` |
| `.delay.{ms}` | Set transition delay | `.delay.100ms` |
| `.opacity.{0-100}` | Set starting/ending opacity | `.opacity.0` (fade in from 0) |
| `.scale.{0-100}` | Set starting/ending scale | `.scale.90` (scale up from 0.9) |
| `.easing.{name}` | Set timing function | `.easing.ease-out`, `.easing.linear` |

### Modifiers Example

```html
<div ss-show="open" 
     ss-transition.duration.300ms.opacity.0.scale.80.easing.ease-out>
  I will fade in, scale up, and ease out!
</div>
```

This effectively sets:
- **Enter**: Start at `opacity: 0`, `transform: scale(0.8)`. Transition to `1` / `1.0` over `300ms`.
- **Leave**: Transition from `1` / `1.0` back to `opacity: 0`, `transform: scale(0.8)` over `300ms`.

## Specific Phases

You can customize *Enter* and *Leave* phases separately using `ss-transition:enter` and `ss-transition:leave`.

```html
<div ss-show="open"
     ss-transition:enter.duration.500ms.delay.200ms
     ss-transition:leave.duration.100ms>
     
    I enter slowly after a delay, but leave quickly.
</div>
```

## Class-Based Transitions

If you prefer using CSS classes (compatible with Vue/Alpine class conventions), `ss-transition` without modifiers (or alongside them) applies the following classes during the lifecycle:

| Class | Applied When | Description |
| :--- | :--- | :--- |
| `ss-enter-from` | Starting frame of enter | Initial state (e.g. `opacity: 0`) |
| `ss-enter-active`| During enter phase | Transition properties (e.g. `transition: opacity 200ms`) |
| `ss-enter-to` | Ending frame of enter | Final state (e.g. `opacity: 1`) |
| `ss-leave-from` | Starting frame of leave | Initial state before leaving |
| `ss-leave-active`| During leave phase | Transition properties |
| `ss-leave-to` | Ending frame of leave | Final state after leaving |

**Note**: If you use modifiers like `.duration`, inline styles will simulate the `*-active` classes, but `*-from` and `*-to` classes are still toggled to help you track state.

### CSS Example

```css
.ss-enter-active, .ss-leave-active {
    transition: all 0.5s ease;
}
.ss-enter-from, .ss-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
```

```html
<div ss-show="open" ss-transition>
   Content using simple CSS classes
</div>
```
