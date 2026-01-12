# Properties

SenangStart Actions provides special properties that are available within any `ss-data` scope. These properties give you access to useful functionality without additional setup.

## Available Properties

| Property | Description |
|----------|-------------|
| [$refs](/properties/refs) | Access elements by reference |
| [$store](/properties/store) | Access global stores |
| [$el](/properties/el) | Current element reference |
| [$event](/properties/event) | Native event object |
| [$dispatch](/properties/dispatch) | Emit custom events |

## Quick Reference

```html
<div ss-data="{}">
  <!-- $refs - Access referenced elements -->
  <input ss-ref="myInput">
  <button ss-on:click="$refs.myInput.focus()">Focus</button>
  
  <!-- $store - Access global stores -->
  <p ss-text="$store.user.name"></p>
  
  <!-- $el - Current element -->
  <div ss-on:click="$el.classList.toggle('active')">Click me</div>
  
  <!-- $event - Event object -->
  <input ss-on:input="console.log($event.target.value)">
  
  <!-- $dispatch - Custom events -->
  <button ss-on:click="$dispatch('notify', { message: 'Hello' })">Send</button>
</div>
```
