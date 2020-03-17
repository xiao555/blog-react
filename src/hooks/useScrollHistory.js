import { useEffect } from 'react'
import { useLocation } from "react-router-dom"

let historyMap = JSON.parse(window.localStorage.getItem('scroll-history')) || {}

const useScrollHistory = () => {
  const location = useLocation()

  useEffect(() => {
    document.documentElement.scrollTop = historyMap[location.pathname] || 0
    return () => {
      const scrollTop = document.documentElement.scrollTop
      historyMap[location.pathname] = scrollTop
      window.localStorage.setItem('scroll-history', JSON.stringify(historyMap))
    }
  // 传入空数组，模拟componentDidMount，componentWillUnmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export { useScrollHistory }
