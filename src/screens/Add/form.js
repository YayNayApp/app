import { nav } from 'tiny-react-router'
import { useState } from 'react'
import { useStore } from 'react-hookstore'
import { originateContract } from '../../shared/wallet'
import TezIDSelector from './tezIDSelector'
import './form.css'

export default function AddForm(props) {
  const [network] = useStore('network')
  const [wallet] = useStore('wallet')
  // eslint-disable-next-line
  const [loading, setLoading] = useStore('loading')
  // eslint-disable-next-line
  const [contracts, dispatchContracts] = useStore('contracts')
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const p = props.procedure[0]

  if (props.procedure.length === 0) return (
    <div className="AddForm">
      <h3>Unknown procedure selected</h3>
    </div>
  )

  const validate = () => {
    let _errors = {}
    let valid = true
    for (let field of p.options) {
      let value = values[field.name]
      try {
        field.validate(value)
      } catch(e) {
        _errors[field.name] = e.message
        valid = false
        break
      }
    }
    setErrors(_errors)
    return valid
  }

  const handleCreateVote = async () => {
    if (!validate()) return
    const code = await fetch(p.code).then(r => r.json())
    let storage = await fetch(p.storage).then(r => r.text())
    Object.keys(values).forEach(k => {
      let val = values[k]
      if (['start', 'end'].indexOf(k) >= 0) {
        if (val.length === 16) val = `${val}:00Z`
        if (val.length === 19) val = `${val}Z`
        console.log(val)
      }
      storage = storage.replace(`$YAYNAY_${k.toUpperCase()}`,val)
    })
    storage = storage.replace(`$YAYNAY_ID`, p.id)
    storage = storage.replace(`$YAYNAY_ADMIN`, wallet.address)
    storage = storage.replace(`$YAYNAY_TEZID_ADDRESS`, network.tezid)
    const tezidProofString = values.proofs.map(p => { return { "string": p } })
    storage = storage.replace(`$YAYNAY_TEZID_PROOFS`, JSON.stringify(tezidProofString))
    //console.log(storage)
    storage = JSON.parse(storage)
    const confirmed = window.confirm('Sure?')
    if (!confirmed) return
    try {
      setLoading(true)
      const contract = await originateContract(network, code, storage)
      setLoading(false)
      dispatchContracts({ type: 'addLocal', payload: contract }) 
      nav('/')
    } catch(e) {
      setLoading(false)
      console.error(e.data)
    }
  }

  function handleFormChange(e) {
    let _update = {}
    _update[this.field] = e.target.value
    setValues({...values, ..._update})
  }

  const formInputs = p.options.map(o => {
    switch(o.type) {
      case 'text':
        return (
          <div key={o.name} className="formField">
            <label>{o.label}</label>
            <p>{o.description}</p>
            <input key={o.name} type="text" placeholder={o.placeholder} maxLength={o.maxLength} value={values[o.name] || ''} onChange={handleFormChange.bind({ field: o.name })} />
            { errors[o.name] &&
              <div className="error">{errors[o.name]}</div>
            }
          </div>
        )
      case 'textarea':
        return (
          <div key={o.name} className="formField">
            <label>{o.label}</label>
            <p>{o.description}</p>
            <textarea key={o.name} type="text" placeholder={o.placeholder} maxLength={o.maxLength} value={values[o.name] || ''} onChange={handleFormChange.bind({ field: o.name })} />
            { errors[o.name] &&
              <div className="error">{errors[o.name]}</div>
            }
          </div>
        )
      case 'number':
        return (
          <div key={o.name} className="formField">
            <label>{o.label}</label>
            <p>{o.description}</p>
            <input key={o.name} type="number" placeholder={o.placeholder} value={values[o.name] || ''} onChange={handleFormChange.bind({ field: o.name })} />
            { errors[o.name] &&
              <div className="error">{errors[o.name]}</div>
            }
          </div>
        )
      case 'timestamp':
        return (
          <div key={o.name} className="formField timestamp">
            <label>{o.label}</label>
            <p>{o.description}</p>
            <input type="datetime-local" value={values[o.name] || ''} onChange={handleFormChange.bind({ field: o.name })} placeholder={o.placeholder} />
            { errors[o.name] &&
              <div className="error">{errors[o.name]}</div>
            }
          </div>
        )
      case 'range':
        return (
          <div key={o.name} className="formField rangeInput">
            <label>{o.label}</label>
            <input type="range" min={o.min} max={o.max} step={o.step} value={values[o.name] || o.value} onChange={handleFormChange.bind({ field: o.name })} />
            { errors[o.name] &&
              <div className="error">{errors[o.name]}</div>
            }
          </div>
        )
      case 'tezid':
        return <TezIDSelector key={o.name} {...o} errors={errors[o.name]} onChange={handleFormChange.bind({ field: o.name })} />
      default:
        return null
    }
  })

  return (
    <div className="AddForm">
      <h3>{p.name}</h3>
      <form>
        {formInputs}
      </form>
      <button className="positive" onClick={handleCreateVote}>Create</button>
    </div>
  )
}
