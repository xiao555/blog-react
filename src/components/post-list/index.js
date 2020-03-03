import React from 'react'
import './style.css'
import { Link } from "react-router-dom"
import { getLocalYearMonthDay } from '../../utils'

function List({ posts }) {
  return (
    posts.map(item =>
      <Link to={`/post/${item.slug}`} key={item.id}>
        <article className='post-list-item'>
          <div className='post-list-item-info'>
            <h2>{ item.title }</h2>
            <p><small>{ getLocalYearMonthDay(item.createDate) }</small></p>
            <p dangerouslySetInnerHTML={{ __html: item.intro }}></p>
          </div>
          <div className='post-list-item-thumb-wrapper'>
            <div className='post-list-item-thumb' style={{ backgroundImage: `url(${item.thumb})` }}></div>
          </div>
        </article>
      </Link>
    )
  )
}

export default List
