const PASSWORD_RESET_CODE_LENGTH = 8
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateResetCode(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(PASSWORD_RESET_CODE_LENGTH))
    let code = ""
    for (const b of bytes) {
        code += CODE_ALPHABET[b % CODE_ALPHABET.length]
    }
    return code
}

