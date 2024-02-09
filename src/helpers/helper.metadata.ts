import { Agent, parse } from 'useragent'
import { DetectResult } from 'node-device-detector'
import DeviceHelper from 'node-device-detector/helper'

import { deviceDetector, navigatorPlatform } from '~/helpers/helper.navigator'
import { ConfigsEnvironment } from '~/configs/config.env'
import { randomDeviceId, randomIMEI, randomIfNoneMatch, randomXGDParams } from '~/helpers/helper.randomString'

interface DeviceInfo {
	model: string
	platform: string
	version: string
	deviceId: string
	imei: any
}

interface VersionApp {
	code: string
	number: string
}

export class Metadata {
	private static readonly userAgentMetadata: Agent = parse(ConfigsEnvironment.USER_AGENT.data.userAgent)
	static readonly deviceDetector: DetectResult = deviceDetector()
	static readonly isDesktop: boolean = DeviceHelper.isDesktop(Metadata.deviceDetector)

	static readonly secChUa: string = `"${!Metadata.isDesktop ? Metadata.deviceDetector.client.name : Metadata.userAgentMetadata.family}";v="${Metadata.deviceDetector.client.version}"`
	static readonly secChUaMobile: string = `?${!Metadata.isDesktop ? 1 : 0}`
	static readonly secChUaPlatform: string = navigatorPlatform()
	static readonly version: string = !Metadata.isDesktop ? 'app' : 'website'

	static readonly deviceInfo: DeviceInfo = {
		model: !Metadata.isDesktop ? Metadata.deviceDetector.device.model : navigatorPlatform(),
		platform: !Metadata.isDesktop ? Metadata.deviceDetector.os.platform : navigatorPlatform(),
		version: !Metadata.isDesktop ? Metadata.deviceDetector.os.version : Metadata.deviceDetector.os.version,
		deviceId: !Metadata.isDesktop ? randomDeviceId() : '',
		imei: !Metadata.isDesktop ? randomIMEI() : ''
	}

	static readonly versionApps: VersionApp = {
		code: !Metadata.isDesktop ? '1.29.0' : '',
		number: !Metadata.isDesktop ? '17007' : ''
	}

	static readonly xGdParams: string = randomXGDParams(40)
	static readonly ifNoneMatch: string = randomIfNoneMatch(27)
}
