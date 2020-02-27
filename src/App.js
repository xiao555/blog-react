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

export default function App() {
  // const { execute, pending, value, error } = useAsync(fetchArticles, true)

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
      </div>
    </Router>
  )
};
