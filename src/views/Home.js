import React, { useEffect } from 'react';
import Loading from '../components/Loading'
import PostList from '../components/post-list/index.js'
import { useArticles } from '../hooks/useArticles'
import { useScrollHistory } from '../hooks/useScrollHistory'

function Home() {
  const { articles } = useArticles()

  useScrollHistory()

  useEffect(() => {
    document.title = `首页 | 打开天眼看文章`
  })

  return (
    articles
      ? <div className='main-content'>
          <PostList posts={articles.filter(item => item.id !== 'about-me')}/>
        </div>
      : <Loading />
  )
}

export default Home;
