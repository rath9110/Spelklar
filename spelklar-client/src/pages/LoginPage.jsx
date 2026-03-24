import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('+46');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Only allow +46 prefix and digits
    if (!value.startsWith('+46')) {
      value = '+46';
    }
    setPhone(value);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify OTP');
        return;
      }

      // Success – store user and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/feed');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Spelklar</h1>
          <p>Logga in för att följa lag och dela bilder</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="login-form">
            <label htmlFor="phone">Telefonnummer (Svenska)</label>
            <input
              id="phone"
              type="tel"
              placeholder="+46701234567"
              value={phone}
              onChange={handlePhoneChange}
              disabled={loading}
              autoFocus
            />
            <p className="help-text">Exempel: +46701234567</p>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading || phone.length < 11}>
              {loading ? 'Skickar...' : 'Skicka kod'}
            </button>

            <p className="login-link">
              Utan konto? <a href="/">Tillbaka</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <label htmlFor="otp">Verificeringskod</label>
            <p className="help-text">Vi skickade en kod till {phone}</p>

            <input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              autoFocus
              maxLength="6"
            />

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifierar...' : 'Verifiera'}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              disabled={loading}
            >
              Ändra nummer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
