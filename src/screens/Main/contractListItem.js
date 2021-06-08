import { nav } from 'tiny-react-router'
import { format } from 'date-fns'
import { getStatusString } from '../../shared/utils'
import './contractListItem.css'

const dateFormat = 'yyyy-MM-dd'

export default function ContractListItem(props) {
  const c = props.contract
  const storage = c.storage

  const handleNav = () => {
    nav(`/${c.address}`)
  }

  return (
    <div className="contractListItem" onClick={handleNav}>
      <div className="info">
        <div className="basic">
          <div className="nameWrapper">
            <div className="icon"><img src="/logo-only.svg" alt="logo"/></div>
            <div className="name">{storage.name}</div>
          </div>
          <div className="dates">
            <div className="start">Starts: {format(new Date(storage.start), dateFormat)}</div>
            <div className="end">Ends: {format(new Date(storage.end), dateFormat)}</div>
            <div className="status">Status: {getStatusString(storage)}</div>
          </div>
        </div>
        <div className="question">
          <div className="long">{storage.question}</div>
        </div>
      </div>
    </div>
  )
} 
