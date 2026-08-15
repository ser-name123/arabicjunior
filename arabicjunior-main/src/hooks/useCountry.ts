'use client';

import { useEffect, useState } from 'react';

export function useCountryCode() {
  const [countryCode, setCountryCode] = useState<string | 'AE'>("AE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountryCode() {
      try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();

        if (data.success) {
          setCountryCode(data.country_code); // like 'US', 'BD'
        } else {
          setError(data.message || 'Failed to fetch location');
        }
      } catch (err) {
        setError('Error fetching location');
      } finally {
        setLoading(false);
      }
    }

    fetchCountryCode();
  }, []);

  return { countryCode, loading, error };
}