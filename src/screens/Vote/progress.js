import {
  isFloat
} from '../../shared/utils'
import './progress.css'

export default function Progress(props) {
  const { yays, nays } = props;

  let yaypercent = (yays / (yays + nays)) * 100
  let naypercent = (nays / (yays + nays)) * 100
  if (isNaN(yaypercent)) yaypercent = 0
  if (isNaN(naypercent)) naypercent = 0
  if (isFloat(yaypercent)) yaypercent = yaypercent.toFixed(2)
  if (isFloat(naypercent)) naypercent = naypercent.toFixed(2)

  const fillerStyles = {
    width: `${yaypercent}%`,
  }

  return (
    <div className="Progress">
      <div className="labels">
        <div className="label yay">
          <div className="main">Yay {`${yaypercent}%`}</div>
          <div className="sub">{`(${yays} votes)`}</div>
        </div>
        <div className="label nay">
          <div className="main">{`${naypercent}%`} Nay</div>
          <div className="sub">{`(${nays} votes)`}</div>
        </div>
      </div>
      <div className="bar">
        <div style={fillerStyles} className="filler"></div>
      </div>
    </div>
  )
}

