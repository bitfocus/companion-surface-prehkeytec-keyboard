import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_LAYOUT_DIRECTORY = 'C:\\Program Files (x86)\\PrehKeyTec\\WinProg\\Keytables\\OposJavaPOS\\MCI'
const directoryIndex = process.argv.indexOf('--directory')
const layoutDirectory = directoryIndex === -1 ? DEFAULT_LAYOUT_DIRECTORY : process.argv[directoryIndex + 1]

if (!layoutDirectory) throw new Error('--directory must be followed by a path')

const filenames = (await fs.readdir(layoutDirectory)).filter((filename) => /^pos_.*\.mwf$/i.test(filename)).sort()
const layouts = []

for (const filename of filenames) {
	const source = await fs.readFile(path.join(layoutDirectory, filename), 'latin1')
	const keyboardName = /^!@KEYBOARDTYPESTRING:(.+)$/m.exec(source)?.[1].trim()
	const assignments = []

	for (const match of source.matchAll(/^([A-Z]+)(\d+)[^:]*:\s*"\{POSKey(\d{3})\}"/gm)) {
		assignments.push({ physicalRow: match[1], physicalColumn: Number(match[2]), posKey: Number(match[3]) })
	}

	if (assignments.length === 0) continue

	const physicalRows = [...new Set(assignments.map(({ physicalRow }) => physicalRow))].sort()
	const firstPhysicalColumn = Math.min(...assignments.map(({ physicalColumn }) => physicalColumn))
	const positions = assignments
		.map(({ physicalRow, physicalColumn, posKey }) => ({
			posKey,
			row: physicalRows.length - 1 - physicalRows.indexOf(physicalRow),
			column: physicalColumn - firstPhysicalColumn,
		}))
		.sort((left, right) => left.posKey - right.posKey)

	layouts.push({
		file: filename,
		name: keyboardName,
		rows: physicalRows.length,
		columns: Math.max(...positions.map(({ column }) => column)) + 1,
		positions,
	})
}

console.log(JSON.stringify(layouts, null, 2))
