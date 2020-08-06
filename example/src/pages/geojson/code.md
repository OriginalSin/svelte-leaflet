```xml
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

```
