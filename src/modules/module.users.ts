import { DependencyContainer } from 'tsyringe'

import { Module, Injectable, Inject } from '~/helpers/helper.di'
import { UsersService } from '~/services/service.users'
import { UsersController } from '~/controllers/controller.users'
import { UsersRoute } from '~/routes/route.users'
import { GreatDayProvider } from '~/providers/provider.greatDay'
import { AuthorizationMiddleware } from '~/middlewares/middleware.auth'
import { FilesMiddleware } from '~/middlewares/middleware.upload'
import { ValidatorMiddleware } from '~/middlewares/middleware.validator'
import { Redis } from '~/libs/lib.redis'
import { Axios } from '~/libs/lib.axios'
import { JsonWebToken } from '~/libs/lib.jwt'
import { Multer } from '~/libs/lib.multer'
import { FormData } from '~/libs/lib.formdata'
import { UsersMetadata } from '~/helpers/helper.usersMetadata'
import { RequestMetadata } from '~/helpers/helper.requestMetadata'

@Module([
	{ token: 'UsersService', useClass: UsersService },
	{ token: 'UsersController', useClass: UsersController },
	{ token: 'UsersRoute', useClass: UsersRoute },
	{ token: 'GreatDayProvider', useClass: GreatDayProvider },
	{ token: 'AuthMiddleware', useClass: AuthorizationMiddleware },
	{ token: 'FilesMiddleware', useClass: FilesMiddleware },
	{ token: 'ValidatorMiddleware', useClass: ValidatorMiddleware },
	{ token: 'Redis', useClass: Redis },
	{ token: 'Axios', useClass: Axios },
	{ token: 'Jwt', useClass: JsonWebToken },
	{ token: 'Multer', useClass: Multer },
	{ token: 'FormData', useClass: FormData },
	{
		token: 'UsersMetadata',
		useFactory: (dc: DependencyContainer) => {
			return dc.resolve(UsersMetadata)
		}
	},
	{
		token: 'RequestMetadata',
		useFactory: (dc: DependencyContainer) => {
			return dc.resolve(RequestMetadata)
		}
	}
])
@Injectable()
export class UsersModule {
	constructor(@Inject('UsersRoute') public readonly usersRoute: UsersRoute) {}
}
