import {
	type CardGenerator,
	createModuleLogger,
	type ModuleLogger,
	type SurfaceContext,
	type SurfaceDrawProps,
	type SurfaceInstance,
} from '@companion-surface/base'
import type { PrehKeyTecModel } from './models.js'
import { parsePosKeyReport } from './protocol/poskey-report.js'
import { PosKeyState } from './protocol/poskey-state.js'
import type { PrehHidTransport } from './transport/hid.js'

interface PrehKeyTecSurfaceConfig {
	logRawReports?: boolean
}

export class PrehKeyTecSurface implements SurfaceInstance {
	readonly #logger: ModuleLogger
	readonly #context: SurfaceContext
	readonly #transport: PrehHidTransport
	readonly #posKeyState: PosKeyState

	readonly surfaceId: string
	readonly productName: string

	#logRawReports = false

	constructor(
		surfaceId: string,
		productName: string,
		model: PrehKeyTecModel,
		transport: PrehHidTransport,
		context: SurfaceContext,
	) {
		this.surfaceId = surfaceId
		this.productName = productName
		this.#logger = createModuleLogger(`Instance/${surfaceId}`)
		this.#context = context
		this.#transport = transport
		this.#posKeyState = new PosKeyState(model, {
			onDown: (controlId) => this.#context.keyDownById(controlId),
			onUp: (controlId) => this.#context.keyUpById(controlId),
		})

		this.#transport.on('report', (report) => this.#handleReport(report))
		this.#transport.on('error', (error) => {
			this.#posKeyState.releaseAll()
			this.#context.disconnect(error)
		})
	}

	#handleReport(report: Uint8Array): void {
		if (this.#logRawReports) {
			this.#logger.debug(`Raw HID report: ${Buffer.from(report).toString('hex')}`)
		}

		for (const event of parsePosKeyReport(report)) {
			this.#posKeyState.handle(event)
		}
	}

	async init(): Promise<void> {}

	async close(): Promise<void> {
		this.#posKeyState.releaseAll()
		await this.#transport.close()
	}

	async updateConfig(config: PrehKeyTecSurfaceConfig): Promise<void> {
		this.#logRawReports = config.logRawReports === true
	}

	async ready(): Promise<void> {}

	async setBrightness(_percent: number): Promise<void> {}

	async blank(): Promise<void> {}

	async draw(_signal: AbortSignal, _drawProps: SurfaceDrawProps): Promise<void> {}

	async showStatus(_signal: AbortSignal, _cardGenerator: CardGenerator, _statusMessage: string): Promise<void> {}
}
