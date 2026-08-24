import { posKeyToControlId, type PrehKeyTecModel } from '../models.js'
import type { PosKeyEvent } from './poskey-report.js'

export interface PosKeyStateCallbacks {
	onDown(controlId: string): void
	onUp(controlId: string): void
}

/** Deduplicates reports and guarantees matching releases on disconnect. */
export class PosKeyState {
	readonly #model: PrehKeyTecModel
	readonly #callbacks: PosKeyStateCallbacks
	readonly #pressed = new Map<number, string>()

	constructor(model: PrehKeyTecModel, callbacks: PosKeyStateCallbacks) {
		this.#model = model
		this.#callbacks = callbacks
	}

	handle(event: PosKeyEvent): void {
		const controlId = posKeyToControlId(this.#model, event.posKey)
		if (!controlId) return

		if (event.pressed) {
			if (this.#pressed.has(event.posKey)) return
			this.#pressed.set(event.posKey, controlId)
			this.#callbacks.onDown(controlId)
		} else {
			if (!this.#pressed.delete(event.posKey)) return
			this.#callbacks.onUp(controlId)
		}
	}

	releaseAll(): void {
		for (const controlId of this.#pressed.values()) {
			this.#callbacks.onUp(controlId)
		}
		this.#pressed.clear()
	}
}
