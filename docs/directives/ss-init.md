# ss-init

The `ss-init` directive runs a JavaScript expression when the element is initialized by SenangStart Actions.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@bookklik/senangstart-actions@latest/dist/senangstart-actions-init.min.js"></script>
```

## Syntax

```html
<div ss-init="expression"></div>
```

## Basic Usage

### Initializing Data

You can use `ss-init` to set up state or log data when a component loads:

```html
<div ss-data="{ count: 0 }" ss-init="console.log('Component mounted!')">
  <span ss-text="count"></span>
</div>
```

### Calling Methods

It's often used to trigger an initial data fetch or setup method:

```html
<div ss-data="{ 
  items: [],
  loadItems() {
    this.items = ['Item 1', 'Item 2']
  }
}" ss-init="loadItems()">
  <ul ss-for="item in items">
    <li ss-text="item"></li>
  </ul>
</div>
```

## Related Directives

- [ss-effect](/directives/ss-effect) - Run side effects reactively
