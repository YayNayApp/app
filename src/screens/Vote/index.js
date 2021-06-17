import { useEffect } from 'react'
import { useStore } from 'react-hookstore'
import { nav } from 'tiny-react-router'
import { format } from 'date-fns'
import { diff } from 'deep-diff'
import sortObj from 'sort-any'
import { validateContractAddress } from '@taquito/utils'
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
  TEZOS_NETWORKS,
  TEZOS_NETWORK_DEFAULT 
} from '../../shared/config'
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
  fetchContractCode, 
  fetchContractStorage 
} from '../../shared/wallet'
import Progress from './progress'
import '@tezid/proofs-component/dist/index.css'
import './index.css'

export default function Vote(props) {
  const [loading, setLoading] = useStore('loading')
  const [wallet] = useStore('wallet')
  const [network] = useStore('network')
  // eslint-disable-next-line
  const [infoMessage, setInfoMessage] = useStore('infomessage')
  const [contracts, dispatchContracts] = useStore('contracts')
  // eslint-disable-next-line
  let contract = contracts.local.filter(c => c.address == props.contract)[0]

  useEffect(() => {
    const importContract = async () => {
      const validContractAddress = validateContractAddress(props.contract) === 3
      // 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).

      if (!validContractAddress) return setInfoMessage({ message: 'Invalid contract address', type: 'error' })

      let storage, code;
      try {
        setLoading(true)
        await sleep(500)
        storage = await fetchContractStorage(props.contract, network)
        code = await fetchContractCode(props.contract, network)
        await sleep(500)
        setLoading(false)
      } catch(e) {
        console.error(e)
        setLoading(false)
        return setInfoMessage({ message: `Unable to import contract!`, type: 'error' })
      }
      if (!storage) return setInfoMessage({ message: 'Unable to fetch contract data', type: 'error' })
      if (!storage.ynid) return setInfoMessage({ message: 'Missing YayNay id, unable to import', type: 'error' })
      const localContract = await fetch(`/contracts/${storage.ynid}_code.json`).then(res => res.json())
      const a = sortObj(code)
      const b = sortObj(localContract.code)
      const _diff = diff(a, b)
      if (_diff) return setInfoMessage({ message: 'Unfamiliar contract. Unable to import', type: 'error' })
      dispatchContracts({ type: 'addLocal', payload: {
        address: props.contract,
        storage: storage,
        network: network.type
      }}) 
    }

    if (network && !contract) importContract()
  }, [network, contract, props.contract, contracts, dispatchContracts, setInfoMessage, setLoading])

  const getTzStatsUrl = () => {
    // TODO: Instead of using default network, use network type from localStorage...
    let _network = network
    if (!network) _network = TEZOS_NETWORKS[TEZOS_NETWORK_DEFAULT]
    return _network.tzstats
  }

  const handleRemoveLocal = () => {
    const confirmed = window.confirm('Sure?')
    if (!confirmed) return
    nav('/')
    setTimeout(() => {
      dispatchContracts({ type: 'removeLocal', payload: contract }) 
    },100)
  }

  const handleFetchContractStorage = async (sleepTime=0) => {
    setLoading(true)
    await sleep(sleepTime*1000)
    try {
      const storage = await fetchContractStorage(contract.address, network)
      const updatedContract = {...contract, storage }
      dispatchContracts({ type: 'updateLocal', payload: updatedContract }) 
    } catch(e) {
      setInfoMessage({
        type: 'error',
        message: e.message
      })
    }
    setLoading(false)
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

  let storage, resolved, start, end, hasStarted, hasEnded, participants, registered, yays, nays, status, requiredProofs
  if (contract) {
    storage = contract.storage
    resolved = storage.resolved
    start = new Date(storage.start)
    end = new Date(storage.end)
    hasStarted = new Date() > start
    hasEnded = new Date() > end
    participants = storage.participants
    registered = wallet ? Object.keys(participants).indexOf(wallet.address) >= 0 : false
    yays = Object.values(participants).reduce((sum,i) => {
      if (i === '1') return sum+1
      return sum
    },0)
    nays = Object.values(participants).reduce((sum,i) => {
      if (i === '0') return sum+1
      return sum
    },0)
    status = getStatusString(storage) 
    requiredProofs = storage.requiredProofs.map(p => {
      let _p = {}
      _p.id = p
      _p.label = p[0].toUpperCase() + p.slice(1)
      return <TezIDProof key={_p.id} proof={_p} />
    })
  }

  return (
    <div className="Vote">
      <Header />
      { !contract &&
      <div className="container">
        <h3>New YayNay!</h3>
        <div>Importing...</div>
      </div>
      }
      { contract &&
      <div className="container">
        <h3>{storage.name}</h3>
        <div className="wrapper">
          <div className="top">
            <div className="info">
              {storage.question}
            </div>
            <div className="actions">
              <div className={loading ? 'spin' : ''} onClick={() => handleFetchContractStorage(1)}>
                <AiOutlineReload />
              </div>
              <div>
                <a target="_blank" rel="noreferrer" href={`${getTzStatsUrl()}/${contract.address}`}>
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
                  <a target="_blank" rel="noreferrer" href={`${getTzStatsUrl()}/${storage.admin}`}>{truncateAddress(storage.admin)}</a>
                </span>
            </div>
            <div className="cost">
                <span className="label">Cost:</span><span className="value">{storage.cost}</span>
            </div>
            <div className="start">
                <span className="label">Start:</span><span className="value">{format(start, 'yyyy-MM-dd hh:mm:ss')}</span>
            </div>
            <div className="start">
                <span className="label">End:</span><span className="value">{format(end, 'yyyy-MM-dd hh:mm:ss')}</span>
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
      }
      <Footer />
    </div>
  )
}
