# PrehKeyTec surface for Bitfocus Companion

This surface module lets supported programmable PrehKeyTec USB keyboards control
[Bitfocus Companion](https://bitfocus.io/companion). It reads POSKey events from
the keyboard's separate vendor-defined USB HID collection and reports both key
presses and key releases to Companion.

The module does not depend on WinProgrammer, MapMyKey, OPOS/JavaPOS middleware,
or another installed PrehKeyTec service while Companion is running. The vendor
configuration software is only needed to program the keyboard beforehand.

## Disclaimer

This is an independent community integration and is not affiliated with or
endorsed by PrehKeyTec GmbH. PrehKeyTec and the associated product names are
trademarks of their respective owners.

## Device setup

Program every physical key that should appear in Companion with a unique
`POSKey001` through `POSKey128` value and enable the keyboard's separate
OPOS/JavaPOS POSKey HID output. Do not program the keys merely as ordinary
keyboard shortcuts: Companion deliberately opens only the POSKey collection and
does not intercept the normal keyboard interface.

After connecting the keyboard, install and enable the PrehKeyTec surface module
in Companion. The device should be discovered automatically. Assign the surface
buttons on Companion's Surfaces page as usual.

## Support status

The following layouts and identity codes are implemented. Hardware verification
describes the devices available during development; unverified models may need
additional USB IDs or firmware-specific handling before Companion can discover
them.

| Model         | POS surface                      | Verification    |
| ------------- | -------------------------------- | --------------- |
| MCI 30        | 6×5                              | Hardware tested |
| MCI 60        | 5×12                             | Identity tested |
| MCI 84        | 7×12                             | Hardware tested |
| MCI 96        | 6×16                             | Layout only     |
| MCI 128       | 8×16                             | Hardware tested |
| MCI 128 Alpha | 2×16 POS section                 | Layout only     |
| MCI 3000      | 2×4 POS section                  | Layout only     |
| MCI 3100      | sparse 2×22 POS section, 26 keys | Layout only     |
| MSI 60        | 6×10                             | Layout only     |

Observed USB devices use vendor ID `0x053a` and product IDs `0x0b01` or
`0x0b06`. Some models share a product ID, so the module reads the product code
from the keyboard during discovery to select the correct layout. Only the
vendor-defined HID interface (`usagePage 0xfffa`, interface 1 on the observed
devices) is claimed.

## Known limitations

- Models and firmware versions not listed as hardware tested may not yet be
  discovered automatically.
- The keyboards do not provide button displays, button illumination, or
  Companion-controlled brightness through this integration.
- A device that does not answer the identity query falls back to the layout
  associated with its USB product ID.
- macOS, Windows, Linux x64, and Linux arm64 native HID binaries are included in
  the packaged module, but hardware testing has not covered every platform.

Please include the model, USB vendor/product ID, HID interface information, and
a short raw report capture when reporting compatibility problems.

## Development

The module requires Node.js 22 or 26 and Yarn 4.

```sh
corepack enable
yarn install --immutable
yarn test
yarn build
yarn package
```

Useful hardware diagnostics:

```sh
yarn probe:hid --all
yarn capture:poskey --seconds 30
yarn verify:poskeys --keys 1,2,13,73,84
```

Manufacturer MWF sample layouts can be inspected without modifying them:

```sh
yarn inspect:layouts --directory "/path/to/OposJavaPOS/MCI"
```

When adding a device, add its confirmed USB and HID match criteria to
`src/devices.ts`, implement any report-format differences, add test captures,
and run the complete validation commands above. `yarn build` regenerates the
USB IDs in `companion/manifest.json` from the device definitions.

## License

[MIT](LICENSE)
