import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import SWUpdatePopup from 'components/sw-update-popup'
import ProgressBar from './components/ProgressBar'
import Header from './components/header'
import Home from './views/Home'
import Post from './views/Post'
import About from './views/About'
import useScroll from 'hooks/useScroll'
import { scrollSmoothTo } from './utils'

function BackToTop ({scrollTop}) {
  return (
    <div className={['back-to-top', scrollTop > 800 ? 'show' : ''].join(' ')} onClick={() => scrollSmoothTo(document.documentElement, 0)}>
      △
    </div>
  )
}

export default function App() {
  const [scrollTop] = useScroll()

  return (
    <Router>
      <div className='app'>
        <ProgressBar/>
        <main className='main'>
          <Header/>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/post/:id" component={Post}/>
            <Route path="/about" component={About}/>
          </Switch>
        </main>
        <BackToTop scrollTop={scrollTop}/>
        <SWUpdatePopup />
      </div>
    </Router>
  )
};
