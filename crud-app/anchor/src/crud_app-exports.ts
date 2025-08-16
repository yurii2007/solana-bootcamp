// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CrudAppIDL from '../target/idl/crud_app.json'
import type { CrudApp } from '../target/types/crud_app'

// Re-export the generated IDL and type
export { CrudApp, CrudAppIDL }

// The programId is imported from the program IDL.
export const CRUD_APP_ID = new PublicKey(CrudAppIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getCrudAppProgram(provider: AnchorProvider, address?: PublicKey): Program<CrudApp> {
  return new Program({ ...CrudAppIDL, address: address ? address.toBase58() : CrudAppIDL.address } as CrudApp, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getCrudAppProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return CRUD_APP_ID
  }
}
