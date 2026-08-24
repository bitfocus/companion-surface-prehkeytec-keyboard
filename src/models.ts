export type PrehKeyTecModelId =
	'mci-30' | 'mci-60' | 'mci-84' | 'mci-96' | 'mci-128' | 'mci-128a' | 'mci-3000' | 'mci-3100' | 'msi-60'

export interface PrehKeyTecPosition {
	posKey: number
	row: number
	column: number
}

export interface PrehKeyTecModel {
	id: PrehKeyTecModelId
	name: string
	rows: number
	columns: number
	positions: readonly PrehKeyTecPosition[]
}

function createSequentialGrid(rows: number, columns: number): readonly PrehKeyTecPosition[] {
	return Array.from({ length: rows * columns }, (_, index) => ({
		posKey: index + 1,
		row: rows - 1 - Math.floor(index / columns),
		column: index % columns,
	}))
}

const mci3100Positions: readonly PrehKeyTecPosition[] = [
	...Array.from({ length: 22 }, (_, index) => ({ posKey: index + 1, row: 1, column: index })),
	...Array.from({ length: 4 }, (_, index) => ({ posKey: index + 23, row: 0, column: index + 18 })),
]

export const PREHKEYTEC_MODELS: Readonly<Record<PrehKeyTecModelId, PrehKeyTecModel>> = {
	'mci-30': {
		id: 'mci-30',
		name: 'PrehKeyTec MCI 30',
		rows: 6,
		columns: 5,
		positions: createSequentialGrid(6, 5),
	},
	'mci-60': {
		id: 'mci-60',
		name: 'PrehKeyTec MCI 60',
		rows: 5,
		columns: 12,
		positions: createSequentialGrid(5, 12),
	},
	'mci-84': {
		id: 'mci-84',
		name: 'PrehKeyTec MCI 84',
		rows: 7,
		columns: 12,
		positions: createSequentialGrid(7, 12),
	},
	'mci-96': {
		id: 'mci-96',
		name: 'PrehKeyTec MCI 96',
		rows: 6,
		columns: 16,
		positions: createSequentialGrid(6, 16),
	},
	'mci-128': {
		id: 'mci-128',
		name: 'PrehKeyTec MCI 128',
		rows: 8,
		columns: 16,
		positions: createSequentialGrid(8, 16),
	},
	'mci-128a': {
		id: 'mci-128a',
		name: 'PrehKeyTec MCI 128 Alpha POS section',
		rows: 2,
		columns: 16,
		positions: createSequentialGrid(2, 16),
	},
	'mci-3000': {
		id: 'mci-3000',
		name: 'PrehKeyTec MCI 3000 POS section',
		rows: 2,
		columns: 4,
		positions: createSequentialGrid(2, 4),
	},
	'mci-3100': {
		id: 'mci-3100',
		name: 'PrehKeyTec MCI 3100 POS section',
		rows: 2,
		columns: 22,
		positions: mci3100Positions,
	},
	'msi-60': {
		id: 'msi-60',
		name: 'PrehKeyTec MSI 60',
		rows: 6,
		columns: 10,
		positions: createSequentialGrid(6, 10),
	},
}

export function controlIdForCoordinates(row: number, column: number): string {
	return `${row}/${column}`
}

export function modelSurfaceDescription(model: PrehKeyTecModel): string {
	return `${model.name} (${model.positions.length} POS keys)`
}

/** Convert a programmed POSKey number to Companion layout coordinates. */
export function posKeyToControlId(model: PrehKeyTecModel, posKey: number): string | undefined {
	if (!Number.isInteger(posKey)) return undefined

	const position = model.positions.find((candidate) => candidate.posKey === posKey)
	return position ? controlIdForCoordinates(position.row, position.column) : undefined
}
