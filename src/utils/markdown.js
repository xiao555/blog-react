import marked from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  langPrefix: 'hljs',
  highlight: code => hljs.highlightAuto(code).value
})

export { marked }
