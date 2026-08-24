import type { PrehKeyTecModelId } from '../models.js'

export const PREH_DEVICE_IDENTITY_COMMAND = [0xef, 0x50, 0xef, 0x10] as const
export const PREH_DEVICE_IDENTITY_START = 0x86
export const PREH_DEVICE_IDENTITY_END = 0x96

export interface PrehDeviceIdentity {
	versionString: string
	productCode: string
	serialNumber: string
}

export function parsePrehDeviceIdentity(bytes: readonly number[]): PrehDeviceIdentity | undefined {
	const versionString = Buffer.from(bytes).toString('latin1').replace(/\0/g, '').trim()
	const productCode = /^ID\s+(.+)$/im.exec(versionString)?.[1].trim()
	if (!productCode) return undefined

	return {
		versionString,
		productCode,
		serialNumber: /^SN\s+(.+)$/im.exec(versionString)?.[1].trim() ?? '',
	}
}

export function modelIdFromProductCode(productCode: string): PrehKeyTecModelId | undefined {
	const match = /^\s*(MCI|MSI)\s*[- ]?\s*(128A|128|3100|3000|96|84|60|30)(?=[^0-9]|$)/i.exec(productCode)
	if (!match) return undefined

	const family = match[1].toUpperCase()
	const model = match[2].toUpperCase()
	if (family === 'MSI') return model === '60' ? 'msi-60' : undefined

	switch (model) {
		case '30':
			return 'mci-30'
		case '60':
			return 'mci-60'
		case '84':
			return 'mci-84'
		case '96':
			return 'mci-96'
		case '128':
			return 'mci-128'
		case '128A':
			return 'mci-128a'
		case '3000':
			return 'mci-3000'
		case '3100':
			return 'mci-3100'
		default:
			return undefined
	}
}
