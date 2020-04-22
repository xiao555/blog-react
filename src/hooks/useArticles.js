import { useState, useEffect } from 'react'
import articles from '../articles.json'

const useArticles = () => {
  return { articles }
}

const useArticle = (id) => {
  const { articles } = useArticles()
  const [article, setArticle] = useState(articles ? articles.find(_ => _.id === id) : null)

  useEffect(() => {
    if (articles) {
      const item = articles.find(_ => _.id === id)
      if (item) {
        setArticle(item)
      } else {
        setArticle(null)
      }
    }
  }, [articles, id])
  return article
}

export { useArticles, useArticle }