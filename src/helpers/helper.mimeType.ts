import path from 'path'

export class MimeType {
	static whiteListBytes(content: Buffer, filename: string): boolean {
		switch (path.extname(filename).replace('.', '')) {
			case 'jpg':
			case 'jpeg':
				const validJpgBytes: string[] = ['255', '216', '255', '224', '0', '16', '74', '70', '73', '70', '0', '1']
				const listJpgBytes: string[] = content.slice(0, 12).join(',').split(',')
				const listMatchJpgBytes: boolean[] = listJpgBytes.map((v, i) => (v == validJpgBytes[i] ? true : false))
				const listNotMatchJpgBytes: number[] = listMatchJpgBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchJpgBytes.includes(false) || listNotMatchJpgBytes.length <= 6 ? true : false

			case 'png':
				const validPngBytes: string[] = ['137', '80', '78', '71', '13', '10', '26', '10']
				const listPngBytes: string[] = content.slice(0, 8).join(',').split(',')
				const listMatchPngBytes: boolean[] = listPngBytes.map((v, i) => (v == validPngBytes[i] ? true : false))
				const listNotMatchPngBytes: number[] = listMatchPngBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchPngBytes.includes(false) || listNotMatchPngBytes.length <= 4 ? true : false

			case 'gif':
				const validGifBytes: string[] = ['71', '73', '70', '56', '55', '97']
				const listGifBytes: string[] = content.slice(0, 6).join(',').split(',')
				const listMatchGifBytes: boolean[] = listGifBytes.map((v, i) => (v == validGifBytes[i] ? true : false))
				const listNotMatchGifBytes: number[] = listMatchGifBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchGifBytes.includes(false) || listNotMatchGifBytes.length <= 3 ? true : false

			case 'pdf':
				const validPdfBytes: string[] = ['37', '80', '68', '70', '45']
				const listPdfBytes: string[] = content.slice(0, 5).join(',').split(',')
				const listMatchPdfBytes: boolean[] = listPdfBytes.map((v, i) => (v == validPdfBytes[i] ? true : false))
				const listNotMatchPdfBytes: number[] = listMatchPdfBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchPdfBytes.includes(false) || listNotMatchPdfBytes.length <= 2 ? true : false

			case 'doc':
			case 'xls':
				const validDocOrXlsBytes: string[] = ['208', '207', '17', '224', '161', '177', '26', '225']
				const listDocOrXlsBytes: string[] = content.slice(0, 5).join(',').split(',')
				const listMatchDocOrXlsBytes: boolean[] = listDocOrXlsBytes.map((v, i) => (v == validDocOrXlsBytes[i] ? true : false))
				const listNotMatchDocOrXlsBytes: number[] = listMatchDocOrXlsBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchDocOrXlsBytes.includes(false) || listNotMatchDocOrXlsBytes.length <= 4 ? true : false

			case 'docx':
			case 'xlsx':
				const validDocxOrXlsxBytes: string[] = ['80', '75', '3', '4']
				const listDocxOrXlsxBytes: string[] = content.slice(0, 5).join(',').split(',')
				const listMatchDocxOrXlsxBytes: boolean[] = listDocxOrXlsxBytes.map((v, i) => (v == validDocxOrXlsxBytes[i] ? true : false))
				const listNotMatchDocxOrXlsxBytes: number[] = listMatchDocxOrXlsxBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchDocxOrXlsxBytes.includes(false) || listNotMatchDocxOrXlsxBytes.length <= 2 ? true : false

			case 'webp':
				const validWebpBytes: string[] = ['82', '73', '70', '70', '98', '119', '0', '0', '87', '69', '66', '80']
				const listWebpBytes: string[] = content.slice(0, 5).join(',').split(',')
				const listMatchWebpBytes: boolean[] = listWebpBytes.map((v, i) => (v == validWebpBytes[i] ? true : false))
				const listNotMatchWebpBytes: number[] = listMatchWebpBytes
					.map((v: boolean) => {
						let n: number = 0
						if (v == false) return n + 1
						return n
					})
					.filter((v: number) => v == 1)

				return listMatchWebpBytes.includes(false) || listNotMatchWebpBytes.length <= 6 ? true : false

			case 'csv':
				return true

			default:
				return false
		}
	}
}
