<DemoPanel>
	<Map center={[52.176700, 69.555840]} zoom={4}>
		<TileLayer />
		<GeoJSON
			url = './data/landsat8_1.geojson'
			options={{
				style: function() {
					return {
						fill: false
					};
				},
				filter: function(feature) {
					let dt = new Date(feature.properties.ACQ_DATE);
					return dt.getMonth() === 11;
				}
			}}
		/>
	</Map>

	<div slot="code">
		<div>
			{@html code}
		</div>
	</div>
</DemoPanel>

<Description>
	{@html doc}
</Description>

<Properties data={properties} />

<script>
	import { Map, TileLayer, GeoJSON } from '/../../src';
	import { DemoPanel, Description, Properties } from '/components/demo';

	import code from './code.md';
	import doc from './doc.md';
	import properties from './props';

</script>
