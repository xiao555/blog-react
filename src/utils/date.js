function isValidDate (date) {
  return date instanceof Date && !isNaN(date)
}

function pad(data) {
  let tmpVal = Number(data)
  if (tmpVal < 10) {
    return '0' + tmpVal;
  }
  return tmpVal.toString();
}

function parseDatetime (value) {
  if (!isValidDate(value)) return {}
  return {
    year: value.getFullYear(),
    month: pad(value.getMonth() + 1), // 月份取值0-11
    date: pad(value.getDate()),
    hour: pad(value.getHours()),
    minute: pad(value.getMinutes()),
    second: pad(value.getSeconds())
  }
}

export function getLocalYearMonthDay (value) {
  let d = new Date(value)
  if (!isValidDate(d)) return value
  const { year, month, date } = parseDatetime(d)
  return `${year}-${month}-${date}`
}