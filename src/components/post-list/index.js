import React from 'react'
import './style.css'
import { Link, useHistory } from "react-router-dom"
import { getLocalYearMonthDay } from '../../utils'

function List({ posts }) {
  const history = useHistory()

  return (
    posts.map(item =>
      <article className='post-list-item' key={item.id} onClick={() => history.push(`/post/${item.slug}`)}>
        <div className='post-list-item-info'>
          <h2><Link to={`/post/${item.slug}`}>{ item.title }</Link></h2>
          <p><small>{ getLocalYearMonthDay(item.createDate) }</small></p>
          <p dangerouslySetInnerHTML={{ __html: item.intro }}></p>
        </div>
        <div className='post-list-item-thumb-wrapper'>
          <div className='post-list-item-thumb' style={{ backgroundImage: `url(${item.thumb})` }}></div>
        </div>
      </article>
    )
  )
}

export default List
