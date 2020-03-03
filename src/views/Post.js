import React from 'react';
import { useParams } from "react-router-dom";
import Loading from '../components/Loading'
import { getLocalYearMonthDay } from '../utils'
import { useArticle } from '../hooks/useArticles'
import { useScrollHistory } from '../hooks/useScrollHistory'

function Post() {
  const { id } = useParams()
  const article = useArticle(id)

  useScrollHistory()

  return (
    article
      ? <article className='main-content'>
          <h2>{ article.title }</h2>
          <p><small>{ getLocalYearMonthDay(article.createDate) }</small></p>
          <p dangerouslySetInnerHTML={{ __html: article.content }}></p>
        </article>
      : <Loading />
  );
}

export default Post;