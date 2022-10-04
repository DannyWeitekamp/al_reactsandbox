import CryptoJS, {WordArray} from "crypto-js"

let randArr = CryptoJS.lib.WordArray.random
let Base64url = CryptoJS.enc.Base64url
let randomID = () => Base64url.stringify(randArr(32));

export {randomID};
