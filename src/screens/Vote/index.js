import { useState } from 'react'
import { useStore } from 'react-hookstore'
import { nav } from 'tiny-react-router'
import { format } from 'date-fns'
import { 
  AiOutlineReload,
  AiOutlineDelete,
  AiOutlineTwitter,
  AiOutlineFacebook
} from 'react-icons/ai'
import { BiLinkExternal } from 'react-icons/bi'
import { TezIDProof } from '@tezid/proofs-component'
import Header from '../../shared/components/header'
import Footer from '../../shared/components/footer'
import {
  getTezIDProofs
} from '../../shared/api'
import { 
  sleep,
  truncateAddress,
  getStatusString,
  getVoteValueString 
} from '../../shared/utils'
import { 
  callContract,
  fetchContractStorage 
} from '../../shared/wallet'
import Progress from './progress'
import ImportContract from './import'
import '@tezid/proofs-component/dist/index.css'
import './index.css'

export default function Vote(props) {
  const [state, setState] = useState({})
  const [wallet] = useStore('wallet')
  const [network] = useStore('network')
  // eslint-disable-next-line
  const [infoMessage, setInfoMessage] = useStore('infomessage')
  const [contracts, dispatchContracts] = useStore('contracts')
  // eslint-disable-next-line
  let contract = contracts.local.filter(c => c.address == props.contract)
  if (contract.length === 0) return <ImportContract {...props} network={network} dispatchContracts={dispatchContracts} />
  contract = contract[0]

  if (!network) return null

  const handleRemoveLocal = () => {
    const confirmed = window.confirm('Sure?')
    if (!confirmed) return
    nav('/')
    dispatchContracts({ type: 'removeLocal', payload: contract }) 
    
  }

  const handleFetchContractStorage = async (sleepTime=0) => {
    setState({...state, ...{ reload: true }})
    await sleep(sleepTime*1000)
    const storage = await fetchContractStorage(contract.address, network)
    const updatedContract = {...contract, storage }
    dispatchContracts({ type: 'updateLocal', payload: updatedContract }) 
    setState({...state, ...{ reload: false }})
  }

  const handleRegister = async () => {
    const requiredProofs = contract.storage.requiredProofs
    const proofs = await getTezIDProofs(network.type, wallet.address)
    const proofIds = proofs.map(p => p.id)
    const hasAllProofs = requiredProofs.reduce((res, requiredProofId) => {
      if (proofIds.indexOf(requiredProofId) < 0) return false
      return res 
    }, true)
    if (!hasAllProofs) return setInfoMessage({
      type: 'info',
      message: (<div>You do not have the required <a href="https://tezid.net" target="_blank" rel="noreferrer">TezID</a> proofs to register for this YayNay.</div>)
    })
    try {
      await callContract(contract.address, 'signup', { "prim": "Unit" })
      await handleFetchContractStorage(30)
    } catch(e) {
      console.error(e)
      //console.error(e.data[1].with)
    }
  }

  const handleVote = async () => {
    let voteValue = window.prompt(`${contract.storage.question}\n\nyay or nay`)
    if (voteValue === null) return
    if (['yay','nay'].indexOf(voteValue) < 0) return
    voteValue = voteValue === 'yay' ? '1' : '0'
    try {
      await callContract(contract.address, 'vote', { int: voteValue }, contract.storage.cost * 1000000)
      await handleFetchContractStorage(30)
    } catch(e) {
      console.error(e)
    }
  }

  const handleResolve = async () => {
    try {
      await callContract(contract.address, 'resolve', { "prim": "Unit" })
      await handleFetchContractStorage(30)
    } catch(e) {
      console.error(e)
    }
  }

  const handleShare = (to) => {
    if (to === 'twitter') {
      const text = window.encodeURIComponent(`${storage.name} - ${storage.question}\n\n${window.location}\n\n#yaynay`)
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    }
  }

  const storage = contract.storage
  const resolved = storage.resolved
  const start = new Date(storage.start)
  const end = new Date(storage.end)
  const hasStarted = new Date() > start
  const hasEnded = new Date() > end
  const participants = storage.participants
  const registered = wallet ? Object.keys(participants).indexOf(wallet.address) >= 0 : false
  const yays = Object.values(participants).reduce((sum,i) => {
    if (i === '1') return sum+1
    return sum
  },0)
  const nays = Object.values(participants).reduce((sum,i) => {
    if (i === '0') return sum+1
    return sum
  },0)
  const status = getStatusString(storage) 
  const requiredProofs = storage.requiredProofs.map(p => {
    let _p = {}
    _p.id = p
    _p.label = p[0].toUpperCase() + p.slice(1)
    return <TezIDProof key={_p.id} proof={_p} />
  })

  return (
    <div className="Vote">
      <Header />
      <div className="container">
        <h3>{storage.name}</h3>
        <div className="wrapper">
          <div className="top">
            <div className="info">
              {storage.question}
            </div>
            <div className="actions">
              <div className={state.reload ? 'spin' : ''} onClick={handleFetchContractStorage}>
                <AiOutlineReload />
              </div>
              <div>
                <a target="_blank" rel="noreferrer" href={`${network.tzstats}/${contract.address}`}>
                  <BiLinkExternal />
                </a>
              </div>
              <div onClick={handleRemoveLocal}>
                <AiOutlineDelete />
              </div>
            </div>
          </div>
          <div className="stats">
              <div className="status">
                <span className="label">Status:</span><span className="value">{status}</span>
              </div>
            { registered && wallet &&
              <div className="currentVote">
                <span className="label">You voted:</span><span className="value">{getVoteValueString(participants[wallet.address])}</span>
              </div>
            }
              <div className="registered">
                  <span className="label"># Participants:</span><span className="value">{Object.keys(participants).length}</span>
              </div>
              <div className="voted">
                  <span className="label"># Votes total</span><span className="value">{yays+nays}</span>
              </div>
              <div className="progressContainer">
                <Progress yays={yays} nays={nays} /> 
              </div>
          </div>
          <div className="meta">
            <div className="admin">
                <span className="label">Administrator:</span>
                <span className="value">
                  <a target="_blank" rel="noreferrer" href={`${network.tzstats}/${storage.admin}`}>{truncateAddress(storage.admin)}</a>
                </span>
            </div>
            <div className="cost">
                <span className="label">Cost:</span><span className="value">{storage.cost}</span>
            </div>
            <div className="start">
                <span className="label">Start:</span><span className="value">{format(start, 'yyyy-MM-dd')}</span>
            </div>
            <div className="start">
                <span className="label">End:</span><span className="value">{format(end, 'yyyy-MM-dd')}</span>
            </div>
            <div className="majority">
                <span className="label">Required majority:</span><span className="value">{`${storage.requiredMajority}%`}</span>
            </div>
            <div className="registered">
                <span className="label">Max Participants:</span><span className="value">{storage.maxParticipants}</span>
            </div>
            <div className="tezidProofs">
                <span className="label">Required TezID Proofs:</span><div className="value">{requiredProofs}</div>
            </div>
          </div>
          <div className="buttons">
            <button className="neutral" onClick={handleRegister} disabled={!wallet || !hasStarted || hasEnded || resolved || registered}>Register</button>
            <button className="positive" onClick={handleVote} disabled={!wallet || !hasStarted || hasEnded || resolved || !registered}>Vote</button>
            <button className="neutral" onClick={handleResolve} disabled={!wallet || resolved || !hasEnded}>Resolve</button>
            <div className="separator" />
            { false &&
            <div className="shareButton facebook" onClick={() => handleShare('facebook')}>
              <AiOutlineFacebook />
            </div>
            }
            <div className="shareButton twitter" onClick={() => handleShare('twitter')}>
              <AiOutlineTwitter />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
