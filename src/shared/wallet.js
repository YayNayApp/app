import { DAppClient, TezosOperationType } from '@airgap/beacon-sdk'
import { sleep } from './utils'

const dAppClient = new DAppClient({ name: 'YayNay' })

export async function connectWallet(network) {
  const account = await dAppClient.requestPermissions({
    network: {
      type: network.type,
      rpcUrl: network.rpc
    }
  })
  return account 
}

export async function disconnectWallet() {
  await dAppClient.clearActiveAccount() 
}

export async function getActiveAccount() {
  const activeAccount = await dAppClient.getActiveAccount()
  if (!activeAccount) return null
  return activeAccount
}

export async function originateContract(network, contract, storage) {
  const origination_res = await dAppClient.requestOperation({
    operationDetails: [
      {
        kind: TezosOperationType.ORIGINATION,
        balance: 0,
        script: contract,
        storage: storage 
      },
    ],
  })
  let contractHash,contractStorage = null
  for (let i=0; i < 100; i++) {
    const opr_res = await fetch(`${network.tzstats_api}/explorer/op/${origination_res.transactionHash}`)
    if (opr_res.status === 200) {
      const opr_json = await opr_res.json()
      contractHash = opr_json[0].receiver
      contractStorage = await fetchContractStorage(contractHash, network)
      break; 
    }
    await sleep(10000)
  }
  return {
    transaction: origination_res.transactionHash,
    address: contractHash,
    storage: contractStorage 
  }
}

export async function fetchContractStorage(contract, network) {
  const res = await fetch(`${network.tzstats_api}/explorer/contract/${contract}/storage`)
  if (res.status !== 200) {
    let err = await res.json()
    let first = err.errors[0]
    if (res.status === 400) throw new Error(`${first.message}. ${first.detail}.`)
    if (res.status === 404) throw new Error('404 Not found')
    throw new Error('Unable to fetch contract data')
  }
  const storage = await res.json()
  return storage.value
}

export async function fetchContractCode(contract, network) {
  const res = await fetch(`${network.tzstats_api}/explorer/contract/${contract}/script?prim=1`)
  if (res.status !== 200) {
    let err = await res.json()
    let first = err.errors[0]
    if (res.status === 400) throw new Error(`${first.message}. ${first.detail}.`)
    if (res.status === 404) throw new Error('404 Not found')
    throw new Error('Unable to fetch contract data')
  }
  const script = await res.json()
  return script.script.code
}

export async function callContract(contract, entryPoint, payload, amount=0) {
  const result = await dAppClient.requestOperation({
    operationDetails: [
      {
        kind: TezosOperationType.TRANSACTION,
        amount: amount,
        destination: contract, 
        parameters: {
          entrypoint: entryPoint,
          value: payload,
        },
      },
    ],
  })
  console.log(result)
  return result
}
