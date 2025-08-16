'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudAppProgram, useCrudAppProgramAccount } from './journal-entry-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { Input } from '../ui/input'

export function JournalCentryCreate() {
  const [title, setTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const { publicKey } = useWallet()
  const { createEntry } = useCrudAppProgram()

  const isFormValid = title.trim() && message.trim()

  const onSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ message, owner: publicKey, title })
    }
  }

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <Input type="text" maxLength={50} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input type="text" maxLength={150} value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button disabled={createEntry.isPending || !isFormValid} onClick={onSubmit} type="button">
        Create
      </Button>
      <p className="text-red-600 font-sans">{createEntry.error?.message}</p>
    </div>
  )
}

export function JournalEntryList() {
  const { accounts, getProgramAccount } = useCrudAppProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <JournalEntryCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function JournalEntryCard({ account }: { account: PublicKey }) {
  const { deleteEntry, updateEntry, accountQuery } = useCrudAppProgramAccount({ account })

  const { publicKey } = useWallet()
  const [message, setMessage] = useState<string>('')
  const title = accountQuery.data?.title

  const isFormValid = message.trim()

  const onSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ message, owner: publicKey, title })
      accountQuery.refetch()
    }
  }

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return accountQuery.isLoading ? (
    <span className="loading">loading</span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around gap-2">
            <Input placeholder="Update message here" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button onClick={onSubmit} disabled={updateEntry.isPending || !isFormValid}>
              Update Journal Entry {updateEntry.isPending && '...'}
            </Button>
          </div>
          <div className="text-center space-y-4">
            <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            <Button
              onClick={() => {
                if (!window.confirm('Are you sure you want to close this account?')) {
                  return
                }
                const title = accountQuery.data?.title
                if (title) {
                  return deleteEntry.mutateAsync(title)
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
