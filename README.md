# PrehKeyTec surface for Bitfocus Companion

Private development scaffold for using programmable PrehKeyTec USB keyboards as Companion surfaces.

## Current status

The Companion plugin structure, MCI 128 layout, POSKey state handling, HID transport and tests are in place. Hardware discovery and POSKey report decoding are intentionally disabled until the correct USB IDs, HID interface and report format have been confirmed.

No PrehKeyTec software or binaries are included.

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

## Enabling a device

1. Add its vendor ID, product ID, HID interface and model to `src/devices.ts`.
2. Run `yarn build`; the build updates `companion/manifest.json` automatically.
3. Implement the confirmed report format in `src/protocol/poskey-report.ts`.
4. Test press, release, simultaneous keys, auto-repeat and disconnect behaviour on each firmware family.

The MCI 128 model currently follows the manufacturer sample keytable: POSKey 1–16 are row A, 17–32 row B, and so on through row H. PrehKeyTec labels row A from the lower-left, while Companion layouts count rows from the top.
