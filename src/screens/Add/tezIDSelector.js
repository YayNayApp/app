import { useState } from 'react'
import './tezIDSelector.css'

export default function TezIDSelector(props) {
  const [selected, setSelected] = useState([])

  const handleSetAnyone = () => {
    setSelected(['anyone'])
    props.onChange({ target: { value: [] }})
  }
  const handleToggleSelected = (proof) => {
    const _selected = selected.filter(s => s !== 'anyone')
    let __selected
    if (selected.indexOf(proof) < 0) __selected = _selected.concat(proof)
    if (selected.indexOf(proof) >= 0) __selected = _selected.filter(p => p !== proof)
    setSelected(__selected)
    props.onChange({ target: { value: __selected }})
  }

  const options = props.proofOptions.map(po => {
    let _selected = selected.indexOf(po.key) >= 0
    let logo = _selected ? 'https://tezid.net/logo-notext.svg' : 'https://tezid.net/logo-gray-notext.svg'
    return (
      <div key={po.key} onClick={() => handleToggleSelected(po.key) } className={`proofOption ${_selected ? 'selected' : ''}`}>
        <img src={logo} alt="tezid-logo" />
        <div>{po.label}</div>
      </div>
    )
  })

  return (
    <div className="TezIDSelector formField">
      <label>Who can vote?</label>
      <p>
        YayNay is a platform for human beings to make collective decisions. We want to discourage bots and people voting with multiple addresses. 
        The <a target="_blank" rel="noreferrer" href="https://tezid.net">TezID</a> oracle helps us achieve just this. 
        Select what TezID proofs are required in order to vote.
      </p>
      <div className="proofOptions">
        { !props.required &&
          <div key="anyone" onClick={handleSetAnyone} className={`proofOption ${selected.indexOf('anyone') >= 0 ? 'selected' : ''}`}>
            Anyone
          </div>
        }
        {options}
      </div>
      { props.errors &&
        <div className="error">{props.errors}</div>
      }
    </div>
  )
}
