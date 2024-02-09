import { IUser } from '~/providers/provider.greatDay'
import { Container, Injectable } from '~/helpers/helper.di'

@Injectable()
export class UsersMetadata {
	user(): IUser {
		return Container.resolve<IUser>('User')
	}
}
