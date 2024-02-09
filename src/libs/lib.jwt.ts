import crypto from 'crypto'
import * as jose from 'jose'
import moment from 'moment'

import { Redis } from '~/libs/lib.redis'
import { Encryption } from '~/helpers/helper.encryption'
import { Jose } from '~/libs/lib.jose'
import { ConfigsEnvironment } from '~/configs/config.env'
import { Injectable } from '~/helpers/helper.di'
import { apiResponse } from '~/helpers/helper.apiResponse'

export interface ISecretMetadata {
	pubKey: string
	privKey: string
	cipherKey: string
}

export interface ISignatureMetadata {
	privKey: string
	sigKey: string
	cipherKey: string
	jwkKey: jose.JWK
	jweKey: jose.FlattenedJWE
}

@Injectable()
export class JsonWebToken {
	private keyLength: number = 2048
	private keyLengthSizes: number[] = [2048, 4096]
	private jwtSecretKey: string = ConfigsEnvironment.JWT_SECRET_KEY
	private jwtExpired: number = ConfigsEnvironment.JWT_EXPIRED
	private redis: InstanceType<typeof Redis> = new Redis()
	private certMetadata: ISecretMetadata = {
		pubKey: '',
		privKey: '',
		cipherKey: ''
	}
	private sigMetadata: ISignatureMetadata = {
		privKey: '',
		sigKey: '',
		cipherKey: '',
		jwkKey: {},
		jweKey: {} as any
	}

	private async createSecret(prefix: string): Promise<ISecretMetadata> {
		try {
			const secretKeyExist: number = await this.redis.hexists(`${prefix}-credentials`, 'certMetadata')
			if (!secretKeyExist) {
				for (let i = 0; i < this.keyLengthSizes.length; i++) {
					this.keyLength = this.keyLengthSizes[Math.floor(Math.random() * this.keyLengthSizes.length)]
					break
				}

				const cipherKey: string = await Encryption.AES256Encrypt(this.jwtSecretKey, this.jwtSecretKey).toString('hex')
				const genCert: crypto.KeyPairSyncResult<string, string> = crypto.generateKeyPairSync('rsa', {
					modulusLength: this.keyLength,
					publicKeyEncoding: {
						type: 'pkcs1',
						format: 'pem'
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
						cipher: 'aes-256-cbc',
						passphrase: cipherKey
					}
				})

				this.certMetadata = {
					pubKey: genCert.publicKey,
					privKey: genCert.privateKey,
					cipherKey: cipherKey
				}

				await this.redis.hsetEx(`${prefix}:credentials`, 'certMetadata', this.jwtExpired, this.certMetadata)
			} else {
				this.certMetadata = await this.redis.hget(`${prefix}:credentials`, 'certMetadata')
			}

			return this.certMetadata
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	private async createSignature(prefix: string, body: any): Promise<ISignatureMetadata> {
		try {
			const sigKeyExist: number = await this.redis.hexists(`${prefix}:credentials`, 'sigMetadata')

			if (!sigKeyExist) {
				const secretKey: ISecretMetadata = await this.createSecret(prefix)

				const rsaPrivKey: crypto.KeyObject = crypto.createPrivateKey({
					key: Buffer.from(secretKey.privKey),
					type: 'pkcs8',
					format: 'pem',
					passphrase: secretKey.cipherKey
				})

				const bodyPayload: string = JSON.stringify(body)
				const signature: Buffer = crypto.sign('RSA-SHA256', Buffer.from(bodyPayload), rsaPrivKey)

				if (!signature) throw new Error('Invalid signature')
				const signatureOutput: string = signature.toString('hex')

				const verifiedSignature = crypto.verify('RSA-SHA256', Buffer.from(bodyPayload), secretKey.pubKey, signature)
				if (!verifiedSignature) throw new Error('Invalid signature')

				const formatPrivatekeyToJws: jose.JWK = await Jose.exportJsonWebKey(rsaPrivKey)
				if (!formatPrivatekeyToJws) throw new Error('Invalid signature')

				const jweKey: jose.FlattenedJWE = await Jose.JweEncrypt(rsaPrivKey, signatureOutput)
				if (!jweKey) throw new Error('Invalid signature')

				this.sigMetadata = {
					privKey: secretKey.privKey,
					sigKey: signatureOutput,
					cipherKey: secretKey.cipherKey,
					jwkKey: formatPrivatekeyToJws,
					jweKey: jweKey
				}

				await this.redis.hsetEx(`${prefix}:credentials`, 'sigMetadata', this.jwtExpired, this.sigMetadata)
			} else {
				this.sigMetadata = await this.redis.hget(`${prefix}:credentials`, 'sigMetadata')
			}

			return this.sigMetadata
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async sign(prefix: string, body: any): Promise<string> {
		try {
			const signature: ISignatureMetadata = await this.createSignature(prefix, body)

			const now: Date = new Date()
			const year: number = now.getFullYear()
			const month: string = ('0' + (now.getMonth() + 1)).slice(-2)
			const day: string = ('0' + now.getDate()).slice(-2)
			const hour: string = ('0' + now.getHours()).slice(-2)
			const minute: string = ('0' + now.getMinutes()).slice(-2)
			const second: string = ('0' + now.getSeconds()).slice(-2)
			const milliseconds: number = now.getMilliseconds()

			const expiredAt: string = moment().utcOffset(0, true).second(this.jwtExpired).format()
			const payload: string = `${year}${month}${day}${hour}${minute}${second}${milliseconds}` + '.' + signature.sigKey.toLowerCase() + '.' + expiredAt

			const symmetricEncrypt: string = Encryption.HMACSHA512Sign(signature.cipherKey, 'hex', payload)
			const rsaPrivKey: crypto.KeyObject = crypto.createPrivateKey({
				key: Buffer.from(signature.privKey),
				type: 'pkcs8',
				format: 'pem',
				passphrase: signature.cipherKey
			})

			const tokenKey: string = `${prefix}:${symmetricEncrypt}:token`
			const tokenExist: number = await this.redis.exists(tokenKey)

			if (tokenExist <= 0) {
				const tokenData: string = await Jose.JwtSign(
					rsaPrivKey,
					signature.jweKey.ciphertext,
					{ key: symmetricEncrypt },
					{
						jti: prefix,
						aud: signature.sigKey.substring(10, 20),
						iss: signature.sigKey.substring(20, 30),
						exp: this.jwtExpired
					}
				)

				this.redis.setEx(tokenKey, ConfigsEnvironment.JWT_EXPIRED, tokenData)
				return tokenData
			} else {
				return this.redis.get(tokenKey)
			}
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async verify(prefix: string, token: string): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
		try {
			return new Jose().JwtVerify(prefix, token)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}
}
