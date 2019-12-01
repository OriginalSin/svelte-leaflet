<DemoPanel>
	<Map
		center={[55.751849, 37.595214]}
		zoom={8}
	>
	<TileLayer />
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

	let visible = false;
</script>
