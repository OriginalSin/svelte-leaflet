<script>
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';

    // import TileServers from './TileServers.js';
    import { onMount, getContext } from 'svelte';
    // import T from 'scanex-translations';

    // import './Map.css';

    let mapContainer;    
    let leafletMap;    

    export let center = [47.52685546875001, 44.88701247981298];
    export let zoom = 6;

    // const headerHeight = getContext ('headerHeight');    

    onMount(() => {
        leafletMap = L.map(mapContainer, {
            svgSprite: false,
            zoomControl: false,
			center: center,
			zoom: zoom
		});
// console.log('tilePane', leafletMap._panes.tilePane, leafletMap.getPane('tilePane'));
        // const {url, attribution} = TileServers['osm.mapnik'];
        // L.tileLayer(url, {
            // attribution,            
            // maxZoom: 18,
            // id: 'osm.mapnik'
        // }).addTo(leafletMap);                       

        resize();
    });    

    const resize = () => {
        // mapContainer.style.height = `${window.innerHeight - headerHeight}px`;
        leafletMap.invalidateSize();
    };
        
</script>

<svelte:window on:resize="{resize}" />
<div class="map" bind:this="{mapContainer}">
    <slot></slot>
</div>

<style>
.map {
   height: 180px;
   width: 100%;
}
</style>
