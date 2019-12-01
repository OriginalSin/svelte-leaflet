# svelte-leaflet

Set of the Leaflet components for [Svelte](https://svelte.dev) 

[View the demo](https://originalsin.github.io/svelte-leaflet/example/public)

## Installation

_Note that you will need to have [Node.js](https://nodejs.org) installed_

```bash
npm install --save-dev @vikignt/svelte-ui
```

## Usage

```html
<Textfield bind:value filled label="Name" message="Enter your name" />

<h1>Hello {value}!</h1>

<script>
    // import any components you want
    import { Textfield } from '@vikignt/svelte-ui';

    let value = 'world';
</script>
```

This code on the [Svelte REPL](https://svelte.dev/repl/5cae739a3a2f4208a48fd2822061b164?version=3.12.1)

## Quick start with new project

Create a new project based on [sveltejs/template](https://github.com/sveltejs/template)

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
npm install
```

## Get started with an example

Clone repo [svelte-leaflet](https://github.com/OriginalSin/svelte-leaflet)

```bash
git clone https://github.com/OriginalSin/svelte-leaflet
```

Then explore the __example__

```bash
cd svelte-leaflet/example
npm install
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000)
