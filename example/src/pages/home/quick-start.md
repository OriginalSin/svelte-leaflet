### Quick start with new project

*Note that you will need to have [Node.js](https://nodejs.org) installed*

Create a new project based on [sveltejs/template](https://github.com/sveltejs/template)

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
npm install
```

Add components

```bash
npm install --save-dev svelte-leaflet
```

Modify file `src/App.svelte` in the following way

```html
<Map>
	<TileLayer
		urlTemplate=""
		options={{
			minZoom: 2,
			errorTileUrl: ''
		}}
	/>
</Map>
```

...then start [Rollup](https://rollupjs.org/)

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000)

_NOTE: In real applications, you have to add global styles to `disabled` states_

```css
    .disabled,
    [disabled] {
        opacity: 0.5;
        pointer-events: none;
    }

    .disabled .disabled,
    .disabled [disabled],
    [disabled] .disabled,
    [disabled] [disabled] {
        opacity: 1;
    }
```
