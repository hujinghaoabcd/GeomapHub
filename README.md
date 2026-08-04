# GeomapHub

GeomapHub is an open GIS portal concept for managing geospatial data, composing online maps, and connecting spatial processing workflows.

## Homepage

The repository currently contains a dependency-free static landing page featuring:

- a responsive dark geospatial interface;
- an animated, draggable canvas globe;
- glowing atmosphere, orbit traces, pulsing beacons, and twinkling land points;
- reduced-motion accessibility support;
- direct compatibility with GitHub Pages and any static web server.

## Local preview

No build step is required. Serve the repository root with any static HTTP server, for example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Files

- `index.html` — semantic homepage structure;
- `styles.css` — responsive visual system and page layout;
- `globe.js` — dependency-free interactive globe renderer.

## Deployment

For GitHub Pages, publish from the repository root on the `main` branch (or from the branch selected in the repository Pages settings).

## License

MIT
