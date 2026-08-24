# PrehKeyTec

This private development module is intended to use programmable PrehKeyTec keyboards as Companion surfaces.

## Development status

The observed MCI 30, MCI 60, MCI 84 and MCI 128 devices and their separate
POSKey HID report format are supported. During USB scans the module reads the
product code directly from the keyboard, allowing models with the same USB
product ID to be distinguished without installed PrehKeyTec software.

Other PrehKeyTec models and firmware families still need to be verified on
hardware before they are enabled.

The intended keyboard configuration assigns one unique POSKey number to every physical key position and enables the separate OPOS/JavaPOS HID channel.
