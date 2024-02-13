import { Request, Response, Handler, NextFunction } from 'express'
import { OutgoingMessage } from 'http'

import { UsersService } from '~/services/service.users'
import { Controller, Inject } from '~/helpers/helper.di'
import { ApiResponse } from '~/helpers/helper.apiResponse'
import { rawParser } from '~/helpers/helper.rawParser'
import { UsersLoginDTO, UsersRecordAttendanceDTO, UsersSetLocationDTO } from '~/dtos/dto.users'

@Controller()
export class UsersController {
	constructor(
		@Inject('UsersService')
		private readonly usersService: UsersService
	) {}

	usersLogin(): Handler {
		return async (req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersLogin(rawParser<UsersLoginDTO>(req.body))
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersProfile(): Handler {
		return async (_req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersProfile()
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersSetLocation(): Handler {
		return async (req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersSetLocation(rawParser<UsersSetLocationDTO>(req.body))
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersUploadAttendancePhoto(): Handler {
		return async (req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersUploadAttendancePhoto(rawParser<Express.Multer.File>(req.file))
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersRecordAttendance(): Handler {
		return async (req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersRecordAttendance(rawParser<UsersRecordAttendanceDTO>(req.body))
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersAttendanceToday(): Handler {
		return async (_req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersAttendanceToday()
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}

	usersAttendanceTemp(): Handler {
		return async (_req: Request, res: Response, _next: NextFunction): Promise<OutgoingMessage> => {
			try {
				const users: ApiResponse = await this.usersService.usersAttendanceTemp()
				return res.status(users.stat_code).json(users)
			} catch (e: any) {
				return res.status(e.stat_code).json(e)
			}
		}
	}
}
