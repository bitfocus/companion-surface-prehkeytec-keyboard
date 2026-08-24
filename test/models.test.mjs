import assert from 'node:assert/strict'
import test from 'node:test'
import { PREHKEYTEC_MODELS, posKeyToControlId } from '../dist/models.js'
import { createSurfaceSchema } from '../dist/surface-schema.js'

const model = PREHKEYTEC_MODELS['mci-128']

test('maps sequential MCI 128 POSKeys from Preh bottom rows to Companion top rows', () => {
	assert.equal(posKeyToControlId(model, 1), '7/0')
	assert.equal(posKeyToControlId(model, 16), '7/15')
	assert.equal(posKeyToControlId(model, 17), '6/0')
	assert.equal(posKeyToControlId(model, 128), '0/15')
})

test('rejects POSKeys outside the model', () => {
	assert.equal(posKeyToControlId(model, 0), undefined)
	assert.equal(posKeyToControlId(model, 129), undefined)
	assert.equal(posKeyToControlId(model, 1.5), undefined)
})

test('creates all MCI 128 Companion controls', () => {
	const schema = createSurfaceSchema(model)
	assert.equal(Object.keys(schema.controls).length, 128)
	assert.deepEqual(schema.controls['0/0'], { row: 0, column: 0 })
	assert.deepEqual(schema.controls['7/15'], { row: 7, column: 15 })
})
