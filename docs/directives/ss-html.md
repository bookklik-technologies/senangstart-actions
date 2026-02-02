# ss-html

The `ss-html` directive updates the element's `innerHTML` based on the evaluated expression.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-html.min.js"></script>
```

## Syntax

```html
<div ss-html="expression"></div>
```

## Basic Usage

### Displaying HTML Content

Pass a string containing HTML:

```html
<div ss-data="{ content: '<strong>Hello World</strong>' }">
  <div ss-html="content"></div>
</div>
```

This will render:

```html
<div><strong>Hello World</strong></div>
```

> [!WARNING]
> Dynamically rendering HTML can be dangerous and lead to XSS vulnerabilities. Only use `ss-html` on trusted content and never on user-provided input without sanitization.

## Related Directives

- [ss-text](/directives/ss-text) - Update text content
