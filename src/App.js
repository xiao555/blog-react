import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import ProgressBar from './components/ProgressBar'
import Sidebar from './components/Sidebar'
import Home from './views/Home'
import Post from './views/Post'
import About from './views/About'
import useScroll from './hooks/useScroll'
import { scrollSmoothTo } from './utils'

function BackToTop () {
  return (
    <div className='back-to-top' onClick={() => scrollSmoothTo(document.documentElement, 0)}>
      <i className="fa fa-fighter-jet"></i>
    </div>
  )
}

export default function App() {
  // const { execute, pending, value, error } = useAsync(fetchArticles, true)
  const [scrollTop] = useScroll()

  return (
    <Router>
      <div className='app'>
        <ProgressBar/>
        <main className='main'>
          <Sidebar/>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/post/:id" component={Post}/>
            <Route path="/about" component={About}/>
          </Switch>
        </main>
        {
          scrollTop > 800 && <BackToTop />
        }
      </div>
    </Router>
  )
};
