# PrehKeyTec

Use a supported programmable PrehKeyTec USB keyboard as a button surface in
Companion. The integration receives both button-down and button-up events from
the keyboard's separate POSKey HID interface.

## Configure the keyboard

Before using the keyboard with Companion:

1. Open the keyboard configuration in the PrehKeyTec programming software.
2. Assign a unique `POSKey001` through `POSKey128` value to each physical key
   that should control Companion.
3. Enable the separate OPOS/JavaPOS POSKey HID output.
4. Write the configuration to the keyboard, then reconnect it if necessary.

Companion reads the programmed POSKey numbers. It does not intercept the normal
USB keyboard interface, so keys configured only as letters or keyboard shortcuts
will not operate this surface.

## Add the surface

Install and enable the PrehKeyTec surface module. Companion scans for supported
USB devices automatically. Once the keyboard appears on the Surfaces page, map
its buttons to Companion controls in the normal way.

No PrehKeyTec service, WinProgrammer, MapMyKey, or OPOS/JavaPOS middleware has to
run alongside Companion.

## Supported devices

MCI 30, MCI 84, and MCI 128 hardware has been tested. MCI 60 identification has
also been tested. Layout definitions exist for MCI 96, MCI 128 Alpha, MCI 3000,
MCI 3100, and MSI 60, but those models may require additional hardware
verification before automatic discovery works.

Some models share the same USB product ID. Companion queries the keyboard's
product code during discovery to choose the correct layout. If that query is not
supported by a firmware version, Companion uses the default layout associated
with the USB product ID.

## Troubleshooting

- Ensure each key is programmed as a unique POSKey and the separate POSKey HID
  channel is enabled.
- Close other POS/JavaPOS applications that may have opened the same HID
  interface.
- Disconnect and reconnect the keyboard, then rescan surfaces in Companion.
- Enable **Log raw HID reports (development)** in the surface settings only when
  collecting diagnostic information; it can produce a large amount of log data.

This integration provides input events only. PrehKeyTec models without displays
or controllable illumination cannot show Companion button graphics or status
feedback.
