import UserAgent from 'user-agents'
import DeviceDetector, { DetectResult } from 'node-device-detector'
import DeviceHelper from 'node-device-detector/helper'

import { ConfigsEnvironment } from '~/configs/config.env'

export enum ENavigatorPlatfrom {
	ANDROID = 'android',
	MACOS = 'macOS',
	WINDOWS = 'windows'
}

export const navigatorPlatform = (): string => {
	let platform: string = deviceDetector().device.type
	const isDesktop: boolean = DeviceHelper.isDesktop(deviceDetector())

	const userAgent: UserAgent = ConfigsEnvironment.USER_AGENT

	if (!isDesktop && /macintel/i.test(userAgent.data.platform.toLocaleLowerCase().trim())) {
		platform = ENavigatorPlatfrom.MACOS
	} else if (!isDesktop && /win32/i.test(userAgent.data.platform.toLocaleLowerCase().trim())) {
		platform = ENavigatorPlatfrom.WINDOWS
	}

	return platform
}

export const deviceDetector = (): DetectResult => {
	const userAgent: UserAgent = ConfigsEnvironment.USER_AGENT

	const detector: DeviceDetector = new DeviceDetector({
		clientIndexes: true,
		deviceIndexes: true,
		skipBotDetection: true,
		deviceAliasCode: false
	})

	let detectorMetadata: DetectResult = detector.detect(userAgent.data.userAgent)
	if (detectorMetadata.os.platform == '') {
		detectorMetadata.os.platform = detectorMetadata.device.model
	}

	return detectorMetadata
}
