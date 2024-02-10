import { Inject, Route, Router } from '~/helpers/helper.di'
import { UsersController } from '~/controllers/controller.users'
import { UsersLoginDTO, UsersRecordAttendanceDTO, UsersSetLocationDTO } from '~/dtos/dto.users'
import { ValidatorMiddleware } from '~/middlewares/middleware.validator'
import { AuthorizationMiddleware } from '~/middlewares/middleware.auth'
import { FilesMiddleware } from '~/middlewares/middleware.upload'
import { Multer } from '~/libs/lib.multer'

@Route()
export class UsersRoute {
	private router: Router

	constructor(
		@Inject('UsersController')
		private readonly usersController: UsersController,
		@Inject('AuthMiddleware')
		private readonly authMiddleware: AuthorizationMiddleware,
		@Inject('FilesMiddleware')
		private readonly filesMiddleware: FilesMiddleware,
		@Inject('ValidatorMiddleware')
		private readonly validatorMiddleware: ValidatorMiddleware,
		@Inject('Multer')
		private readonly multerLibs: Multer
	) {
		this.router = Router({ strict: true, caseSensitive: true })
	}

	main(): Router {
		this.router.post('/login', [this.validatorMiddleware.use(UsersLoginDTO)], this.usersController.usersLogin())
		this.router.get('/profile', [this.authMiddleware.use], this.usersController.usersProfile())
		this.router.post(
			'/set-location',
			[this.authMiddleware.use, this.validatorMiddleware.use(UsersSetLocationDTO)],
			this.usersController.usersSetLocation()
		)
		this.router.post(
			'/upload-attendance',
			[this.authMiddleware.use, this.filesMiddleware.use(this.multerLibs.file, 'file')],
			this.usersController.usersUploadAttendancePhoto()
		)
		this.router.post(
			'/record-attendance',
			[this.authMiddleware.use, this.validatorMiddleware.use(UsersRecordAttendanceDTO)],
			this.usersController.usersRecordAttendance()
		)

		return this.router
	}
}
