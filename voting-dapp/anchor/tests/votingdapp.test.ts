import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { type Votingdapp } from '../target/types/votingdapp'

const IDL = require('../target/idl/votingdapp.json')

const votingAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

describe('votingdapp', () => {
  let context, provider, votingProgram

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'votingdapp', programId: votingAddress }], [])
    provider = new BankrunProvider(context)

    votingProgram = new Program<Votingdapp>(IDL, provider)
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods
      .initializePoll(new anchor.BN(0), new anchor.BN(0), new anchor.BN(1754846369), 'Initialize poll test')
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)

    expect(poll.pollId.toNumber()).toEqual(0)
    expect(poll.description).toEqual('Initialize poll test')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize candidate', async () => {
    await votingProgram.methods.initializeCandidate('Foo', new anchor.BN(0)).rpc()
    await votingProgram.methods.initializeCandidate('Bar', new anchor.BN(0)).rpc()

    const [fooAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(0).toArrayLike(Buffer, 'le', 8), Buffer.from('Foo')],
      votingAddress,
    )

    const fooCandidate = await votingProgram.account.candidate.fetch(fooAddress)

    expect(fooCandidate.candidateName).toEqual('Foo')
    expect(fooCandidate.votes.toNumber()).toEqual(0)

    const [barAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(0).toArrayLike(Buffer, 'le', 8), Buffer.from('Bar')],
      votingAddress,
    )

    const barCandidate = await votingProgram.account.candidate.fetch(barAddress)

    expect(barCandidate.candidateName).toEqual('Bar')
    expect(barCandidate.votes.toNumber()).toEqual(0)
  })

  it('Voting', async () => {
    await votingProgram.methods.vote('Foo', new anchor.BN(0)).rpc()

    const [fooAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(0).toArrayLike(Buffer, 'le', 8), Buffer.from('Foo')],
      votingAddress,
    )

    const fooCandidate = await votingProgram.account.candidate.fetch(fooAddress)

    expect(fooCandidate.votes.toNumber()).toEqual(1)
  })
})
