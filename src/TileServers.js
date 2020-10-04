export default {
    'osm.mapnik': {
        attribution: '<a href="https://www.mapnik.org">Mapnik</a>',
        description: 'OSM Mapnik',
        url: '//{s}.tile.osm.org/{z}/{x}/{y}.png',
    },
    'osm.humanitarian': {
        attribution: '<a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        description: 'OSM Humanitarian',
        url: '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    },
    // 'osm.landscape': {
    //     attribution: '',
    //     description: 'OSM Landscape',
    //     url: '//{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png'
    // },
    'esri.grey.dark': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Dark Grey',
        url:'//services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.grey.light': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Dark Light',
        url: '//services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.hillshade': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Hillshade',
        url: '//services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.ocean': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Ocean',
        url: '//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.delorme': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'Delorme',
        url: '//services.arcgisonline.com/arcgis/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.street.map': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Street Map',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    },
    // 'esri.world.navigation.charts': {
    //     attribution: 'Map data &copy; <a href="https://www.esri.com">ESRI</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    //     description: 'ESRI World Navigation Charts',
    //     url:'//services.arcgisonline.com/arcgis/rest/services/Specialty/World_Navigation_Charts/MapServer/tile/{z}/{y}/{x}'
    // },
    'esri.national.geographic': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI National Geographic',
        url: '//services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.imagery': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Imagery',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.physical.map': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Physical Map',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.shaded.relief': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Shaded Relief',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.terrain': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Terrain',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
    },
    'esri.world.topo': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'ESRI Topo',
        url: '//services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    },
    'cartodb.positron': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'CartoDB Positron',
        url: '//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    },
    'cartodb.dark.matter': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'CartoDB Dark Matter',
        url: '//{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    },
    'cartodb.positron2': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'CartoDB Positron 2',
        url: '//{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
    },
    'cartodb.dark.matter2': {
        attribution: '<a href="https://www.esri.com">ESRI</a>',
        description: 'CartoDB Dark Matter 2',
        url: '//{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
    },
    'landsat8': {
        attribution: '<a href="https://earthexplorer.usgs.gov/">USGS</a>',
        description: 'Landsat8',
        url: './data/landsat8_1.geojson'
    },
};