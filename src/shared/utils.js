import { isValidISODateString } from 'iso-datestring-validator'

export function getDefaultTezosNetwork() {
  switch(window.location.host) {
    case 'yaynay.app':
      return 'mainnet'
    case 'florence.yaynay.app':
      return 'florencenet'
    case 'edo.yaynay.app':
      return 'edonet'
    default:
      return 'edonet'
  }
}

export function getAvailableTezosNetworks(networks) {
  const network = getDefaultTezosNetwork()
  if (window.location.host === 'localhost:3000') return networks
  switch(network) {
    case 'mainnet':
      return {
        mainnet: networks['mainnet']
      }
    case 'florencenet':
      return {
        florencenet: networks['florencenet']
      }
    case 'edonet':
      return {
        edonet: networks['edonet']
      }
    default:
      return {
        edonet: networks['edonet']
      }
  }
}

export function getStatusString(storage) {
  const resolved = storage.resolved
  const start = new Date(storage.start)
  const end = new Date(storage.end)
  const hasStarted = new Date() > start
  const hasEnded = new Date() > end
  let status = 'Open'
  if (resolved) status = 'Resolved'
  if (!resolved && !hasStarted) status = 'Pending'
  if (!resolved && hasEnded) status = 'Ended'
  return status
}

export function getVoteValueString(value) {
  switch(value) {
    case "-1":
      return 'Not yet voted'
    case "1":
      return 'Yay'
    case "0":
      return 'Nay'
    default:
      return 'Unknown'
  }
}

export function validateDate(value) {
  let valid = false
  try {
    valid = isValidISODateString(value)
  } catch(e) {
    throw new Error('Invalid date')
  }
  if (!valid) throw new Error('Invalid date')
  return true
}

export async function getAccount(network, addr) {
  let res = await fetch(`${network.tzstats_api}/explorer/account/${addr}`)
  let account = await res.json()
  return account
}

export function truncateAddress(addr) {
  return `${addr.substring(0,7)}..${addr.substring(addr.length-5,addr.length-1)}`
}

export function getCost(storage) {
  if (!storage) return 0
  return Math.round(((storage.cost.toJSON()/1000000) + Number.EPSILON) * 100) / 100
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class TempleError extends Error {}
