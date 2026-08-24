import { EventEmitter } from 'node:events'
import { HIDAsync } from 'node-hid'

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

	async close(): Promise<void> {
		if (this.#closed) return
		this.#closed = true
		await this.#device.close()
		this.removeAllListeners()
	}
}
