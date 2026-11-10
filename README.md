# pc-explorer

A 3D tool for exploring what a PC is made of and building your own. Choose a desktop or laptop, click on a component to zoom in and learn what it does, and swap components to see how price, frame rate, and compatibility change.

## Running the project

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

Other commands: `npm run build` (type-checking and production build) and `npm run lint`.

## Project structure

| Folder | Contents |
| --- | --- |
| `src/data` | The component catalog, devices, and all explanatory text |
| `src/logic/evaluate.ts` | Pricing, estimated frame rates, power consumption, compatibility, and recommendations |
| `src/three` | 3D models, created programmatically using Three.js and React Three Fiber |
| `src/ui` | Panels and controls |
| `src/store.ts` | State management: selected device, build configuration, targets, and view settings |

The 3D models are measured in millimeters. Each component is represented by a `Part` that handles clicking, highlighting, dimming, and positioning within the exploded view.

## Adding a component

Add a new entry to the appropriate list in `src/data/catalog.ts`. It will then appear as an available option in all desktop builds, with compatibility rules applied automatically. For laptops, the component must also be added to the device's `options` in `src/data/devices.ts`.

## Limitations

- Prices are approximate Norwegian retail prices as of November 2026.
- Frame rates are rough estimates for comparison purposes, not actual benchmark measurements.
- Cables, storage drives other than one M.2 SSD, and fans as separate components are excluded.
- For laptops, only components that are actually available in multiple configurations can be swapped.
