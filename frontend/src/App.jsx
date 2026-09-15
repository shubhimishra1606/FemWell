import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import PCOSForm from './components/PCOSForm';
import AnemiaForm from './components/AnemiaForm';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('pcos');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-600">FemWell</h1>
            <p className="text-gray-400 text-sm mt-1">Women's Health Screening Platform</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-pink-100 p-8">
            {showSignup ? <Signup /> : <Login onLoginSuccess={setToken} />}
            <button
              onClick={() => setShowSignup(!showSignup)}
              className="w-full text-center text-pink-600 text-sm mt-4 hover:underline"
            >
              {showSignup ? 'Already have an account? Login' : "New user? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-pink-600">FemWell Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pcos')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'pcos' ? 'bg-pink-600 text-white' : 'bg-white text-gray-400'
            }`}
          >
            PCOS Check
          </button>
          <button
            onClick={() => setActiveTab('anemia')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'anemia' ? 'bg-pink-600 text-white' : 'bg-white text-gray-400'
            }`}
          >
            Anemia Check
          </button>
        </div>

        {activeTab === 'pcos' ? <PCOSForm token={token} /> : <AnemiaForm token={token} />}
      </div>
    </div>
  );
}

export default App;