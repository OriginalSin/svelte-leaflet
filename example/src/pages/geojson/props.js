export default [
	{
		name: 'url',
		def: "'./data/landsat8_1.geojson'",
		type: 'string',
		desc: 'URL for geoJSON data',
	},
	{
		name: 'options',
		def: "{}",
		type: 'json',
		desc: 'options geoJSON object',
	}
];
