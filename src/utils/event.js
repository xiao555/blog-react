class Event {
  constructor () {
    this.map = {}
  }

  on (eventType, fn) {
    if (!eventType || typeof eventType !== 'string' || typeof fn !== 'function') return
    if (!this.map[eventType]) {
      this.map[eventType] = []
    }
    this.map[eventType].push(fn)
  }

  emit (eventType, ...values) {
    if (!eventType || typeof eventType !== 'string') return
    if (!this.map[eventType]) return

    this.map[eventType].forEach(fn => fn(...values))
  }

  off (eventType, fn) {
    if (!eventType || typeof eventType !== 'string' || typeof fn !== 'function') return
    if (!this.map[eventType]) return

    [fn, ...this.map[eventType]] = this.map[eventType]
  }

  once (eventType, fn) {
    const wrapFn = (...values) => {
      fn(...values)
      this.off(eventType, wrapFn)
    }
    this.on(eventType, wrapFn)
  }
}

export default new Event()

