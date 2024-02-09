import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator'

export class UsersLoginDTO {
	@IsNotEmpty()
	@IsString()
	company!: any

	@IsNotEmpty()
	@IsString()
	uid!: any

	@IsNotEmpty()
	@IsString()
	password: string
}

export class UsersSetLocationDTO {
	@IsLatitude()
	latitude: number

	@IsLongitude()
	longitude: number
}
