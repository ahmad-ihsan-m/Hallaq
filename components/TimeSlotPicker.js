'use client'

// Generates an array of the next `count` days starting from today.
// Returns objects: { label: 'Sen, 6 Jan', value: 'YYYY-MM-DD' }
export function getNextDays(count = 7) {
  const days = []
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    days.push({
      value: `${yyyy}-${mm}-${dd}`,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      isToday: i === 0,
    })
  }
  return days
}

/**
 * DatePicker — a row of 7 day buttons.
 * Props: days, selectedDate, onSelect
 */
export function DatePicker({ days, selectedDate, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day) => (
        <button
          key={day.value}
          type="button"
          onClick={() => onSelect(day.value)}
          className={`flex flex-col items-center min-w-[56px] px-3 py-2.5 rounded-xl border-2 transition-all flex-shrink-0 ${
            selectedDate === day.value
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
          }`}
        >
          <span className="text-xs font-medium opacity-80">{day.dayName}</span>
          <span className="text-lg font-bold leading-tight">{day.dayNum}</span>
          <span className="text-xs opacity-70">{day.month}</span>
          {day.isToday && (
            <span className={`text-[10px] mt-0.5 font-semibold ${
              selectedDate === day.value ? 'text-white/80' : 'text-brand-500'
            }`}>Hari ini</span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * SlotGrid — cinema-style time slot grid.
 * Props: slots [{ time, available }], selectedTime, onSelect, loading
 */
export function SlotGrid({ slots, selectedTime, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!slots.length) {
    return <p className="text-gray-400 text-sm">Pilih barber dan tanggal terlebih dahulu.</p>
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(({ time, available }) => {
        const isSelected = selectedTime === time
        return (
          <button
            key={time}
            type="button"
            disabled={!available}
            onClick={() => available && onSelect(time)}
            className={`relative h-12 rounded-xl text-sm font-semibold transition-all border-2 ${
              !available
                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                : isSelected
                ? 'border-brand-500 bg-brand-500 text-white shadow-md scale-105'
                : 'border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:bg-brand-50'
            }`}
          >
            {time}
            {!available && (
              <span className="absolute top-0.5 right-1 text-[10px] text-gray-300">✕</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
