const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Money arrives from the server as text, "54.00". Turn it into a number once,
// here, so nothing anywhere else does '54.00' + 100 and gets "54.00100".
export const formatPrice = value => {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return '₹0'
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

// The long date text from the server, shortened to 19 Sep 2026.
export const formatDate = value => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// delivery_slot is a saved word. These are the three labels the screens show.
export const DELIVERY_SLOTS = [
  {value: 'MORNING', label: 'Morning', hint: '7 to 10'},
  {value: 'AFTERNOON', label: 'Afternoon', hint: '12 to 3'},
  {value: 'EVENING', label: 'Evening', hint: '5 to 8'},
]

export const formatSlot = value => {
  const slot = DELIVERY_SLOTS.find(each => each.value === value)
  return slot === undefined ? value : `${slot.label} ${slot.hint}`
}
