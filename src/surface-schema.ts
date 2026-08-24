import type { SurfaceSchemaLayoutDefinition } from '@companion-surface/base'
import { controlIdForCoordinates, type PrehKeyTecModel } from './models.js'

export function createSurfaceSchema(model: PrehKeyTecModel): SurfaceSchemaLayoutDefinition {
	const controls: SurfaceSchemaLayoutDefinition['controls'] = {}

	for (let row = 0; row < model.rows; row++) {
		for (let column = 0; column < model.columns; column++) {
			controls[controlIdForCoordinates(row, column)] = { row, column }
		}
	}

	return {
		stylePresets: {
			default: {},
		},
		controls,
	}
}
