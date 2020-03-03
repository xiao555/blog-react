import React, { useState, useEffect } from 'react';
import {
  Link,
} from "react-router-dom";
import useDarkMode from '../hooks/useDarkMode'

export default function Sidebar () {
  const [enabled, enableDarkMode] = useDarkMode()

  return (
    <div className='sidebar text-left'>
      <h1>
        <Link className='logo' to='/'>打开天眼看文章</Link>
      </h1>
      <p>TECH | LIFE | X</p>
      <p className='font-sm'>
        <Link className='text-blue' to='/about' title='about me'>@me |</Link>
        <a className='text-green' href='https://github.com/xiao555' title='github' target='_blank' rel='noopener noreferrer'>@github</a>
      </p>
      <p className='font-sm'>
        <a href='mailto:zhangruiwu32@gmail.com'>zhangruiwu32@gmail.com</a>
      </p>
      <button className='border-0 px-0' onClick={() => enableDarkMode(!enabled)}>
        {
          enabled ? <i className='fas fa-sun'></i> : <i className='fas fa-moon'></i>
        }
        {/* <svg width="14" height="14" class="FontsNinjaExt-main-jss16"><path d="M11.95 2.05A6.954 6.954 0 0 0 7 0C5.13 0 3.373.728 2.05 2.05A6.952 6.952 0 0 0 0 7c0 1.87.728 3.627 2.05 4.95A6.954 6.954 0 0 0 7 14c1.87 0 3.627-.728 4.95-2.05A6.954 6.954 0 0 0 14 7c0-1.87-.728-3.627-2.05-4.95zm-1.12 1.051L3.102 10.83A5.426 5.426 0 0 1 1.534 7a5.43 5.43 0 0 1 1.601-3.865A5.43 5.43 0 0 1 7 1.535c1.444 0 2.802.556 3.83 1.566z" fill="#037D5E" fill-rule="evenodd"></path></svg> */}
      </button>
    </div>
  )
}