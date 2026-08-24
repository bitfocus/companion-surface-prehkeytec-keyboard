export type PrehKeyTecModelId = 'mci-128'

export interface PrehKeyTecModel {
	id: PrehKeyTecModelId
	name: string
	rows: number
	columns: number
	firstPosKey: number
}

export const PREHKEYTEC_MODELS: Readonly<Record<PrehKeyTecModelId, PrehKeyTecModel>> = {
	'mci-128': {
		id: 'mci-128',
		name: 'PrehKeyTec MCI 128',
		rows: 8,
		columns: 16,
		firstPosKey: 1,
	},
}

export function controlIdForCoordinates(row: number, column: number): string {
	return `${row}/${column}`
}

/**
 * Convert the sequential POSKey assignment used by the manufacturer sample
 * keytable to Companion's top-to-bottom layout coordinates.
 *
 * Preh row A starts at the lower-left; Companion row 0 is the top row.
 */
export function posKeyToControlId(model: PrehKeyTecModel, posKey: number): string | undefined {
	if (!Number.isInteger(posKey)) return undefined

	const index = posKey - model.firstPosKey
	const controlCount = model.rows * model.columns
	if (index < 0 || index >= controlCount) return undefined

	const prehRowFromBottom = Math.floor(index / model.columns)
	const companionRow = model.rows - 1 - prehRowFromBottom
	const column = index % model.columns

	return controlIdForCoordinates(companionRow, column)
}
