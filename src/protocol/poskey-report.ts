export interface PosKeyEvent {
	posKey: number
	pressed: boolean
}

/**
 * Decode one raw report from the separate PrehKeyTec POSKey HID interface.
 *
 * The public vendor API exposes the decoded key number and pressed/released
 * flag, but the underlying report bytes have not yet been confirmed. Keeping
 * this boundary explicit lets the rest of the surface be developed and tested
 * without guessing at a protocol.
 */
export function parsePosKeyReport(_report: Uint8Array): PosKeyEvent[] {
	return []
}
