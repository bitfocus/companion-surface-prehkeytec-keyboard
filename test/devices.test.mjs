import assert from 'node:assert/strict'
import test from 'node:test'
import { getManifestUsbIds, matchSupportedDevice } from '../dist/devices.js'

function createPrehDevice(productId, overrides = {}) {
	return {
		vendorId: 0x053a,
		productId,
		interface: 1,
		usagePage: 0xfffa,
		usage: 0x00a5,
		manufacturer: 'PrehKeyTec',
		product: 'PrehKeyTec MCI Keyboard',
		serialNumber: '',
		path: `test:${productId}`,
		...overrides,
	}
}

test('identifies observed MCI models by product ID and POSKey collection', () => {
	assert.equal(matchSupportedDevice(createPrehDevice(0x0b01))?.modelId, 'mci-84')
	const mci128 = matchSupportedDevice(createPrehDevice(0x0b06))
	assert.equal(mci128?.modelId, 'mci-128')
	assert.equal(mci128?.modelIsUnambiguous, true)
})

test('does not claim another collection or an unknown product', () => {
	assert.equal(matchSupportedDevice(createPrehDevice(0x0b06, { usagePage: 0x0001 })), undefined)
	assert.equal(matchSupportedDevice(createPrehDevice(0xffff)), undefined)
})

test('publishes every observed product ID in the manifest', () => {
	assert.deepEqual(getManifestUsbIds(), [{ vendorId: 0x053a, productIds: [0x0b01, 0x0b06] }])
})
