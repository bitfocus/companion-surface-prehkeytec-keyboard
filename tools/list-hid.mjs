import { devicesAsync } from 'node-hid'

const PREHKEYTEC_VENDOR_ID = 0x053a
const showAll = process.argv.includes('--all')

const hex = (value, width = 4) => `0x${value.toString(16).padStart(width, '0')}`
const devices = (await devicesAsync())
	.filter((device) => showAll || device.vendorId === PREHKEYTEC_VENDOR_ID)
	.sort(
		(left, right) =>
			left.vendorId - right.vendorId || left.productId - right.productId || left.interface - right.interface,
	)

if (devices.length === 0) {
	console.log(showAll ? 'No HID devices found.' : 'No HID interface with PrehKeyTec vendor ID 0x053a found.')
	console.log('Use --all to list every HID interface.')
} else {
	for (const device of devices) {
		console.log({
			vendorId: hex(device.vendorId),
			productId: hex(device.productId),
			interface: device.interface,
			usagePage: device.usagePage === undefined ? undefined : hex(device.usagePage),
			usage: device.usage === undefined ? undefined : hex(device.usage),
			manufacturer: device.manufacturer,
			product: device.product,
			serialNumber: device.serialNumber,
			path: device.path,
		})
	}
}
