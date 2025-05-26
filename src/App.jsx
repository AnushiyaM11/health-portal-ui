import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './components/LoginForm';
import MedicalReportForm from "./components/MedicalReport";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm/>} />
        <Route path="/medical-report" element={<MedicalReportForm />} />
      </Routes>
    </Router>
  );
}

export default App;
