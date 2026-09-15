import { useState } from 'react';
import api from '../api';

function AnemiaForm({ token }) {
  const [formData, setFormData] = useState({
    gender: 0, hemoglobin: 13, mch: 29, mchc: 33, mcv: 90
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/predict/anemia', {
        gender: parseInt(formData.gender),
        hemoglobin: parseFloat(formData.hemoglobin),
        mch: parseFloat(formData.mch),
        mchc: parseFloat(formData.mchc),
        mcv: parseFloat(formData.mcv)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.response?.data?.detail || 'Prediction failed' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-pink-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-800">Anemia Checker</h2>
      <p className="text-gray-400 text-sm mt-1 mb-6">Enter values from your recent CBC report</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500">
            <option value={0}>Female</option>
            <option value={1}>Male</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hemoglobin (g/dL)</label>
            <input type="number" step="0.1" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MCH</label>
            <input type="number" step="0.1" name="mch" value={formData.mch} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MCHC</label>
            <input type="number" step="0.1" name="mchc" value={formData.mchc} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">MCV</label>
            <input type="number" step="0.1" name="mcv" value={formData.mcv} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition mt-4">
          Check Anemia Likelihood
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-5 rounded-xl text-center border ${
          result.error ? 'bg-red-50 border-red-200' :
          result.prediction.includes('Unlikely') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {result.error ? (
            <p className="text-red-600 text-sm">{result.error}</p>
          ) : (
            <>
              <h3 className={`text-lg font-bold ${result.prediction.includes('Unlikely') ? 'text-green-600' : 'text-red-600'}`}>
                {result.prediction}
              </h3>
              <p className="text-gray-400 text-xs mt-1">Confidence Score: {result.confidence_score}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AnemiaForm;