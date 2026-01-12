---
layout: home

hero:
  name: SenangStart Actions
  text: Declarative UI Framework
  tagline: Declarative UI framework for humans and AI agents
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bookklik/senangstart-actions
  image:
    src: https://senangstart.com/img/use_senangstart.svg
    alt: SenangStart Actions

features:
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>
    title: Lightweight
    details: Minimal footprint with no build step required. Just include the script and start building.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
    title: Reactive
    details: Automatic DOM updates when your data changes. No manual DOM manipulation needed.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h12a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 6 6zM12 3v3M9 3h6M8.25 12a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM15.75 12a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM9 15h6M7.5 18v3M16.5 18v3"></path></svg>
    title: AI-Friendly
    details: Simple, declarative syntax that's easy to understand and generate with AI assistants.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.25 6.75L22.5 12l-5.25 5.25M6.75 17.25L1.5 12l5.25-5.25M14.25 3.75l-4.5 16.5"></path></svg>
    title: Declarative
    details: Use HTML attributes to define behavior. No complex JavaScript required.
---

## Quick Example

```html
<div ss-data="{ count: 0 }">
  <p ss-text="count">0</p>
  <button ss-on:click="count++">Increment</button>
</div>

<script src="https://unpkg.com/@bookklik/senangstart-actions"></script>
```
