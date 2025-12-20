import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder page components (will be replaced in later features)
function OverviewPage() {
  return <div>Overview Page</div>;
}

function PlansPage() {
  return <div>Plans Page</div>;
}

function SessionsPage() {
  return <div>Sessions Page</div>;
}

function SettingsPage() {
  return <div>Settings Page</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
