/**
 * 平滑滚动到指定位置
 * @param {Element} element - 平滑滚动的元素
 * @param {Number} position - 滚动到的位置
 */
export const scrollSmoothTo = (element, position) => {
  if (typeof window.getComputedStyle(document.body).scrollBehavior === 'undefined') {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        return setTimeout(callback, 17)
      }
    }
    const step = () => {
      const scrollTop = element.scrollTop
      const distance = position - scrollTop
      const nextScrollTop = scrollTop + (distance >= 0 ? Math.max(distance / 5, 1) : Math.min(distance / 5, -1))
      if (Math.abs(position - scrollTop) <= 1) {
        element.scrollTop = position
      } else {
        element.scrollTop = nextScrollTop
        requestAnimationFrame(step)
      }
    }
    step()
  } else {
    element.style.scrollBehavior = 'smooth'
    element.scrollTop = position
  }
}
