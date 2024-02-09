import { StatusCodes as status } from 'http-status-codes'
import FormDataNode from 'form-data'

import { ConfigsEnvironment } from '~/configs/config.env'
import { UsersLoginDTO, UsersSetLocationDTO } from '~/dtos/dto.users'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Injectable } from '~/helpers/helper.di'
import { Metadata } from '~/helpers/helper.metadata'
import { randomXGDParams } from '~/helpers/helper.randomString'
import { Axios, EAxiosHttpMethod } from '~/libs/lib.axios'

interface ISearchCompany {
	companyName: string
	companyCode: string
}

interface ICheckLADP {
	message: string
	data: boolean
	uid: string
}

interface ICheckLDAPAndSearchCompany {
	company: ISearchCompany
	ldap: ICheckLADP
}

export interface IUser {
	id: string
	userId: number
	empId: string
	empNo: string
	fullName: string
	email: string
	position: string
	ttl: number
	companyId: string
	companyCode: string
	company: ISearchCompany
}

export interface ICurrentTime {
	message: string
	data: string
	serverTime: string
	serverGMT: string
}

export interface ISetLocation {
	latitude: number
	longitude: number
}

@Injectable()
export class GreatDayProvider {
	private async seachCompany(axios: Axios, companyName: string): Promise<ISearchCompany> {
		try {
			const company: Record<string, any> = await axios.request({
				url: ConfigsEnvironment.GRD_DATAON_URL,
				path: `/sfCompany/search?company=${companyName}`,
				method: EAxiosHttpMethod.GET,
				configs: {
					headers: {
						'Accept': 'application/json, text/plain, */*',
						'Accept-Language': 'en-US,en;q=0.5',
						'Accept-Encoding': 'gzip, deflate, br',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'timeout': '10000',
						'app': 'gd8',
						'version': Metadata.version,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'DNT': '1',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'cross-site',
						'ngsw-bypass': '',
						'Key': '',
						'Connection': 'keep-alive',
						'If-None-Match': `W/"77-${Metadata.ifNoneMatch}"`,
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!company.data.length) {
				throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid company' })
			}

			return company.data[0]
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	private async checkLDAP(axios: Axios, companyName: string, uid: string): Promise<ICheckLDAPAndSearchCompany> {
		try {
			const company: ISearchCompany = await this.seachCompany(axios, companyName)

			const ldap: ICheckLADP = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: `/auth/checkLDAP?ist=${company.companyCode}&uid=${uid}`,
				method: EAxiosHttpMethod.GET,
				configs: {
					headers: {
						'Accept': 'application/json, text/plain, */*',
						'Accept-Language': 'en-US,en;q=0.5',
						'Accept-Encoding': 'gzip, deflate, br',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'isUpload': 'true',
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'DNT': '1',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						'Connection': 'keep-alive',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!ldap?.uid) {
				throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid uid' })
			}

			return { company, ldap }
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async authLogin(axios: Axios, body: UsersLoginDTO): Promise<IUser> {
		try {
			const { company, ldap }: ICheckLDAPAndSearchCompany = await this.checkLDAP(axios, body.company, body.uid)

			const userLogin: IUser = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: '/auth/login',
				method: EAxiosHttpMethod.POST,
				data: {
					username: ldap.uid,
					password: body.password,
					pswd: randomXGDParams(40),
					npwd: randomXGDParams(40),
					ist: company.companyCode,
					preLoginData: {
						SFPATH: 'http://172.17.200.215:8082/sf6/index.cfm',
						SF7PATH: 'https://workplaze.dataon.com',
						MODE: [],
						ACCOUNT: company.companyCode,
						IST: company.companyCode.replace(/[^\d]/gi, ''),
						CUSTOM: [],
						ACCOUNTNAME: company.companyName,
						GOPATH: 'https://apigreatday.dataon.com',
						GOPATHNEW: ConfigsEnvironment.GRD_ORIGIN_URL,
						PAYROLLPATH: 'https://payroll.greatdayhr.com'
					},
					deviceInfo: {
						SFGOVersionNumber: '',
						SFGOVersionCode: '',
						Model: Metadata.deviceInfo.model,
						Platform: Metadata.deviceInfo.platform,
						Version: Metadata.deviceInfo.version,
						DeviceID: Metadata.deviceInfo.deviceId,
						IMEI: Metadata.deviceInfo.imei,
						Ready: true,
						tokenFCM: ''
					},
					keep: true,
					versionApps: Metadata.versionApps,
					language: 'en',
					ssoAuthCode: false,
					ssoTAM: false
				},
				configs: {
					headers: {
						'Accept': 'application/json, text/plain, */*',
						'Accept-Language': 'en-US,en;q=0.5',
						'Accept-Encoding': 'gzip, deflate, br',
						'Content-Type': 'application/json',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'timeout': '60000',
						'app': 'gd8',
						'version': Metadata.version,
						'X-GD-Params': Metadata.xGdParams,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'DNT': '1',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						'ngsw-bypass': '',
						'Key': '',
						'Connection': 'keep-alive',
						'TE': 'trailers',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!userLogin?.userId) {
				throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, err_message: 'Invalid password' })
			}

			return userLogin
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async profile(axios: Axios, user: IUser): Promise<Record<string, any>> {
		try {
			const userProfile: Record<string, any> = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: '/auth/profile',
				method: EAxiosHttpMethod.GET,
				configs: {
					headers: {
						'Accept': 'application/json',
						'Accept-Language': 'en-US,en;q=0.5',
						'Accept-Encoding': 'gzip, deflate, br',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'timeout': '60000',
						'app': 'gd8',
						'version': Metadata.version,
						'Content-Type': 'application/json; charset=utf-8',
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'DNT': '1',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						'ngsw-bypass': '',
						'Key': '',
						'Authorization': user.id,
						'Connection': 'keep-alive',
						'If-None-Match': `W/"273-${Metadata.ifNoneMatch}-"`,
						'TE': 'trailers',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!userProfile?.data) {
				throw apiResponse({ stat_code: status.NOT_ACCEPTABLE, err_message: 'User profile not found' })
			}

			return userProfile.data
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	private async currentTime(axios: Axios, sessionId: string): Promise<ICurrentTime> {
		try {
			const currentTime: ICurrentTime = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: '/currentTime',
				method: EAxiosHttpMethod.GET,
				configs: {
					headers: {
						'Connection': 'keep-alive',
						'sec-ch-ua': Metadata.secChUa,
						'timeout': '60000',
						'DNT': '1',
						'version': Metadata.version,
						'sec-ch-ua-mobile': Metadata.secChUaMobile,
						'Authorization': sessionId,
						'ngsw-bypass': '',
						'Accept': 'application/json',
						'Key': '',
						'app': 'gd8',
						'sec-ch-ua-platform': Metadata.secChUaPlatform,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Sec-Fetch-Site': 'same-site',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Dest': 'empty',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
						'Content-Type': 'application/json; charset=utf-8',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			return currentTime
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async checkLocation(axios: Axios, user: IUser, body: UsersSetLocationDTO): Promise<Record<string, any>> {
		try {
			const checkLocation: Record<string, any> = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: '/ttademplocation/checkLocation',
				method: EAxiosHttpMethod.POST,
				data: {
					empId: user.empId,
					lat: body.latitude,
					lng: body.longitude
				},
				configs: {
					headers: {
						'Connection': 'keep-alive',
						'sec-ch-ua': Metadata.secChUa,
						'timeout': '60000',
						'DNT': '1',
						'version': Metadata.version,
						'sec-ch-ua-mobile': Metadata.secChUaMobile,
						'Authorization': user.id,
						'ngsw-bypass': '',
						'Accept': 'application/json',
						'X-GD-Params': Metadata.xGdParams,
						'Key': '',
						'app': 'gd8',
						'sec-ch-ua-platform': Metadata.secChUaPlatform,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Sec-Fetch-Site': 'same-site',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Dest': 'empty',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
						'Content-Type': 'application/json; charset=UTF-8',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!checkLocation?.data) {
				throw apiResponse({ stat_code: status.PRECONDITION_FAILED, err_message: 'Set location failed' })
			}

			return checkLocation.data
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async uploadAttendancePhoto(axios: Axios, formData: FormDataNode, user: IUser) {
		try {
			const uploadAttendancePhoto: Record<string, any> = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: `/storage/upload/storageAttendance/${user.companyCode}?access_token=${user.id}`,
				method: EAxiosHttpMethod.POST,
				data: formData,
				configs: {
					headers: {
						...formData.getHeaders(),
						'Connection': 'keep-alive',
						'sec-ch-ua': Metadata.secChUa,
						'timeout': '300000',
						'DNT': '1',
						'version': Metadata.version,
						'sec-ch-ua-mobile': Metadata.secChUaMobile,
						'Authorization': user.id,
						'ngsw-bypass': '',
						'Accept': 'application/json, text/plain, */*',
						'X-GD-Params': Metadata.xGdParams,
						'app': 'gd8',
						'isUpload': 'true',
						'sec-ch-ua-platform': Metadata.secChUaPlatform,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Sec-Fetch-Site': 'same-site',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Dest': 'empty',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!uploadAttendancePhoto?.data) {
				throw apiResponse({ stat_code: status.PRECONDITION_FAILED, err_message: 'Upload attendance failed' })
			}

			return uploadAttendancePhoto.data
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async recordAttendance(axios: Axios, user: IUser, location: ISetLocation, fileName: string) {
		try {
			const currentTime: ICurrentTime = await this.currentTime(axios, user.id)

			const recordAttendance: any = await axios.request({
				url: ConfigsEnvironment.GRD_EPIC_URL,
				path: '/attendances/recordTime',
				method: EAxiosHttpMethod.POST,
				data: {
					empId: user.empId,
					time: currentTime.data,
					geolocation: {
						latitude: location.latitude,
						longitude: location.longitude,
						accuracy: 12.976,
						cacheLocation: false,
						address: ''
					},
					picture: fileName,
					flagButton: {
						innow: true,
						outnow: true,
						inyesterday: false,
						outyesterday: false,
						intomorrow: false
					},
					attOn: 'online',
					address: null,
					faceRecognition: {
						accuration: 0,
						liveness: null,
						livenessTreshold: 0.5,
						livenessCrashCount: 0,
						deviceInfo: `
					{"SFGOVersionNumber":"",
					"SFGOVersionCode":"",
					"Model":"${Metadata.deviceInfo.model}",
					"Platform":"${Metadata.deviceInfo.platform}",
					"Version":"${Metadata.deviceInfo.version}",
					"DeviceID":${Metadata.deviceInfo.deviceId},
					"IMEI":${Metadata.deviceInfo.imei},
					"Ready":true,
					"tokenFCM":""}
					`,
						gdVersion: ''
					},
					setBasePhoto: false
				},
				configs: {
					headers: {
						'Connection': 'keep-alive',
						'sec-ch-ua': Metadata.secChUa,
						'timeout': '60000',
						'DNT': '1',
						'version': Metadata.version,
						'sec-ch-ua-mobile': Metadata.secChUaMobile,
						'Authorization': user.id,
						'ngsw-bypass': '',
						'Accept': 'application/json',
						'X-GD-Params': Metadata.xGdParams,
						'Key': '',
						'app': 'gd8',
						'sec-ch-ua-platform': Metadata.secChUaPlatform,
						'Origin': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Sec-Fetch-Site': 'same-site',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Dest': 'empty',
						'Referer': ConfigsEnvironment.GRD_ORIGIN_URL,
						'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
						'Content-Type': 'application/json; charset=UTF-8',
						'User-Agent': ConfigsEnvironment.USER_AGENT.data.userAgent
					}
				}
			})

			if (!recordAttendance) {
				throw apiResponse({ stat_code: status.PRECONDITION_REQUIRED, err_message: 'Record attendance failed' })
			}

			return recordAttendance
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	listAttendance() {}
}
