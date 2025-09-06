<template>
  <div class="jalali-calendar">
    <div class="date-input-container">
      <input
        type="text"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        class="date-input"
        readonly
      />
      <button @click="toggleCalendar" class="calendar-button" title="انتخاب تاریخ شمسی">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          <text x="12" y="16" text-anchor="middle" class="text-xs font-bold fill-current" style="font-size: 8px;">ش</text>
        </svg>
      </button>
    </div>

    <!-- Calendar Popup -->
    <div v-if="isOpen" class="calendar-popup">
      <div class="calendar-content">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <button @click="navigateMonth('prev')" class="nav-button">قبل</button>
          
          <div class="month-year-selectors">
            <!-- Month Selector -->
            <select v-model="currentMonth" class="month-selector">
              <option v-for="(month, index) in monthNames" :key="index + 1" :value="index + 1">
                {{ month }}
              </option>
            </select>
            
            <!-- Year Selector -->
            <select v-model="currentYear" class="year-selector">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ toPersianNumber(year) }}
              </option>
            </select>
          </div>
          
          <button @click="navigateMonth('next')" class="nav-button">بعد</button>
        </div>

        <!-- Week Days -->
        <div class="weekdays">
          <div v-for="day in weekDaysShort" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays" 
            :key="day.key"
            :class="[
              'calendar-day',
              { 'empty': day.empty },
              { 'today': day.isToday },
              { 'selected': day.isSelected }
            ]"
            @click="selectDate(day)"
          >
            <span v-if="!day.empty">{{ toPersianNumber(day.day) }}</span>
          </div>
        </div>

        <!-- Today Button -->
        <div class="today-section">
          <button @click="selectToday" class="today-button">امروز</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import moment from 'moment-jalaali'

// Props
interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '1403/08/15'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Reactive data
const isOpen = ref(false)
const currentYear = ref(1403)
const currentMonth = ref(1)

// Today's date
const todayYear = ref(1403)
const todayMonth = ref(1)
const todayDay = ref(1)

// Persian month names
const monthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// Week days in Persian
const weekDaysShort = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

// Available years (10 years before and after current year)
const availableYears = computed(() => {
  const current = currentYear.value
  const years: number[] = []
  for (let i = current - 10; i <= current + 10; i++) {
    years.push(i)
  }
  return years
})

// Get days in month using moment-jalaali
const getDaysInMonth = (year: number, month: number) => {
  return moment.jDaysInMonth(year, month - 1) // jDaysInMonth expects 0-11 for months
}

// Get first day of month using moment-jalaali
const getFirstDayOfMonth = (year: number, month: number) => {
  const jalaliMoment = moment([year, month - 1, 1]) // month is 0-11
  return jalaliMoment.day() // Returns 0-6 (Sunday=0, Saturday=6)
}

// Generate calendar days
const calendarDays = computed(() => {
  const days: any[] = []
  const daysInMonth = getDaysInMonth(currentYear.value, currentMonth.value)
  const firstDay = getFirstDayOfMonth(currentYear.value, currentMonth.value)
  
  // Empty days for start of month
  for (let i = 0; i < firstDay; i++) {
    days.push({ key: `empty-${i}`, empty: true })
  }
  
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear.value}/${currentMonth.value.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
    const isToday = day === todayDay.value && currentMonth.value === todayMonth.value && currentYear.value === todayYear.value
    const isSelected = props.modelValue === dateStr
    
    days.push({
      key: `day-${day}`,
      day,
      date: dateStr,
      empty: false,
      isToday,
      isSelected
    })
  }
  
  return days
})

// Convert numbers to Persian
const toPersianNumber = (num: number | string) => {
  if (num === null || num === undefined || isNaN(Number(num))) return ''
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// Convert Gregorian to Jalali using moment-jalaali
const convertToJalali = (date: Date) => {
  const jalaliMoment = moment(date)
  return {
    year: jalaliMoment.jYear(),
    month: jalaliMoment.jMonth() + 1, // jMonth() returns 0-11, we need 1-12
    day: jalaliMoment.jDate()
  }
}

// Handle input
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let inputValue = target.value
  
  // فقط اعداد و "/" را اجازه دهیم
  inputValue = inputValue.replace(/[^0-9/]/g, '')
  
  // حداکثر ۱۰ کاراکتر (۱۴۰۳/۰۸/۱۵)
  if (inputValue.length <= 10) {
    emit('update:modelValue', inputValue)
  }
}

// Toggle calendar
const toggleCalendar = () => {
  isOpen.value = !isOpen.value
}

// Navigation
const navigateMonth = (direction: 'prev' | 'next') => {
  if (direction === 'next') {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  } else {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }
}

// Select date
const selectDate = (day: any) => {
  if (day.empty) return
  
  emit('update:modelValue', day.date)
  isOpen.value = false
}

// Select today
const selectToday = () => {
  const todayStr = `${todayYear.value}/${todayMonth.value.toString().padStart(2, '0')}/${todayDay.value.toString().padStart(2, '0')}`
  emit('update:modelValue', todayStr)
  isOpen.value = false
  
  // Update current view to today
  currentYear.value = todayYear.value
  currentMonth.value = todayMonth.value
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Parse the date to set current month/year
    const parts = newValue.split('/')
    if (parts.length === 3) {
      currentYear.value = parseInt(parts[0])
      currentMonth.value = parseInt(parts[1])
    }
  }
})

// Initialize with current date
onMounted(() => {
  const today = new Date()
  const jalaliToday = convertToJalali(today)
  
  // Set today's date
  todayYear.value = jalaliToday.year
  todayMonth.value = jalaliToday.month
  todayDay.value = jalaliToday.day
  
  // Set current view
  currentYear.value = jalaliToday.year
  currentMonth.value = jalaliToday.month
  
  if (props.modelValue) {
    // Parse the date to set current month/year
    const parts = props.modelValue.split('/')
    if (parts.length === 3) {
      currentYear.value = parseInt(parts[0])
      currentMonth.value = parseInt(parts[1])
    }
  }
})
</script>

<style scoped>
.jalali-calendar {
  position: relative;
  font-family: 'Vazir', 'Tahoma', sans-serif;
}

.date-input-container {
  position: relative;
}

.date-input {
  width: 100%;
  padding: 8px 40px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  background: white;
  color: #374151;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.calendar-button {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 16px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.calendar-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.calendar-button:hover svg {
  color: #374151;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
}

.calendar-content {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 280px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 4px 8px;
  cursor: pointer;
  color: #374151;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background: #e5e7eb;
}

.month-year-selectors {
  display: flex;
  gap: 8px;
  align-items: center;
}

.month-selector, .year-selector {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}

.month-selector {
  min-width: 80px;
}

.year-selector {
  min-width: 60px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  padding: 8px;
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  transition: all 0.2s;
  user-select: none;
}

.calendar-day:hover:not(.empty) {
  background: #eff6ff;
}

.calendar-day.empty {
  cursor: default;
}

.calendar-day.today {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.calendar-day.selected {
  background: #10b981;
  color: white;
  font-weight: 600;
}

.today-section {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.today-button {
  width: 100%;
  text-align: center;
  padding: 8px;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.today-button:hover {
  background: #eff6ff;
}
</style>

