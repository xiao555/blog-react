import { useState } from 'react'
import  useEventListener from './useEventListener'
import debounce from 'utils/debounce'

const useScroll = (element = document.documentElement) => {
  const [value, setValue] = useState(element.scrollTop)

  const handler = () => {
    setValue(element.scrollTop)
  }

  useEventListener('scroll', debounce(handler, 200))

  return [value]
}

export default useScroll