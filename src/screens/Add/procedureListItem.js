import { nav } from 'tiny-react-router'
import ReactTooltip from 'react-tooltip'
import { 
  AiOutlineFieldBinary, 
  AiOutlineUnorderedList,
  AiOutlineFunction
} 
from 'react-icons/ai'
import { RiEarthLine } from 'react-icons/ri'
import { FaUserSecret } from 'react-icons/fa'
import './procedureListItem.css'

export default function ProcedureListItem(props) {
  const p = props.procedure

  const handleNavigate = () => {
    if (p.disabled) return
    nav(`/add/${p.id}`)
  }

  const choiceIcon = p.choice === 'binary' ? 
    <div data-tip="Binary choice"><AiOutlineFieldBinary /></div> : 
    <div data-tip="Multiple choice"><AiOutlineUnorderedList /></div>
  const secretIcon = p.secret ? 
    <div data-tip="Votes are secret" className="secret"><FaUserSecret /></div> :
    <div data-tip="Votes are public"><RiEarthLine /></div>
  const resolveIcon = p.resolve === 'function' ? 
    <div data-tip="Calls a function on resolve" className="function"><AiOutlineFunction /></div> :
    null

  return (
    <div className={`procedureListItem ${p.disabled ? 'disabled' : ''}`} onClick={handleNavigate}>
      <div className="name">{p.name}</div>
      <div className="properties">
        {resolveIcon}
        {secretIcon}
        {choiceIcon}
      </div>
      <ReactTooltip effect="solid" />
    </div>
  )
}
