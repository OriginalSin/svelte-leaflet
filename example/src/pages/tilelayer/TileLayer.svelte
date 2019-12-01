<DemoPanel>
	<Map>
		<TileLayer
			urlTemplate=""
			options={{
				minZoom: 2,
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

</script>
