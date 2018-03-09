const MAP_FILE = './map.tmx',
      OUTPUT_FILE_TILES = '../dist/data/map.json',
      OUTPUT_FILE_ENTITIES = '../dist/data/entities.json',
      BASE_TILE_SIZE = 70;

const tmx = require('tmx-parser'),
      fs = require('fs');

tmx.parseFile(MAP_FILE, function(err, map) {
    if (err) throw err;

    const tileLayers = map.layers.filter(layer => layer.type == 'tile'),
          entityLayers = map.layers.filter(layer => layer.type == 'object');

    const output = {
        tiles: {
            width: map.width,
            height: map.height,
            layers: convertTileLayers(tileLayers)
        },
        entities: convertEntityLayers(entityLayers, map.tileWidth)
    };

    fs.writeFile(OUTPUT_FILE_TILES, JSON.stringify(output.tiles), err => {
        if (err) throw err;
        console.log(`Map tiles saved as <${OUTPUT_FILE_TILES}>`);
    });

    fs.writeFile(OUTPUT_FILE_ENTITIES, JSON.stringify(output.entities), err => {
        if (err) throw err;
        console.log(`Map tiles saved as <${OUTPUT_FILE_ENTITIES}>`);
    }); 

});

function convertTileLayers(layers) {
    return layers.reduce((layers, layer) => {
        const {tiles} = layer,
              plane = layer.properties.plane.trim().toLowerCase()

        const outputTiles = [];
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i]
                ? tiles[i].properties.type
                : 0;
            outputTiles.push(tile);
        }

        switch (plane) {
            case 'background': 
            case 'foreground': layers[plane].push(outputTiles); return layers;
            case 'collision': layers[plane] = outputTiles; return layers;
            default: console.warn(`Could not identify the layer plane in layer <${layer.name}>`); return layers;
        }
    }, {background: [], foreground: []});
}

function convertEntityLayers(layers) {
    return layers.reduce((layers, layer) => {
        const {type} = layer.properties,
              entities = layer.objects;
        let converted = [];

        switch (type) {
            case 'platforms': converted = convertPlatforms(entities); break;
            case 'mobs': converted = convertMobs(entities); break;
            case 'spikes': converted = convertSpikes(entities); break;
            case 'collectibles': converted = convertCollectibles(entities); break;
            case 'infoSigns': break;
        }

        layers[type] = converted;
        return layers;
    }, {});
}

function convertCollectibles(entities) {
    return entities.map(entity => Object.assign(
        convertPxToTiles({
            x: entity.x,
            y: entity.y
        }),
        {
            width: BASE_TILE_SIZE,
            height: BASE_TILE_SIZE,
            variant: entity.properties.variant,
            frame: entity.properties.frame
        }
    ));
}

function convertPlatforms(entities) {
    return entities.reduce((mobs, mob) => {
        const {type} = mob.properties;
        mob.properties.width = mob.properties.width || 1;   // default size: 1 tile
        mob.properties.height = mob.properties.height || 1;
        return [...mobs,
            Object.assign(
                convertLinearlyMovingEntity(mob),
                {
                    type: type ? type : 'default'
                }
            )
        ];
    }, []);
}

function convertMobs(entities) {
    return entities.reduce((mobs, mob) => {
        const {type} = mob.properties;
        mob.properties.width = mob.properties.width || 1;   // default size: 1 tile
        mob.properties.height = mob.properties.height || 1;
        return [...mobs,
            Object.assign(
                convertLinearlyMovingEntity(mob),
                {
                    type: type ? type : 'default'
                }
            )
        ];
    }, []);
}

function convertSpikes(entities) {
    return entities.map(entity => convertPxToTiles({
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height
    }));
}

function convertLinearlyMovingEntity(entity) {
    const movementBox = convertPxToTiles({
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height
    }),
    entityBox = {
        width: entity.properties.width,
        height: entity.properties.height
    },
    {axis, start, speed} = entity.properties,
    position = {};

    if (axis === 'vertical') {
        if (start === 'bottom') {
            position.initial = {
                x: movementBox.x,
                y: movementBox.y + movementBox.height - entityBox.height
            };
            position.final = {
                y: movementBox.y
            };
        }
        // assume starting position: top
        else {
            position.initial = {
                x: movementBox.x,
                y: movementBox.y
            };
            position.final = {
                y: movementBox.y + movementBox.height - entityBox.height
            };
        }
    }
    // assume motion axis: horizontal
    else {
        if (start === 'right') {
            position.initial = {
                x: movementBox.x + movementBox.width - entityBox.width,
                y: movementBox.y
            };
            position.final = {
                x: movementBox.x
            };
        }
        // assume starting position: left
        else {
            position.initial = {
                x: movementBox.x,
                y: movementBox.y
            };
            position.final = {
                x: movementBox.x + movementBox.width - entityBox.width
            };
        }
    }

    return {
        initialPosition: position.initial,
        finalPosition: position.final,
        width: entityBox.width,
        height: entityBox.height,
        speed: speed
    };
}

function convertPxToTiles(dimensions) {
    return Object.keys(dimensions).reduce((all, curr) => {
        all[curr] = dimensions[curr] / BASE_TILE_SIZE;
        return all;
    }, {});
};