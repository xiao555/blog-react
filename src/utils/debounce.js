export default (fn, delay) => {
  let timer
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fn, delay)
  }
}