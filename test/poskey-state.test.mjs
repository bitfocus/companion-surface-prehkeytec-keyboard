import assert from 'node:assert/strict'
import test from 'node:test'
import { PREHKEYTEC_MODELS } from '../dist/models.js'
import { PosKeyState } from '../dist/protocol/poskey-state.js'

test('emits one down and one up while suppressing duplicate reports', () => {
	const emitted = []
	const state = new PosKeyState(PREHKEYTEC_MODELS['mci-128'], {
		onDown: (id) => emitted.push(`down:${id}`),
		onUp: (id) => emitted.push(`up:${id}`),
	})

	state.handle({ posKey: 1, pressed: true })
	state.handle({ posKey: 1, pressed: true })
	state.handle({ posKey: 1, pressed: false })
	state.handle({ posKey: 1, pressed: false })

	assert.deepEqual(emitted, ['down:7/0', 'up:7/0'])
})

test('releases every held key when the device disconnects', () => {
	const emitted = []
	const state = new PosKeyState(PREHKEYTEC_MODELS['mci-128'], {
		onDown: (id) => emitted.push(`down:${id}`),
		onUp: (id) => emitted.push(`up:${id}`),
	})

	state.handle({ posKey: 1, pressed: true })
	state.handle({ posKey: 17, pressed: true })
	state.releaseAll()

	assert.deepEqual(emitted, ['down:7/0', 'down:6/0', 'up:7/0', 'up:6/0'])
})
