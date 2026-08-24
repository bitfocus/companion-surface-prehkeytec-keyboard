import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getManifestUsbIds } from '../dist/devices.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(projectRoot, 'companion', 'manifest.json')
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))

manifest.usbIds = getManifestUsbIds()
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
