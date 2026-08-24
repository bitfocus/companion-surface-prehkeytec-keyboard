import { devicesAsync, HIDAsync } from 'node-hid'

let parsePosKeyReport
try {
	;({ parsePosKeyReport } = await import('../dist/protocol/poskey-report.js'))
} catch {
	// Raw capture remains useful before the TypeScript project has been built.
}

const PREHKEYTEC_VENDOR_ID = 0x053a
const POSKEY_USAGE_PAGE = 0xfffa
const POSKEY_USAGE = 0x00a5

function readSecondsArgument() {
	const index = process.argv.indexOf('--seconds')
	if (index === -1) return 30

	const seconds = Number(process.argv[index + 1])
	if (!Number.isFinite(seconds) || seconds <= 0) {
		throw new Error('--seconds must be followed by a positive number')
	}
	return seconds
}

const seconds = readSecondsArgument()
const candidates = (await devicesAsync()).filter(
	(device) =>
		device.vendorId === PREHKEYTEC_VENDOR_ID && device.usagePage === POSKEY_USAGE_PAGE && device.usage === POSKEY_USAGE,
)

if (candidates.length === 0) {
	console.error('No PrehKeyTec POSKey HID collection found (VID 0x053a, usage page 0xfffa, usage 0x00a5).')
	process.exitCode = 1
} else if (candidates.length > 1) {
	console.error(`Found ${candidates.length} PrehKeyTec POSKey collections; connect only the pad under test.`)
	process.exitCode = 1
} else {
	const candidate = candidates[0]
	const device = await HIDAsync.open(candidate.path)
	const startedAt = performance.now()
	let reportCount = 0
	let closed = false

	console.log(
		`Listening to ${candidate.product ?? 'PrehKeyTec device'} ` +
			`(PID 0x${candidate.productId.toString(16).padStart(4, '0')}, interface ${candidate.interface}) for ${seconds}s.`,
	)
	console.log('Press and release the requested keys. Raw bytes and, when built, decoded POSKey events are printed.')

	const close = async (reason) => {
		if (closed) return
		closed = true
		await device.close()
		console.log(`${reason} Captured ${reportCount} report(s).`)
	}

	device.on('data', (report) => {
		reportCount += 1
		const elapsed = (performance.now() - startedAt).toFixed(1).padStart(8)
		const hex = [...report].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
		const decimal = [...report].join(', ')
		const decoded = parsePosKeyReport?.(report)
			.map((event) => `POS ${String(event.posKey).padStart(3, '0')} ${event.pressed ? 'down' : 'up'}`)
			.join(', ')
		console.log(
			`${String(reportCount).padStart(3)} +${elapsed} ms  raw-hex: ${hex}  raw-dec: [${decimal}]` +
				(decoded ? `  decoded: ${decoded}` : ''),
		)
	})

	device.on('error', (error) => {
		console.error('HID error:', error)
		void close('Capture stopped after an HID error.')
		process.exitCode = 1
	})

	process.once('SIGINT', () => void close('Capture interrupted.'))
	setTimeout(() => void close('Capture complete.'), seconds * 1000)
}
