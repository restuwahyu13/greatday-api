import { Module, Injectable, Inject } from '~/helpers/helper.di'
import { FilesController } from '~/controllers/controller.files'
import { FilesRoute } from '~/routes/route.files'
import { FilesService } from '~/services/service.files'
import { AuthorizationMiddleware } from '~/middlewares/middleware.auth'
import { FilesMiddleware } from '~/middlewares/middleware.upload'
import { Axios } from '~/libs/lib.axios'
import { Multer } from '~/libs/lib.multer'
import { FormData } from '~/libs/lib.formdata'

@Module([
	{ token: 'FilesService', useClass: FilesService },
	{ token: 'FilesController', useClass: FilesController },
	{ token: 'FilesRoute', useClass: FilesRoute },
	{ token: 'AuthMiddleware', useClass: AuthorizationMiddleware },
	{ token: 'FilesMiddleware', useClass: FilesMiddleware },
	{ token: 'Axios', useClass: Axios },
	{ token: 'Multer', useClass: Multer },
	{ token: 'FormData', useClass: FormData }
])
@Injectable()
export class FilesModule {
	constructor(@Inject('FilesRoute') public readonly filesRoute: FilesRoute) {}
}
