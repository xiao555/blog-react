import React from 'react';
import { useParams } from "react-router-dom";
import Loading from '../components/Loading'
import { marked, getLocalYearMonthDay } from '../utils'
import { useArticle } from '../hooks/useArticles'

function Post() {
  const { id } = useParams()
  const article = useArticle(id)

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
