// hash a password from the CLI, first arg should be un-hashed password
import {hashPassword} from "./password";

const plaintext = process.argv[2]
const hashed = await hashPassword(plaintext)
console.log(hashed)
