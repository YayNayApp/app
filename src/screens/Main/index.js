import { useState } from 'react'
import { useStore } from 'react-hookstore'
import { nav } from 'tiny-react-router'
import { GrAddCircle } from 'react-icons/gr'
import { 
  TEZOS_NETWORKS,
  TEZOS_NETWORK_DEFAULT
} from '../../shared/config'
import Header from '../../shared/components/header'
import Footer from '../../shared/components/footer'
import ContractListItem from './contractListItem'
import './index.css'

export default function Main() {
  const [network] = useStore('network')
  const [wallet] = useStore('wallet')
  const [contracts] = useStore('contracts')
  const [filter, setFilter] = useState('')

  const contractListItems = contracts.local
    .filter(c => c.network === (network ? network.type : TEZOS_NETWORKS[TEZOS_NETWORK_DEFAULT].type))
    .filter(c => c.storage.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
    .map(c => <ContractListItem contract={c} wallet={wallet} key={c.address} />)
    .reverse()

  return (
    <div className="Main">
      <Header />
      <div className="container">
        <div className="controlpanel">
          <input type="text" placeholder="Search for YNs" value={filter} onChange={(e) => { setFilter(e.target.value)}}/>
          <div onClick={() => { nav('/add') }} className="addIcon">
            <GrAddCircle size="2em" />
          </div>
        </div>
        <div className="contracts">
          {contractListItems}
        </div>
      </div>
      <Footer />
    </div>
  )
}
