<script>
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';

    import TileServers from './TileServers.js';
    import { onMount, getContext } from 'svelte';
    // import T from 'scanex-translations';

    onMount(() => {
		L.Map.addInitHook(function() {
			const map = this;
			const {url, attribution} = TileServers['osm.mapnik'];
			L.tileLayer(url, {
				attribution,            
				maxZoom: 18,
				id: 'osm.mapnik'
			}).addTo(map);                       
		});
    });
        
</script>

<div>
    <slot></slot>
</div>

<style>

</style>
