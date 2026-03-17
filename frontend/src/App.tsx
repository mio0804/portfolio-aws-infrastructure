import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Callback from './pages/Callback';
import PetList from './pages/PetList';
import PetForm from './pages/PetForm';
import PetDetail from './pages/PetDetail';
import DiaryList from './pages/DiaryList';
import DiaryForm from './pages/DiaryForm';
import DiaryDetail from './pages/DiaryDetail';
import UserProfile from './pages/UserProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="pets" element={<PetList />} />
            <Route path="pets/new" element={<PetForm />} />
            <Route path="pets/:id" element={<PetDetail />} />
            <Route path="pets/:id/edit" element={<PetForm />} />
            <Route path="diaries" element={<DiaryList />} />
            <Route path="diaries/new" element={<DiaryForm />} />
            <Route path="diaries/:id" element={<DiaryDetail />} />
            <Route path="diaries/:id/edit" element={<DiaryForm />} />
            <Route path="pets/:petId/diaries" element={<DiaryList />} />
            <Route path="pets/:petId/diaries/new" element={<DiaryForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
