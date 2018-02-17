const MAP_FILE = './map.tmx',
      OUTPUT_FILE_TILES = '../dist/data/tiles.json',
      OUTPUT_FILE_ENTITIES = '../dist/data/__entities.json';

const tmx = require('tmx-parser'),
      fs = require('fs');

tmx.parseFile(MAP_FILE, function(err, map) {
    if (err) throw err;

    const tileLayers = map.layers.filter(layer => layer.type == 'tile'),
          entityLayers = map.layers.filter(layer => layer.type == 'object');

    const output = {
        tiles: {
            width: map.width,
            layers: convertTileLayers(tileLayers)
        },
        entities: convertEntityLayers(entityLayers, map.tileWidth)
    };

    console.log(output.entities);

    fs.writeFile(OUTPUT_FILE_TILES, JSON.stringify(output.tiles), err => {
        if (err) throw err;
        console.log(`Map tiles saved as <${OUTPUT_FILE_TILES}>`);
    }); 

});

function convertTileLayers(layers) {
    return layers.reduce((layers, layer) => {
        const {tiles} = layer,
               {type} = layer.properties;
        
        const outputTiles = [];
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i]
                ? tiles[i].properties.type
                : 0;
            outputTiles.push(tile);
        }

        layers[type] = outputTiles;
        return layers;
    }, {});
}

function convertEntityLayers(layers, tileSize) {
    return layers.reduce((layers, layer) => {
        const {type} = layer.properties,
              entities = layer.objects;
        let converted = [];

        switch (type) {
            case 'platforms': converted = convertPlatformEntities(entities); break;
            case 'mobs': converted = convertMobEntities(entities); break;
        }

        layers[type] = converted;
        return layers;
    }, {});
}

function convertMobEntities(entities) {
    return 'mobs!';
}

function convertPlatformEntities(entities) {
    return 'platforms!';
}

