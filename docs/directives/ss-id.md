# ss-id

The `ss-id` directive allows you to declare "id scopes" for generating unique, predictable IDs within a component. This is essential for accessibility features like `aria-labelledby` and `aria-describedby` where two elements need to reference each other via a unique ID.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-id.min.js"></script>
```

## Syntax

```html
<div ss-id="['input-id', 'other-id']">...</div>
<!-- or for single ID -->
<div ss-id="'single-id'">...</div>
```

## Basic Usage

When you declare an ID name using `ss-id`, you can access a unique version of that ID using the `$id('name')` magic helper within that element's scope.

### Form Example

```html
<div ss-data="{}" ss-id="['text-input']">
    <label ss-bind:for="$id('text-input')">Username</label>
    <!-- Renders: id="text-input-1" (or similar unique suffix) -->
    <input type="text" ss-bind:id="$id('text-input')">
</div>

<!-- Another instance gets a new ID automatically -->
<div ss-data="{}" ss-id="['text-input']">
    <label ss-bind:for="$id('text-input')">Email</label>
    <!-- Renders: id="text-input-2" -->
    <input type="text" ss-bind:id="$id('text-input')">
</div>
```

## Key Suffixes

You can create related IDs by passing a second argument to `$id()`.

```html
<div ss-id="['field']">
    <label ss-bind:for="$id('field')">Password</label>
    <input type="password" ss-bind:id="$id('field')" ss-bind:aria-describedby="$id('field', 'error')">
    
    <!-- Renders: id="field-1-error" -->
    <p ss-bind:id="$id('field', 'error')" class="error">
        Password must be 8 characters.
    </p>
</div>
```

## Related

- [Magic Properties: $id](/properties/id)
