import type { SurfaceSchemaLayoutDefinition } from '@companion-surface/base'
import { controlIdForCoordinates, type PrehKeyTecModel } from './models.js'

export function createSurfaceSchema(model: PrehKeyTecModel): SurfaceSchemaLayoutDefinition {
	const controls: SurfaceSchemaLayoutDefinition['controls'] = {}

	for (const position of model.positions) {
		const { row, column } = position
		controls[controlIdForCoordinates(row, column)] = { row, column }
	}

	return {
		stylePresets: {
			default: {},
		},
		controls,
	}
}
