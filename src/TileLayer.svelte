<script>
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';

    import TileServers from './TileServers.js';
    import { onMount, getContext } from 'svelte';

	const mapnik = TileServers['osm.mapnik'];
	export let url = mapnik.url;
	export let options = mapnik;

    onMount(() => {
		L.Map.addInitHook(function() {
			const map = this;
			L.tileLayer(url, options).addTo(map);
		});
    });
        
</script>

<div>
    <slot></slot>
</div>

<style>

</style>
