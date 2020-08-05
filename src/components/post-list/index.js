import React from 'react'
import { Link } from "react-router-dom"
import { getLocalYearMonthDay } from '../../utils'
import styles from './post-list.module.css'

function List({ posts }) {
  return (
    posts.map(item =>
      <article className={styles.listItem} key={item.id}>
        <h2><Link to={`/post/${item.slug}`}>{ item.title }</Link></h2>
        <p><small>{ getLocalYearMonthDay(item.createDate) }</small></p>
        <p dangerouslySetInnerHTML={{ __html: item.intro }}></p>
      </article>
    )
  )
}

export default List
