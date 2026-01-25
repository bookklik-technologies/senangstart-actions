# $id

The `$id` magic property is a helper function used in conjunction with `ss-id` to generate scoped, unique identifiers for accessibility attributes.

## Usage

```javascript
$id(name, key = null)
```

- **name** (String): The name of the ID scope declared in `ss-id`.
- **key** (String, optional): A suffix to create related IDs (e.g., for labels, descriptions, errors).

## Examples

### Basic input-label pair

```html
<div ss-id="['login']">
    <label ss-bind:for="$id('login')">Username</label>
    <input ss-bind:id="$id('login')" type="text">
</div>
```

### Complex component (ARIA)

```html
<div ss-id="['listbox']">
    <button ss-bind:aria-controls="$id('listbox')" aria-haspopup="true">
        Select Item
    </button>
    
    <ul ss-bind:id="$id('listbox')" role="listbox">
        ...
    </ul>
</div>
```

## Related

- [Directives: ss-id](/directives/ss-id)
