import { useState } from 'react'
import { nav } from 'tiny-react-router'
import { diff } from 'deep-diff'
import sortObj from 'sort-any'
import { validateContractAddress } from '@taquito/utils'
import { 
  fetchContractCode, 
  fetchContractStorage 
} from '../../shared/wallet'
import Header from '../../shared/components/header'
import Footer from '../../shared/components/footer'
import './import.css'

export default function ImportContract(props) {
  const [error, setError] = useState(null)

  const importContract = async () => {
    let storage, code;
    try {
      storage = await fetchContractStorage(props.contract, props.network)
      code = await fetchContractCode(props.contract, props.network)
    } catch(e) {
      console.error(e)
      return setError(new Error(`Unable to import contract!`))
    }
    if (!storage) return setError(new Error('Unable to fetch contract data'))
    if (!storage.ynid) return setError(new Error('Missing YayNay id, unable to import'))
    const localContract = await fetch(`/contracts/${storage.ynid}_code.json`).then(res => res.json())
    const a = sortObj(code)
    const b = sortObj(localContract.code)
    const _diff = diff(a, b)
    if (_diff) return setError(new Error('Unfamiliar contract. Unable to import'))
    props.dispatchContracts({ type: 'addLocal', payload: {
      address: props.contract,
      storage: storage,
      network: props.network.type
    }}) 
    nav('/')
  }

  const validContractAddress = validateContractAddress(props.contract) === 3
  // 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).

  return (
    <div className="ImportContract">
      <Header />
      <div className="container">
        { !validContractAddress &&
          <div className="error">
            <h3>Error!</h3>
            <div>Contract address invalid</div>
          </div>
        }
        { error &&
          <div className="error">
            <h3>Error!</h3>
            <div>{error.message}</div>
          </div>
        }
        { !error && validContractAddress &&
          <>
          <h1>New YayNay!</h1>
          <p>It appears you are trying to view a Vote you have not seen before.</p> 
          <p>Would you like to import it?</p>
          <div className="buttons">
            <button className="negative" onClick={() => { nav('/') }}>Cancel</button>
            <button className="positive" onClick={importContract}>Import</button>
          </div>
          </>
        }
      </div>
      <Footer />
    </div>
  )
}
