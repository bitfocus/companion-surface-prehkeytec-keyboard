import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePosKeyReport } from '../dist/protocol/poskey-report.js'

test('decodes captured single-byte MCI 84 reports', () => {
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0x01, 0x00, 0x00, 0x00])), [{ posKey: 1, pressed: true }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xfe, 0x01, 0x00, 0x00])), [{ posKey: 1, pressed: false }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0x0d, 0x00, 0x00, 0x00])), [{ posKey: 13, pressed: true }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0x52, 0x00, 0x00, 0x00])), [{ posKey: 73, pressed: true }])
})

test('decodes the captured MCI 30 top-right raw code as POSKey 30', () => {
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0x1f, 0x00, 0x00, 0x00])), [{ posKey: 30, pressed: true }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xfe, 0x1f, 0x00, 0x00])), [{ posKey: 30, pressed: false }])
})

test('decodes captured extended MCI 84 press and release reports', () => {
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xe0, 0x07, 0x00, 0x00])), [{ posKey: 84, pressed: true }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xfe, 0xe0, 0x07, 0x00])), [{ posKey: 84, pressed: false }])
})

test('covers the highest POSKey and rejects malformed or unrelated reports', () => {
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xe0, 0x44, 0x00, 0x00])), [{ posKey: 128, pressed: true }])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x03, 0x01, 0x00, 0x00, 0x00])), [])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0x00, 0x00, 0x00, 0x00])), [])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xe0, 0x10, 0x00, 0x00])), [])
	assert.deepEqual(parsePosKeyReport(Uint8Array.from([0x04, 0xfe, 0x00, 0x00, 0x00])), [])
})
