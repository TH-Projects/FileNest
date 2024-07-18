import {Routes, Route} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import Titlebar from './components/titlebar'
import FileTable from './container/filetable';

function App() {

  return (
    <>
      <Titlebar/>
      <div>
        <Routes>
          <Route path='/' element = {<FileTable/>} />
        </Routes>
      </div>
    </> 
  )
}

export default App
