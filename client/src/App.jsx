import {Routes, Route} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import Titlebar from './components/titlebar'

function App() {

  return (
    <>
      <Titlebar/>
      <div>
        <Routes>
          <Route path='/' element = {<h2></h2>} />
        </Routes>
      </div>
    </> 
  )
}

export default App
