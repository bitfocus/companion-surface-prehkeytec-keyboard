import assert from 'node:assert/strict'
import test from 'node:test'
import { modelIdFromProductCode, parsePrehDeviceIdentity } from '../dist/protocol/device-identity.js'

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
