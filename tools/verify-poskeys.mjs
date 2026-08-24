import { devicesAsync, HIDAsync } from 'node-hid'

const PREHKEYTEC_VENDOR_ID = 0x053a
const POSKEY_USAGE_PAGE = 0xfffa
const POSKEY_USAGE = 0x00a5
const DEFAULT_KEYS = [1, 2, 13, 32, 48, 64, 65, 72, 73, 74, 80, 81, 82, 83, 84]

function readKeysArgument() {
	const index = process.argv.indexOf('--keys')
	if (index === -1) return DEFAULT_KEYS

	const keys = process.argv[index + 1]
		?.split(',')
		.map((value) => Number(value.trim()))
		.filter((value) => Number.isInteger(value) && value > 0 && value <= 128)

	if (!keys?.length) throw new Error('--keys must be followed by comma-separated POSKey numbers from 1 to 128')
	return keys
}

function decodeRawEvent(report) {
	if (report[0] !== 0x04) return undefined

	let end = report.length
	while (end > 1 && report[end - 1] === 0) end -= 1

	const payload = [...report.subarray(1, end)]
	if (payload.length === 0) return undefined

	const pressed = payload[0] !== 0xfe
	return { pressed, token: pressed ? payload : payload.slice(1) }
}

function tokenToHex(token) {
	return token.map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
}

function tokensEqual(left, right) {
	return left.length === right.length && left.every((byte, index) => byte === right[index])
}

const keys = readKeysArgument()
const candidates = (await devicesAsync()).filter(
	(device) =>
		device.vendorId === PREHKEYTEC_VENDOR_ID && device.usagePage === POSKEY_USAGE_PAGE && device.usage === POSKEY_USAGE,
)

if (candidates.length !== 1) {
	console.error(`Expected one PrehKeyTec POSKey collection, found ${candidates.length}.`)
	process.exitCode = 1
} else {
	const device = await HIDAsync.open(candidates[0].path)
	const mappings = []
	let keyIndex = 0
	let pressedToken
	let closed = false

	const prompt = () => {
		console.log(`Press and release POS ${String(keys[keyIndex]).padStart(3, '0')} ...`)
	}

	const close = async () => {
		if (closed) return
		closed = true
		await device.close()
	}

	const finish = async () => {
		console.log('\nVerified raw POSKey mapping:')
		for (const mapping of mappings) {
			console.log(`POS ${String(mapping.posKey).padStart(3, '0')} -> ${mapping.token}`)
		}
		console.log('\nJSON:')
		console.log(JSON.stringify(Object.fromEntries(mappings.map(({ posKey, token }) => [posKey, token])), null, 2))
		await close()
	}

	console.log(`Guided verification of ${keys.length} POSKeys on ${candidates[0].product ?? 'PrehKeyTec device'}.`)
	prompt()

	device.on('data', (report) => {
		const event = decodeRawEvent(report)
		if (!event) {
			console.warn(`Ignored unexpected report: ${Buffer.from(report).toString('hex')}`)
			return
		}

		if (event.pressed) {
			if (pressedToken && tokensEqual(pressedToken, event.token)) return
			if (pressedToken) {
				console.warn(`Release the current key before pressing another (received ${tokenToHex(event.token)}).`)
				return
			}
			pressedToken = event.token
			console.log(`  down ${tokenToHex(event.token)}`)
			return
		}

		if (!pressedToken || !tokensEqual(pressedToken, event.token)) {
			console.warn(`Ignored unmatched release ${tokenToHex(event.token)}.`)
			return
		}

		const posKey = keys[keyIndex]
		const token = tokenToHex(event.token)
		mappings.push({ posKey, token })
		console.log(`  up   ${token} -- recorded POS ${String(posKey).padStart(3, '0')}\n`)
		pressedToken = undefined
		keyIndex += 1

		if (keyIndex === keys.length) void finish()
		else prompt()
	})

	device.on('error', (error) => {
		console.error('HID error:', error)
		void close()
		process.exitCode = 1
	})

	process.once('SIGINT', () => {
		console.log(`\nInterrupted after ${mappings.length} verified key(s).`)
		void close()
	})
}
