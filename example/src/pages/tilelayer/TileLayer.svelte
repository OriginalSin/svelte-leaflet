<DemoPanel>
	<Map>
		<TileLayer
			url = {'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'}
			options = {{
				minZoom: 2,
				maxZoom: 5,
				errorTileUrl: ''
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
	import { Map } from '/../../src';
	import { TileLayer } from '/../../src';
	import { DemoPanel, Description, Properties } from '/components/demo';

	import code from './code.md';
	import doc from './doc.md';
	import properties from './props';

	let url = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

</script>
