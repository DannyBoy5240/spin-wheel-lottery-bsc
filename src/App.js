import { Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Lottery from './pages/lottery.js'

import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';


//this will give instance of library we want ether.js or web3.js i prefer use ether.js
function getLibrary(provider) {
   const library = new Web3Provider(provider);
   library.pollingInterval = 8000;
   return library;
 }

function App() {
  return (
      <Web3ReactProvider getLibrary={getLibrary}>
          <Fragment>
            <Router>
                <Routes>
                  <Route path="/" element={<Lottery/>} />
                </Routes>
            </Router>
        </Fragment>
      </Web3ReactProvider>     
  );
}

export default App;
