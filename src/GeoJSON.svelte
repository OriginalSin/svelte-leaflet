<script>
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';

    import TileServers from './TileServers.js';
    import { onMount, getContext } from 'svelte';

	let landsat8 = TileServers['landsat8'];
	export let url;
	export let options;

    onMount(() => {
		L.Map.addInitHook(function() {
			const map = this;
			fetch(url || landsat8.url)
			.then(req => req.json())
			.then(json => {
				L.geoJson(json, options)
				.bindPopup(function (layer) {
					return JSON.stringify(layer.feature.properties, null, 2);
				}).addTo(map);
			});
		});
    });
        
</script>

<div>
    <slot></slot>
</div>

<style>

</style>
