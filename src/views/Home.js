import React from 'react';
import { Link } from "react-router-dom";
import Loading from '../components/Loading'
import { getLocalYearMonthDay } from '../utils'
import { useArticles } from '../hooks/useArticles'
import { useScrollHistory } from '../hooks/useScrollHistory'

function Home() {
  const { articles } = useArticles()

  useScrollHistory()

  return (
    articles
      ? <div className='main-content'>
          {
            articles
              .filter(item => item.id !== 'about-me')
              .map(item =>
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
          }
        </div>
      : <Loading />
  )
}

export default Home;
