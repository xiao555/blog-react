import React from 'react';
import Loading from '../components/Loading'
import PostList from '../components/post-list/index.js'
import { useArticles } from '../hooks/useArticles'
import { useScrollHistory } from '../hooks/useScrollHistory'

function Home() {
  const { articles } = useArticles()

  useScrollHistory()

  return (
    articles
      ? <div className='main-content'>
          <PostList posts={articles.filter(item => item.id !== 'about-me')}/>
        </div>
      : <Loading />
  )
}

export default Home;
