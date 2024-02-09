import * as jose from 'jose'
import crypto from 'crypto'
import { JwtPayload } from 'jsonwebtoken'

import { ISecretMetadata, ISignatureMetadata } from '~/libs/lib.jwt'
import { Redis } from '~/libs/lib.redis'
import { apiResponse } from '~/helpers/helper.apiResponse'

export class Jose {
	private redis: InstanceType<typeof Redis>

	constructor() {
		this.redis = new Redis()
	}

	static async JweEncrypt(privateKey: jose.KeyLike | crypto.KeyObject, data: string): Promise<jose.FlattenedJWE> {
		try {
			const text: Uint8Array = new TextEncoder().encode(data)
			const jwe: jose.FlattenedEncrypt = new jose.FlattenedEncrypt(text).setProtectedHeader({
				alg: 'RSA-OAEP',
				enc: 'A256CBC-HS512',
				typ: 'JWT',
				cty: 'JWT'
			})

			return await jwe.encrypt(privateKey)
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	static async JweDecerypt(privateKey: jose.KeyLike | crypto.KeyObject, jweEncryption: jose.FlattenedJWE): Promise<string> {
		try {
			const jwe: jose.FlattenedDecryptResult = await jose.flattenedDecrypt(jweEncryption, privateKey)
			const text: string = new TextDecoder().decode(jwe.plaintext)

			return text
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	static async importJsonWebKey(jwkExport: jose.JWK): Promise<jose.KeyLike | Uint8Array> {
		try {
			const jwk: jose.KeyLike | Uint8Array = await jose.importJWK(jwkExport)
			return jwk
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	static async exportJsonWebKey(privateKey: jose.KeyLike | crypto.KeyObject): Promise<jose.JWK> {
		try {
			const jwk: jose.JWK = await jose.exportJWK(privateKey)
			return jwk
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	static async JwtSign(
		privateKey: jose.KeyLike | crypto.KeyObject,
		headerKeyId: string,
		data: Record<string, any>,
		options: JwtPayload
	): Promise<string> {
		try {
			const unixTime: number = Math.floor(Date.now() / 1000) + 60 * 60
			const jwt: string = await new jose.SignJWT(data)
				.setProtectedHeader({ alg: 'RS256', typ: 'JWT', cty: 'JWT', kid: headerKeyId, b64: true })
				.setAudience(options.aud)
				.setIssuer(options.iss)
				.setIssuedAt(unixTime)
				.setExpirationTime(unixTime + options.exp)
				.setJti(options.jti)
				.sign(privateKey)

			return jwt
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}

	async JwtVerify(prefix: string, token: string): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
		try {
			const secretkey: ISecretMetadata = await this.redis.hget(`${prefix}:credentials`, 'certMetadata')
			const signature: ISignatureMetadata = await this.redis.hget(`${prefix}:credentials`, 'sigMetadata')

			if (!secretkey && !signature) {
				throw new Error('Invalid signature')
			}

			const rsaPrivKey: crypto.KeyObject = crypto.createPrivateKey({ key: signature.privKey, passphrase: signature.cipherKey })
			if (!rsaPrivKey) {
				throw new Error('Invalid signature')
			}

			const jwsVerify: jose.CompactVerifyResult = await jose.compactVerify(token, rsaPrivKey)
			await Jose.JweDecerypt(rsaPrivKey, signature.jweKey)

			if (Buffer.compare(Buffer.from(jwsVerify.protectedHeader.kid), Buffer.from(signature.jweKey.ciphertext)) != 0) {
				throw new Error('Invalid signature')
			}

			const jwkImport: jose.KeyLike | Uint8Array = await Jose.importJsonWebKey(signature.jwkKey)

			return await jose.jwtVerify(token, jwkImport, {
				audience: signature.sigKey.substring(10, 20),
				issuer: signature.sigKey.substring(20, 30),
				algorithms: [jwsVerify.protectedHeader.alg],
				typ: jwsVerify.protectedHeader.typ
			})
		} catch (e: any) {
			throw apiResponse({ err_message: e })
		}
	}
}
