import {
	createModuleLogger,
	type DetectionSurfaceInfo,
	type HIDDevice,
	type OpenSurfaceResult,
	type SurfaceContext,
	type SurfacePlugin,
} from '@companion-surface/base'
import { devicesAsync, type Device } from 'node-hid'
import { matchSupportedDevice, type SupportedPrehKeyTecDevice } from './devices.js'
import { PrehKeyTecSurface } from './instance.js'
import { modelSurfaceDescription, PREHKEYTEC_MODELS } from './models.js'
import { modelIdFromProductCode } from './protocol/device-identity.js'
import { createSurfaceSchema } from './surface-schema.js'
import { PrehHidTransport } from './transport/hid.js'

interface PrehPluginInfo {
	device: HIDDevice
	definition: SupportedPrehKeyTecDevice
}

const logger = createModuleLogger('Plugin')

function toSurfaceHidDevice(device: Device): HIDDevice | undefined {
	if (!device.path) return undefined
	return {
		vendorId: device.vendorId,
		productId: device.productId,
		path: device.path,
		serialNumber: device.serialNumber ?? '',
		manufacturer: device.manufacturer,
		product: device.product,
		release: device.release,
		interface: device.interface,
		usagePage: device.usagePage,
		usage: device.usage,
	}
}

async function scanDevice(nodeHidDevice: Device): Promise<DetectionSurfaceInfo<PrehPluginInfo> | undefined> {
	const device = toSurfaceHidDevice(nodeHidDevice)
	if (!device) return undefined

	const baseDefinition = matchSupportedDevice(device)
	if (!baseDefinition) return undefined

	let transport: PrehHidTransport | undefined
	let productCode = ''
	let hardwareSerial = ''
	let modelId = baseDefinition.modelId
	try {
		transport = await PrehHidTransport.open(device.path)
		const identity = await transport.readDeviceIdentity()
		const identifiedModelId = identity ? modelIdFromProductCode(identity.productCode) : undefined
		if (identity) {
			productCode = identity.productCode
			hardwareSerial = identity.serialNumber
		}
		if (identifiedModelId) modelId = identifiedModelId
	} catch (error) {
		logger.warn(`Could not identify the PrehKeyTec model on ${device.path}: ${String(error)}`)
	} finally {
		await transport?.close()
	}

	const definition = modelId === baseDefinition.modelId ? baseDefinition : { ...baseDefinition, modelId }
	const exactModelDetected = productCode !== '' && modelIdFromProductCode(productCode) !== undefined
	const description = exactModelDetected
		? modelSurfaceDescription(PREHKEYTEC_MODELS[modelId])
		: 'PrehKeyTec programmable keyboard'
	logger.info(
		`Scanned ${description}${productCode ? ` (${productCode})` : ''}${hardwareSerial ? `, serial ${hardwareSerial}` : ''}`,
	)

	return {
		deviceHandle: device.path,
		surfaceId: `prehkeytec:${hardwareSerial || device.serialNumber || device.productId}`,
		surfaceIdIsNotUnique: !hardwareSerial && !device.serialNumber,
		description,
		pluginInfo: { device, definition },
	}
}

const PrehKeyTecPlugin: SurfacePlugin<PrehPluginInfo> = {
	async init(): Promise<void> {},

	async destroy(): Promise<void> {},

	async scanForSurfaces(): Promise<DetectionSurfaceInfo<PrehPluginInfo>[]> {
		const surfaces: DetectionSurfaceInfo<PrehPluginInfo>[] = []
		for (const device of await devicesAsync()) {
			const surface = await scanDevice(device)
			if (surface) surfaces.push(surface)
		}
		return surfaces
	},

	async openSurface(
		surfaceId: string,
		pluginInfo: PrehPluginInfo,
		context: SurfaceContext,
	): Promise<OpenSurfaceResult> {
		const transport = await PrehHidTransport.open(pluginInfo.device.path)
		let modelId = pluginInfo.definition.modelId
		try {
			const identity = await transport.readDeviceIdentity()
			const identifiedModelId = identity ? modelIdFromProductCode(identity.productCode) : undefined
			if (identifiedModelId) {
				modelId = identifiedModelId
				logger.info(
					`Detected ${identity?.productCode}${identity?.serialNumber ? `, serial ${identity.serialNumber}` : ''}`,
				)
			} else {
				logger.warn(`Could not identify the exact PrehKeyTec model; using ${modelId} as fallback`)
			}
		} catch (error) {
			logger.warn(`PrehKeyTec model query failed; using ${modelId} as fallback: ${String(error)}`)
		}

		const model = PREHKEYTEC_MODELS[modelId]
		const description = modelSurfaceDescription(model)

		return {
			surface: new PrehKeyTecSurface(surfaceId, description, model, transport, context),
			registerProps: {
				brightness: false,
				surfaceLayout: createSurfaceSchema(model),
				pincodeMap: null,
				location: null,
				transferVariables: undefined,
				configFields: [
					{
						id: 'logRawReports',
						type: 'checkbox',
						label: 'Log raw HID reports (development)',
						default: false,
					},
				],
			},
		}
	},
}

export default PrehKeyTecPlugin
