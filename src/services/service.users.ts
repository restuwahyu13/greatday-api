import { StatusCodes as status } from 'http-status-codes'
import FormDataNode from 'form-data'
import { promisify } from 'util'
import { unlink } from 'fs'

import { Inject, Service } from '~/helpers/helper.di'
import { apiResponse, ApiResponse } from '~/helpers/helper.apiResponse'
import { UsersLoginDTO, UsersSetLocationDTO } from '~/dtos/dto.users'
import { Axios } from '~/libs/lib.axios'
import { JsonWebToken } from '~/libs/lib.jwt'
import { Redis } from '~/libs/lib.redis'
import { GreatDayProvider, ISetLocation, IUser } from '~/providers/provider.greatDay'
import { UsersMetadata } from '~/helpers/helper.usersMetadata'
import { FormData } from '~/libs/lib.formdata'
import { ConfigsEnvironment } from '~/configs/config.env'
import { resolve } from 'path'

@Service()
export class UsersService {
	constructor(
		@Inject('GreatDayProvider')
		private readonly greatDayProvider: GreatDayProvider,
		@Inject('UsersMetadata')
		private readonly usersMetadata: UsersMetadata,
		@Inject('Axios')
		private readonly axiosLibs: Axios,
		@Inject('Redis')
		private readonly redisLibs: Redis,
		@Inject('Jwt')
		private readonly jwtLibs: JsonWebToken,
		@Inject('FormData')
		private readonly formDataLibs: FormData
	) {}

	async usersLogin(body: UsersLoginDTO): Promise<ApiResponse> {
		try {
			const user: IUser = await this.greatDayProvider.authLogin(this.axiosLibs, body)

			const tokenKey: string = `${user.userId}:data`
			const tokenExist: number = await this.redisLibs.hexists(tokenKey, 'users')

			if (tokenExist <= 0) {
				const tokenData: Record<string, any> = {
					id: user.id,
					userId: user.userId,
					empId: user.empId,
					empNo: user.empNo,
					fullName: user.fullName,
					email: user.email,
					position: user.position,
					companyId: user.companyId,
					companyCode: user.companyCode,
					companyName: user.company.companyName
				}

				await this.redisLibs.hsetEx(tokenKey, 'users', user.ttl, tokenData)
			}

			const accessToken: string = await this.jwtLibs.sign(user.userId.toString(), body)

			return apiResponse({ stat_code: status.OK, stat_message: 'Success', data: accessToken })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async usersProfile(): Promise<any> {
		try {
			const user: IUser = this.usersMetadata.user()
			const userProfile: Record<string, any> = await this.greatDayProvider.profile(this.axiosLibs, user)

			return apiResponse({ stat_code: status.OK, stat_message: 'Success', data: userProfile })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async usersSetLocation(body: UsersSetLocationDTO): Promise<any> {
		try {
			const user: IUser = this.usersMetadata.user()
			const checkLocaion: Record<string, any> = await this.greatDayProvider.checkLocation(this.axiosLibs, user, body)

			if (checkLocaion) {
				await this.redisLibs.hsetEx(`${user.id}:location`, 'users', user.ttl, body)
			}

			return apiResponse({ stat_code: status.OK, stat_message: 'Success', data: checkLocaion })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async usersUploadAttendancePhoto(file: Express.Multer.File): Promise<ApiResponse> {
		try {
			const user: IUser = this.usersMetadata.user()
			const form: FormDataNode = await this.formDataLibs.append(file.filename)

			const uploadAttendancePhoto: Record<string, any> = await this.greatDayProvider.uploadAttendancePhoto(this.axiosLibs, form, user)

			if (uploadAttendancePhoto) {
				await this.redisLibs.set(`${user.id}:filename`, uploadAttendancePhoto.filename)
			}

			return apiResponse({ stat_code: 200, stat_message: 'Success', data: uploadAttendancePhoto.data })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async usersRecordAttendance(): Promise<any> {
		try {
			const user: IUser = this.usersMetadata.user()
			const fileName: string = await this.redisLibs.get(`${user.id}:filename`)
			const location: ISetLocation = await this.redisLibs.hget(`${user.id}:location`, 'users')

			if (!fileName && !location) {
				throw apiResponse({ stat_code: status.PRECONDITION_REQUIRED, err_message: 'Filename and location required' })
			}

			const recordAttendance: Record<string, any> = await this.greatDayProvider.recordAttendance(this.axiosLibs, user, location, fileName)

			if (recordAttendance) {
				const unlinkAsync = promisify(unlink)
				await unlinkAsync(resolve(ConfigsEnvironment.STORAGE_DIR, fileName))
			}

			return apiResponse({ stat_code: status.OK, stat_message: 'Success', data: recordAttendance })
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}
}
