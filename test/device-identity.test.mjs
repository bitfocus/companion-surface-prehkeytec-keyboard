import assert from 'node:assert/strict'
import test from 'node:test'
import {
	modelIdFromProductCode,
	parsePrehDeviceIdentity,
	PrehDeviceIdentityDecoder,
} from '../dist/protocol/device-identity.js'

function decodeIdentity(versionString, payloadSize) {
	const framed = Buffer.concat([Buffer.from([0x86]), Buffer.from(versionString, 'latin1'), Buffer.from([0x96])])
	const decoder = new PrehDeviceIdentityDecoder()
	let result
	for (let offset = 0; offset < framed.length; offset += payloadSize) {
		const payload = Buffer.alloc(4)
		framed.copy(payload, 0, offset, offset + payloadSize)
		result = decoder.pushReport(Uint8Array.from([0x04, ...payload]))
	}
	return result
}

test('parses the identity captured from the MCI 30 without a vendor API', () => {
	const versionString = [
		'(C) 1990 - 2006 by Preh KeyTec GmbH',
		'05129-605/3060 - MCI 128 Num',
		'Dec 20 2006 14:00:24',
		'BL  1.51 USB A',
		'ID MCI 30C1N14L071E2M3I2',
		'SN 1067562',
	].join('\n')
	assert.deepEqual(parsePrehDeviceIdentity(Buffer.from(versionString, 'latin1')), {
		versionString,
		productCode: 'MCI 30C1N14L071E2M3I2',
		serialNumber: '1067562',
	})
})

test('maps Preh product codes to Companion model ids', () => {
	assert.equal(modelIdFromProductCode('MCI 30C1N14L071E2M3I2'), 'mci-30')
	assert.equal(modelIdFromProductCode('MCI 84C1'), 'mci-84')
	assert.equal(modelIdFromProductCode('MCI128A-example'), 'mci-128a')
	assert.equal(modelIdFromProductCode('MSI 60'), 'msi-60')
	assert.equal(modelIdFromProductCode('unknown'), undefined)
})

test('decodes legacy single-byte HID identity reports', () => {
	const versionString = 'ID MCI 30C1N14L071E2M3I2\nSN 1067562'
	assert.deepEqual(decodeIdentity(versionString, 1), {
		complete: true,
		identity: {
			versionString,
			productCode: 'MCI 30C1N14L071E2M3I2',
			serialNumber: '1067562',
		},
	})
})

test('decodes four-byte HID identity reports captured from an MCI 128', () => {
	const versionString = [
		'(C) 1990 - 2019 by PrehKeyTec GmbH',
		'05129-605/5040 - MCI 128 Num',
		'Jul 15 2019 14:04:00',
		'BL 3.30',
		'ID MCI 128C2N10E1I2 SL-578',
		'HW 90328-606/1805',
		'SN 24342-1903971',
	].join('\n')
	assert.deepEqual(decodeIdentity(versionString, 4), {
		complete: true,
		identity: {
			versionString,
			productCode: 'MCI 128C2N10E1I2 SL-578',
			serialNumber: '24342-1903971',
		},
	})
})
