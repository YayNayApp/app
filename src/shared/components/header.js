import { useState } from 'react'
import { useStore } from 'react-hookstore'
import { nav } from 'tiny-react-router'
import { GrNetwork } from 'react-icons/gr'
import { RiTestTubeLine } from 'react-icons/ri'
import { TezosWallet, TezosWalletMenuDisconnect } from 'tezos-wallet-component'
import { getAccount } from '../utils'
import { connectWallet, disconnectWallet } from '../wallet'
import { TezosWalletMenuTezID } from '@tezid/tezos-wallet-component-menu-tezid' 
import '@tezid/tezos-wallet-component-menu-tezid/dist/index.css'
import 'tezos-wallet-component/dist/index.css'
import './header.css'

export default function Header(props) {
  const [network] = useStore('network')
  const [wallet, setWallet] = useStore('wallet') 
  const [account, setAccount] = useStore('account') 
  const [showMenu, setShowMenu] = useState(false)
  const [loading] = useStore('loading') 

  const handleConnectWallet = async (selectedNetwork) => {
    // TODO: Handle setNetwork -> selectedNetwork
    const _wallet = await connectWallet(network)
    setWallet(_wallet)
    const _account = await getAccount(network, _wallet.address)
    setAccount(_account)
  }

  const handleDisconnectWallet = async () => {
    await disconnectWallet() 
    setWallet(null)
    setAccount(null)
    setShowMenu(false)
  }

  if (!network) return null

  const handleOpenNetwork = () => {
    window.open(`${network.tzstats}/${wallet ? wallet.address : ''}`, '_blank')
  }

  return (
    <div className="Header">
      <div className="logo" onClick={() => { nav('/') }}>
        <img className={`${loading ? 'roll' : ''}`} src="/logo-only.svg" alt="logo" />
      </div>
      <div className="links">
        <h1>YayNay</h1>
        <h2>Collective decision-making</h2>
      </div>
      <div className="wallet">
        <TezosWallet 
          address={wallet?.address} 
          balance={account?.total_balance}
          showMenu={showMenu}
          onToggleMenu={() => setShowMenu(!showMenu)}
          onConnectWallet={handleConnectWallet}
        >
          <div onClick={handleOpenNetwork}>
            <div className="label">{network.label}</div>
            <div className="icon">
              { network.testnet &&
                <RiTestTubeLine />
              }
              <GrNetwork />
            </div>
          </div>
          <TezosWalletMenuTezID address={wallet?.address} network={network?.type} />
          <TezosWalletMenuDisconnect onClick={handleDisconnectWallet} />
        </TezosWallet>
      </div>
    </div>
  )
}
