import { useState } from 'react';
import api from '../api';

function PCOSForm({ token }) {
  const [formData, setFormData] = useState({
    age: 25, weight: 60, height: 160,
    cycle_regular: true, cycle_length: 28, marriage_years: 0,
    pregnant: false, weight_gain: false, hair_growth: false,
    skin_darkening: false, hair_loss: false, pimples: false,
    fast_food: false, exercise: true
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        cycle_length: parseFloat(formData.cycle_length),
        marriage_years: parseFloat(formData.marriage_years),
      };
      const response = await api.post('/predict/pcos', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.response?.data?.detail || 'Prediction failed' });
    }
  };

  const checkboxFields = [
    { name: 'pregnant', label: 'Pregnant' },
    { name: 'weight_gain', label: 'Weight Gain' },
    { name: 'hair_growth', label: 'Excess Hair Growth' },
    { name: 'skin_darkening', label: 'Skin Darkening' },
    { name: 'hair_loss', label: 'Hair Loss' },
    { name: 'pimples', label: 'Pimples/Acne' },
    { name: 'fast_food', label: 'Frequent Fast Food' },
    { name: 'exercise', label: 'Regular Exercise' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-pink-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-800">PCOS Symptom Checker</h2>
      <p className="text-gray-400 text-sm mt-1 mb-6">Select your symptoms to check PCOS likelihood</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Age (years)</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (Kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Height (Cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <label className="flex items-center gap-2 bg-pink-50 px-4 py-3 rounded-lg text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" name="cycle_regular" checked={formData.cycle_regular} onChange={handleChange}
            className="w-4 h-4 accent-pink-600" />
          Regular Menstrual Cycle
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Cycle Length (days)</label>
            <input type="number" name="cycle_length" value={formData.cycle_length} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Years Since Marriage</label>
            <input type="number" name="marriage_years" value={formData.marriage_years} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {checkboxFields.map((field) => (
            <label key={field.name} className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name]}
                onChange={handleChange}
                className="w-4 h-4 accent-pink-600"
              />
              {field.label}
            </label>
          ))}
        </div>

        <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition mt-4">
          Check PCOS Likelihood
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

export default PCOSForm;