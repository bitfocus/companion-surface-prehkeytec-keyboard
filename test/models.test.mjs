import assert from 'node:assert/strict'
import test from 'node:test'
import { modelSurfaceDescription, PREHKEYTEC_MODELS, posKeyToControlId } from '../dist/models.js'
import { createSurfaceSchema } from '../dist/surface-schema.js'

const rectangularModels = [
	['mci-30', 30, '5/0', '0/4'],
	['mci-60', 60, '4/0', '0/11'],
	['mci-84', 84, '6/0', '0/11'],
	['mci-96', 96, '5/0', '0/15'],
	['mci-128', 128, '7/0', '0/15'],
	['mci-128a', 32, '1/0', '0/15'],
	['mci-3000', 8, '1/0', '0/3'],
	['msi-60', 60, '5/0', '0/9'],
]

test('maps every rectangular manufacturer POS layout from bottom to top', () => {
	for (const [modelId, keyCount, firstControl, lastControl] of rectangularModels) {
		const model = PREHKEYTEC_MODELS[modelId]
		assert.equal(model.positions.length, keyCount, modelId)
		assert.equal(posKeyToControlId(model, 1), firstControl, modelId)
		assert.equal(posKeyToControlId(model, keyCount), lastControl, modelId)
		assert.equal(Object.keys(createSurfaceSchema(model).controls).length, keyCount, modelId)
	}
})

test('maps the sparse MCI 3100 POS section without creating nonexistent controls', () => {
	const model = PREHKEYTEC_MODELS['mci-3100']
	const schema = createSurfaceSchema(model)

	assert.equal(posKeyToControlId(model, 1), '1/0')
	assert.equal(posKeyToControlId(model, 22), '1/21')
	assert.equal(posKeyToControlId(model, 23), '0/18')
	assert.equal(posKeyToControlId(model, 26), '0/21')
	assert.equal(Object.keys(schema.controls).length, 26)
	assert.equal(schema.controls['0/0'], undefined)
	assert.deepEqual(schema.controls['0/18'], { row: 0, column: 18 })
})

test('rejects POSKeys outside a model', () => {
	const model = PREHKEYTEC_MODELS['mci-84']
	assert.equal(posKeyToControlId(model, 0), undefined)
	assert.equal(posKeyToControlId(model, 85), undefined)
	assert.equal(posKeyToControlId(model, 1.5), undefined)
})

test('includes the available POS key count in surface descriptions', () => {
	assert.equal(modelSurfaceDescription(PREHKEYTEC_MODELS['mci-84']), 'PrehKeyTec MCI 84 (84 POS keys)')
	assert.equal(modelSurfaceDescription(PREHKEYTEC_MODELS['mci-128']), 'PrehKeyTec MCI 128 (128 POS keys)')
	assert.equal(
		modelSurfaceDescription(PREHKEYTEC_MODELS['mci-128a']),
		'PrehKeyTec MCI 128 Alpha POS section (32 POS keys)',
	)
})
