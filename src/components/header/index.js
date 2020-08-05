import React from 'react';
import {
  Link,
} from "react-router-dom";
import useDarkMode from 'hooks/useDarkMode'
import styles from './header.module.css'

export default function Sidebar () {
  const [enabled, enableDarkMode] = useDarkMode()

  const birthDay = 1583224596000
  const now = new Date()
  const duration = now.getTime() - birthDay
  const total = Math.floor(duration / (1000 * 60 * 60 * 24));

  return (
    <div className={styles.header}>
      <h1>
        <Link className={styles.logo} to='/'>打开天眼看文章</Link>
      </h1>
      <p className='font-sm'>
        <Link className='text-blue font-weight-bold' to='/about' title='about me'>@me |</Link>
        <a className='text-green font-weight-bold' href='https://github.com/xiao555' title='github' target='_blank' rel='noopener noreferrer'>@github</a>
      </p>
      <p className='font-sm'>
        <a href='mailto:zhangruiwu32@gmail.com'>zhangruiwu32@gmail.com</a>
      </p>
      <p><small>本站已存活 { total } 天</small></p>
      <button className='border-0 px-0 mb-1' aria-label="Theme Color" onClick={() => enableDarkMode(!enabled)}>
        <span className={[enabled ? 'icon-sun' : 'icon-moon', styles.icon].join(' ')}></span>
      </button>
    </div>
  )
}