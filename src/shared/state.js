import { createStore } from 'react-hookstore'
import { 
  TEZOS_NETWORK_DEFAULT, 
  TEZOS_NETWORKS 
} from './config'
import { getActiveAccount } from './wallet'
import { getAccount } from './utils'

export const walletStore = createStore('wallet', null)
export const accountStore = createStore('account', null)
export const networkStore = createStore('network', null)
export const loadingStore = createStore('loading', false)
export const infoMessageStore = createStore('infomessage', null)
export const contractStore = createStore('contracts', { remote: [], local: JSON.parse(localStorage.getItem('contracts') || '[]')}, (state, action) => {
  let _state
  switch(action.type) {
    case 'addLocal':
      _state = {
        ...state,
        local: [...state.local, action.payload]
      }
      localStorage.setItem('contracts', JSON.stringify(_state.local))
      return _state
    case 'removeLocal':
      _state = {
        ...state,
        local: state.local.filter(c => {
          return (c.address !== action.payload.address)
        })
      }
      localStorage.setItem('contracts', JSON.stringify(_state.local))
      return _state
    case 'updateLocal':
      _state = {
        ...state,
        local: state.local.map(c => {
          if (c.address === action.payload.address) return action.payload
          return c
        })
      }
      localStorage.setItem('contracts', JSON.stringify(_state.local))
      return _state
    default:
      return state
  }
})

;

(async () => {
  const wallet = await getActiveAccount()
  walletStore.setState(wallet)
  if (wallet != null) {
    let network = Object.values(TEZOS_NETWORKS).filter(n => n.type === wallet.network.type)[0]
    if (!network) network = TEZOS_NETWORKS[TEZOS_NETWORK_DEFAULT]
    networkStore.setState(network)
    const account = await getAccount(network, wallet.address)
    accountStore.setState(account)
  }
})()

