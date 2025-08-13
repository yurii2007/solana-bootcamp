import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'
import { Votingdapp } from '@/../anchor/target/types/votingdapp'

const IDL = require('@/../anchor/target/idl/votingdapp.json')

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    title: 'Vote for your favorite group',
    description: 'Vote between rhcp and soad',
    icon: 'https://ca-times.brightspotcdn.com/dims4/default/cb16b10/2147483647/strip/true/crop/4935x3290+0+0/resize/2400x1600!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F5b%2F33%2Ff367fb35474d864941e977e5f48e%2F927846-ca-0321-red-hot-chili-peppers-sunday-calendar-cover-mrt-02.jpg',
    label: 'Vote',
    links: {
      actions: [
        {
          href: '/api/vote?candidate=Foo',
          label: 'Vote for Foo',
          type: 'transaction',
        },
        {
          href: '/api/vote?candidate=Bar',
          label: 'Vote for Bar',
          type: 'transaction',
        },
      ],
    },
  }

  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate !== 'Foo' && candidate !== 'Bar') {
    return new Response('Invalid candidate name', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const body: ActionPostRequest = await request.json()

  let voter

  try {
    voter = new PublicKey(body.account)
  } catch {
    return Response.json('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Votingdapp> = new Program(IDL, { connection })

  const instruction = await program.methods.vote(candidate, new BN(0)).accounts({ signer: voter }).instruction()

  const blockHash = await connection.getLatestBlockhash('finalized')

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
  }).add(instruction)

  const response: ActionPostResponse = await createPostResponse({
    fields: { transaction, message: `Voting for ${candidate}` },
  })

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
