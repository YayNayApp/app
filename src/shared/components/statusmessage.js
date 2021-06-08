import { useStore } from 'react-hookstore'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { 
  MdInfo,
  MdError,
  MdWarning 
} from 'react-icons/md'
import './statusmessage.css'

//const message = {
//  type: 'info',
////  message: (<div>This is a info message</div>)
//  message: (<div>You do not have the required <a href="https://tezid.net" target="_blank" rel="noreferrer">TezID</a> proofs to register for this YayNay.</div>)
//}

export default function StatusMessage(props) {
  const [message, setMessage] = useStore('infomessage')
  if (!message) return null
  let icon = <MdInfo />
  if (message.type === 'warning') icon = <MdWarning />
  if (message.type === 'error') icon = <MdError /> 

  const handleClose = () => {
    setMessage(null)
  }

  return (
    <div className="StatusMessage">
      <div className="messageContainer">
        <div className="messageHeader">
          <div className="close" onClick={handleClose}>
            <AiOutlineCloseCircle />
          </div>
        </div>
        <div className="messageBody">
          <div className={`icon ${message.type}`}>
            {icon}
          </div>
          <div className="message">
            {message.message} 
          </div>
        </div>
      </div>
    </div>
  )
}
