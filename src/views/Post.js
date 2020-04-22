import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import Loading from '../components/Loading'
import { getLocalYearMonthDay } from '../utils'
import { useArticle } from '../hooks/useArticles'
import { useScrollHistory } from '../hooks/useScrollHistory'
import Valine from 'valine'

function Post() {
  const { id } = useParams()
  const article = useArticle(id)

  useScrollHistory()

  useEffect(() => {
    document.title = `${article.title} | 打开天眼看文章`
  })

  useEffect(() => {
    new Valine({
      el:'#vcomments',
      appId: '2VQxghv1P34UuWX18ynpOBhX-gzGzoHsz',
      appKey: 'IUpu9P5iuaym0hGnWxogUvon',
      visitor: true,
      recordIP: true,
      path: id
    })
  }, [id])

  return (
    article
      ? <article className='main-content'>
          <h2>{ article.title }</h2>
          <p>
            <small>{ getLocalYearMonthDay(article.createDate) }</small>
            <span id={id} className='leancloud_visitors ml-1'><small>阅读量</small> <small className="leancloud-visitors-count"></small></span>
          </p>
          <section dangerouslySetInnerHTML={{ __html: article.content }}></section>
          <section id='vcomments'></section>
        </article>
      : <Loading />
  );
}

export default Post;
