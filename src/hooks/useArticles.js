import { useState, useEffect } from 'react'
import useLocalStorage from './useLocalStorage'

const url = 'https://raw.githubusercontent.com/xiao555/blog-articles/master/articles.json'

let cache = null
let refresh = false

const useArticles = () => {
  const [articles, setArticles] = useLocalStorage('articles', cache)

  if (!refresh) {
    refresh = true
    fetch(url)
      .then(async r => {
        if (r.ok) {
          setArticles(await r.json())
          cache = articles
        } else {
          refresh = false
        }
      })
  }

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