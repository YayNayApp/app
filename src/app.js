import { Router } from 'tiny-react-router'
import Main from './screens/Main'
import Add from './screens/Add'
import Vote from './screens/Vote'
import StatusMessage from './shared/components/statusmessage'
import './shared/state'

const routes = {
  '/'               : Main,
  '/:contract'      : Vote,
  '/add'            : Add,
  '/add/:procedure' : Add,
}

export default function App() {
  return (
    <div id="App">
      <StatusMessage />
      <Router routes={routes} />
    </div>
  )
}
