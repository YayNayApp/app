import {
  VOTING_PROCEDURES 
} from '../../shared/config'
import Header from '../../shared/components/header'
import Footer from '../../shared/components/footer'
import ProcedureListItem from './procedureListItem'
import AddForm from './form'
import './index.css'

export default function Add(props) {
  const procedures = VOTING_PROCEDURES.map(p => <ProcedureListItem key={p.id} procedure={p} />)
  // eslint-disable-next-line
  const addForm = <AddForm procedure={VOTING_PROCEDURES.filter(p => p.id == props.procedure)} />

  return (
    <div className="Add">
      <Header />
      <div className="container">
        { !props.procedure &&
          <>
          <h3>Select voting procedure</h3>
          <div className="procedureList">
            {procedures}
          </div>
          </>
        }
        { props.procedure &&
          <>
          {addForm}
          </>
        }
      </div>
      <Footer />
    </div>
  )
}
