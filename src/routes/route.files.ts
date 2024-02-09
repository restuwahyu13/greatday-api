import { Inject, Route, Router } from '~/helpers/helper.di'
import { FilesController } from '~/controllers/controller.files'
import { Multer } from '~/libs/lib.multer'
import { FilesMiddleware } from '~/middlewares/middleware.upload'
import { AuthorizationMiddleware } from '~/middlewares/middleware.authorization'

@Route()
export class FilesRoute {
	private router: Router

	constructor(
		@Inject('FilesController')
		private readonly filesController: FilesController,
		@Inject('AuthMiddleware')
		private readonly authMiddleware: AuthorizationMiddleware,
		@Inject('FilesMiddleware')
		private readonly filesMiddleware: FilesMiddleware,
		@Inject('Multer')
		private readonly multerLibs: Multer
	) {
		this.router = Router({ strict: true, caseSensitive: true })
	}

	main(): Router {
		this.router.post('/upload', [this.authMiddleware.use, this.filesMiddleware.use(this.multerLibs.file, 'file')], this.filesController.fileUpload())

		return this.router
	}
}
