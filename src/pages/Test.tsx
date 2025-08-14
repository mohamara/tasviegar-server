import React from 'react'

export default function Test() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'center'
    }}>
      <h1>تست فرانت‌اند</h1>
      <p>اگر این صفحه را می‌بینید، فرانت‌اند کار می‌کند!</p>
      <div style={{ 
        backgroundColor: '#4CAF50', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        ✅ فرانت‌اند React آماده است
      </div>
      <p>زمان: {new Date().toLocaleString('fa-IR')}</p>
    </div>
  )
}
