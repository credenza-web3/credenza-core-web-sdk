import sha3 from 'js-sha3'

export const toChecksumAddress = (address: string) => {
  const addr = address.toLowerCase().replace(/^0x/, '')
  const hash = sha3.keccak_256(addr)
  let checksum = '0x'

  for (let i = 0; i < addr.length; i++) {
    checksum += parseInt(hash[i], 16) >= 8 ? addr[i].toUpperCase() : addr[i]
  }
  return checksum
}
