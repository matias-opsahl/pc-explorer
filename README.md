# Maskinrommet

Et 3D-verktøy for å se hva en PC er laget av og sette sammen sin egen. Velg en stasjonær eller bærbar maskin, klikk på en del for å zoome inn og lese hva den gjør, og bytt deler for å se hvordan pris, bildefrekvens og kompatibilitet endrer seg.

## Kjøre

```bash
npm install
npm run dev
```

Åpne deretter `http://localhost:5173`.

Andre kommandoer: `npm run build` (typesjekk og produksjonsbygg) og `npm run lint`.

## Slik er det bygget

| Mappe | Innhold |
| --- | --- |
| `src/data` | Delekatalogen, maskinene og alle forklaringstekster |
| `src/logic/evaluate.ts` | Pris, anslått bildefrekvens, strømtrekk, kompatibilitet og forslag |
| `src/three` | 3D-modellene, tegnet i kode med Three.js og React Three Fiber |
| `src/ui` | Paneler og kontroller |
| `src/store.ts` | Tilstand: valgt maskin, bygg, mål og visning |

3D-modellene måles i millimeter. Hver del ligger i en `Part`, som tar seg av klikk, markering, nedtoning og plasseringen i sprengskissen.

## Legge til en del

Legg en ny oppføring i riktig liste i `src/data/catalog.ts`. Den dukker da opp som alternativ i alle stasjonære bygg, og kompatibilitetsreglene gjelder automatisk. For bærbare må delen også føres opp under `options` for maskinen i `src/data/devices.ts`.

## Avgrensninger

- Priser er omtrentlige norske butikkpriser fra november 2026.
- Bildefrekvens er grove anslag til sammenligning, ikke målinger.
- Kabler, lagringsdisker utover én M.2 SSD og vifter som egne deler er utelatt.
- På bærbare kan bare delene som faktisk selges i flere varianter byttes.
