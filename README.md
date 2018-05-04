# Aeggon's Farm

Canvas-based platform game written in pure JavaScript.
[[Play live version](https://gulewi.cz/aeggons-farm)]

## Installation

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Start the development server by running `npm start`.
4. Go to http://localhost:8080.

## Folder layout

```
.
├── app                       # Core application files
├── assets
│   ├── game_data             # Data files in JSON format
│   ├── graphics_source       # Source graphic files
│   ├── map                   # Includes a .tmx map file
│   │   └── sprites           # Modified sprite images for use in map editor
│   └── sprites               # Sprite images, as used in production version
├── tools                     # Includes tool for converting .tmx map into JSON
└── static                    # Files for serving the app
```

Note that `assets/game_data/map.json` and `assets/game_data/entities.json` are generated automatically by the map converter tool based on `assets/map/map.tmx`.

## Map editing

The map can be modified using any editor that supports TMX maps, such as [Tiled](https://www.mapeditor.org).

At the moment, map data is not served directly from `map.tmx` but must be converted beforehand to JSON by running `node map_converter.js` in the `tools` folder.