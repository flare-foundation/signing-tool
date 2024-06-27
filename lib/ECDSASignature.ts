import Web3 from "web3";
export interface IECDSASignature {
  r: string;
  s: string;
  v: number;
}

const web3 = new Web3("https://dummy");
export namespace ECDSASignature {
  /**
   * Signs message hash with ECDSA using private key
   */
  export async function signMessageHash(messageHash: string, privateKey: string): Promise<IECDSASignature> {
    if (!/^0x[0-9a-f]{64}$/i.test(messageHash)) {
      throw Error(`Invalid message hash format: ${messageHash}`);
    }
    const signatureObject = web3.eth.accounts.sign(messageHash, privateKey);
    return {
      v: parseInt(signatureObject.v.slice(2), 16),
      r: signatureObject.r,
      s: signatureObject.s,
    } as IECDSASignature;
  }
}
