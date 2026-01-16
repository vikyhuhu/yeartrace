import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { CalendarPage } from './pages/CalendarPage'
import { YearPage } from './pages/YearPage'
import { BooksPage } from './pages/BooksPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/task/:id" element={<TaskDetailPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/year" element={<YearPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
