import {
	createModuleLogger,
	type DiscoveredSurfaceInfo,
	type HIDDevice,
	type OpenSurfaceResult,
	type SurfaceContext,
	type SurfacePlugin,
} from '@companion-surface/base'
import { matchSupportedDevice, type SupportedPrehKeyTecDevice } from './devices.js'
import { PrehKeyTecSurface } from './instance.js'
import { PREHKEYTEC_MODELS } from './models.js'
import { createSurfaceSchema } from './surface-schema.js'
import { PrehHidTransport } from './transport/hid.js'

interface PrehPluginInfo {
	device: HIDDevice
	definition: SupportedPrehKeyTecDevice
}

const logger = createModuleLogger('Plugin')

const PrehKeyTecPlugin: SurfacePlugin<PrehPluginInfo> = {
	async init(): Promise<void> {},

	async destroy(): Promise<void> {},

	checkSupportsHidDevice(device: HIDDevice): DiscoveredSurfaceInfo<PrehPluginInfo> | null {
		const definition = matchSupportedDevice(device)
		if (!definition) return null

		const model = PREHKEYTEC_MODELS[definition.modelId]
		logger.debug(
			`Matched ${device.manufacturer ?? 'PrehKeyTec'} ${device.product ?? model.name}, interface ${device.interface}`,
		)

		return {
			surfaceId: `prehkeytec:${device.serialNumber}`,
			description: `${device.manufacturer ?? 'PrehKeyTec'} ${device.product ?? model.name}`.trim(),
			pluginInfo: { device, definition },
		}
	},

	async openSurface(
		surfaceId: string,
		pluginInfo: PrehPluginInfo,
		context: SurfaceContext,
	): Promise<OpenSurfaceResult> {
		const model = PREHKEYTEC_MODELS[pluginInfo.definition.modelId]
		const transport = await PrehHidTransport.open(pluginInfo.device.path)

		return {
			surface: new PrehKeyTecSurface(surfaceId, model.name, model, transport, context),
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
