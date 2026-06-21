import { useState, useEffect } from 'react'

/**
 * Custom Hook untuk menunda (debounce) pembaruan nilai.
 * Kueri atau proses berat hanya akan dieksekusi ketika user 
 * telah berhenti melakukan perubahan selama waktu delay yang ditentukan.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timer untuk menunda pembaruan
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Bersihkan timer jika ada perubahan nilai SEBELUM delay habis (user masih mengetik)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
