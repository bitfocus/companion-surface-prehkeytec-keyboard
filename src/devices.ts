import type { HIDDevice } from '@companion-surface/base'
import type { PrehKeyTecModelId } from './models.js'

export interface SupportedPrehKeyTecDevice {
	vendorId: number
	productId: number
	modelId: PrehKeyTecModelId
	/** Restrict the match to the POSKey HID interface when known. */
	interface?: number
	/** Restrict the match to the POSKey HID usage page when known. */
	usagePage?: number
}

/**
 * Deliberately empty until IDs and the POSKey HID interface have been observed
 * on hardware or confirmed by PrehKeyTec. Do not add the normal keyboard
 * interface here.
 */
export const SUPPORTED_DEVICES: readonly SupportedPrehKeyTecDevice[] = []

export function matchSupportedDevice(device: HIDDevice): SupportedPrehKeyTecDevice | undefined {
	return SUPPORTED_DEVICES.find((candidate) => {
		if (candidate.vendorId !== device.vendorId || candidate.productId !== device.productId) return false
		if (candidate.interface !== undefined && candidate.interface !== device.interface) return false
		if (candidate.usagePage !== undefined && candidate.usagePage !== device.usagePage) return false
		return true
	})
}

export function getManifestUsbIds(): Array<{ vendorId: number; productIds: number[] }> {
	const idsByVendor = new Map<number, Set<number>>()

	for (const device of SUPPORTED_DEVICES) {
		let productIds = idsByVendor.get(device.vendorId)
		if (!productIds) {
			productIds = new Set<number>()
			idsByVendor.set(device.vendorId, productIds)
		}
		productIds.add(device.productId)
	}

	return [...idsByVendor.entries()]
		.sort(([left], [right]) => left - right)
		.map(([vendorId, productIds]) => ({
			vendorId,
			productIds: [...productIds].sort((left, right) => left - right),
		}))
}
