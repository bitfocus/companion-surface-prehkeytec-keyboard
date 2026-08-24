# PrehKeyTec surface for Bitfocus Companion

Private development scaffold for using programmable PrehKeyTec USB keyboards as Companion surfaces.

## Current status

The Companion plugin structure, model layouts, POSKey state handling, HID
transport and tests are in place. The observed MCI 30, MCI 60, MCI 84 and MCI
128 USB devices and their separate POSKey HID collections are enabled, and
POSKey reports 1–128 are decoded.

The plugin reads the product code directly from each keyboard during USB scans to
distinguish models that share a USB product ID. No installed PrehKeyTec software,
web server or vendor binary is required.

## Development

Companion surface modules currently target Node.js 22 or 26 and Yarn 4.

```sh
yarn
yarn test
yarn build
```

To inspect connected HID interfaces:

```sh
yarn probe:hid --all
```

To capture raw reports from the separate PrehKeyTec POSKey collection without
opening the normal keyboard interface:

```sh
yarn capture:poskey --seconds 30
```

To associate selected programmed POSKey numbers with their raw, hardware-specific
codes using guided press/release prompts:

```sh
yarn verify:poskeys
yarn verify:poskeys --keys 1,2,13,73,84
```

To inspect the manufacturer MWF sample layouts without modifying them:

```sh
yarn inspect:layouts
yarn inspect:layouts --directory "C:\path\to\OposJavaPOS\MCI"
```

## Model layouts

| Model         |                      POS surface | Source layout           | Hardware verified |
| ------------- | -------------------------------: | ----------------------- | ----------------- |
| MCI 30        |                              6×5 | `pos_mci30.MWF`         | Yes               |
| MCI 60        |                             5×12 | `pos_mci60.MWF`         | Identity only     |
| MCI 84        |                             7×12 | `pos_mci84.MWF`         | Yes               |
| MCI 96        |                             6×16 | `pos_mci96.MWF`         | No                |
| MCI 128       |                             8×16 | `pos_mci128.MWF`        | Yes               |
| MCI 128 Alpha |                 2×16 POS section | `pos_mci128a_gr/us.MWF` | No                |
| MCI 3000      |                  2×4 POS section | `pos_mci3000_gr/us.mwf` | No                |
| MCI 3100      | sparse 2×22 POS section, 26 keys | `pos_mci3100_gr/us.mwf` | No                |
| MSI 60        |                             6×10 | `pos_msi60.MWF`         | No                |

## Adding another device

1. Add its vendor ID, product ID, HID interface and model to `src/devices.ts`.
2. Run `yarn build`; the build updates `companion/manifest.json` automatically.
3. Implement the confirmed report format in `src/protocol/poskey-report.ts`.
4. Test press, release, simultaneous keys, auto-repeat and disconnect behaviour on each firmware family.

The MCI 84 and MCI 128 models follow the sequential manufacturer keytables.
For the MCI 84, POSKey 1–12 are the bottom row and 73–84 the top row.
For the MCI 128, POSKey 1–16 are the bottom row and 113–128 the top row.
PrehKeyTec labels rows from the lower-left, while Companion layouts count rows
from the top.
