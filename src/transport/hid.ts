import { EventEmitter } from 'node:events'
import { HIDAsync } from 'node-hid'
import {
	parsePrehDeviceIdentity,
	PREH_DEVICE_IDENTITY_COMMAND,
	PREH_DEVICE_IDENTITY_END,
	PREH_DEVICE_IDENTITY_START,
	type PrehDeviceIdentity,
} from '../protocol/device-identity.js'

interface PrehHidTransportEvents {
	report: [report: Uint8Array]
	error: [error: Error]
}

function toError(value: unknown): Error {
	return value instanceof Error ? value : new Error(String(value))
}

export class PrehHidTransport extends EventEmitter<PrehHidTransportEvents> {
	readonly #device: HIDAsync
	#closed = false

	private constructor(device: HIDAsync) {
		super()
		this.#device = device

		device.on('data', (report: Buffer) => {
			this.emit('report', new Uint8Array(report))
		})
		device.on('error', (error: unknown) => {
			this.emit('error', toError(error))
		})
	}

	static async open(path: string): Promise<PrehHidTransport> {
		const device = await HIDAsync.open(path, { nonExclusive: process.platform === 'darwin' })
		return new PrehHidTransport(device)
	}

	async readDeviceIdentity(timeoutMs = 2_000): Promise<PrehDeviceIdentity | undefined> {
		const bytes: number[] = []
		let receiving = false
		let timeout: ReturnType<typeof setTimeout> | undefined
		let onReport: ((report: Uint8Array) => void) | undefined

		const response = new Promise<PrehDeviceIdentity | undefined>((resolve) => {
			onReport = (report) => {
				if (report[0] !== 0x04 || report[2] !== 0 || report[3] !== 0 || report[4] !== 0) return

				const byte = report[1]
				if (!receiving) {
					if (byte !== PREH_DEVICE_IDENTITY_START) return
					receiving = true
					return
				}

				if (byte === PREH_DEVICE_IDENTITY_END) {
					resolve(parsePrehDeviceIdentity(bytes))
					return
				}
				bytes.push(byte)
			}
			this.on('report', onReport)
			timeout = setTimeout(() => resolve(undefined), timeoutMs)
		})

		try {
			for (const byte of PREH_DEVICE_IDENTITY_COMMAND) {
				await this.#device.write([0x04, byte])
			}
			return await response
		} finally {
			if (timeout) clearTimeout(timeout)
			if (onReport) this.off('report', onReport)
		}
	}

	async close(): Promise<void> {
		if (this.#closed) return
		this.#closed = true
		await this.#device.close()
		this.removeAllListeners()
	}
}
