import { useState } from 'react'
import  useEventListener from './useEventListener'

const useScroll = (element = document.documentElement) => {
  const [value, setValue] = useState(element.scrollTop)

  const handler = () => {
    setValue(element.scrollTop)
  }

  useEventListener('scroll', handler)

  return [value]
}

export default useScroll