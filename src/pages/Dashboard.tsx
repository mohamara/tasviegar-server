import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: '#333', margin: '0' }}>داشبورد تسویه‌گر</h1>
        <p style={{ color: '#666', margin: '10px 0 0 0' }}>مدیریت زنجیره‌های بدهی و تسویه هوشمند</p>
      </div>

      {/* Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <Link to="/debts" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <h2 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>بدهی‌ها</h2>
            <p style={{ color: '#666', margin: '0' }}>مدیریت بدهی‌ها و قرض‌ها</p>
          </div>
        </Link>

        <Link to="/groups" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <h2 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>گروه‌ها</h2>
            <p style={{ color: '#666', margin: '0' }}>مدیریت گروه‌ها و اعضا</p>
          </div>
        </Link>

        <Link to="/notifications" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <h2 style={{ color: '#FF9800', margin: '0 0 10px 0' }}>اعلان‌ها</h2>
            <p style={{ color: '#666', margin: '0' }}>مدیریت اعلان‌ها و پیام‌ها</p>
          </div>
        </Link>
      </div>

      {/* Status */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          ✅ داشبورد آماده است
        </div>
        <p style={{ color: '#666' }}>زمان: {new Date().toLocaleString('fa-IR')}</p>
      </div>
    </div>
  )
}
