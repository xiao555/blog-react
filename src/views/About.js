import React from 'react';
import Loading from '../components/Loading'
import { marked, getLocalYearMonthDay } from '../utils'
import { useArticle } from '../hooks/useArticles'

function Post() {
  const article = useArticle('about-me')

  return (
    article
      ? <article className='main-content'>
          <h2>{ article.title }</h2>
          <p><small>{ getLocalYearMonthDay(article.createDate) }</small></p>
          <p dangerouslySetInnerHTML={{ __html: marked(article.content) }}></p>
        </article>
      : <Loading />
  );
}

export default Post;
