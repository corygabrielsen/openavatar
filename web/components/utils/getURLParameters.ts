export function getURLParameters(): { password: string; reveal?: string } {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

  return {
    password: urlParams.get('password') || '',
    reveal: urlParams.get('reveal') || '',
  }
}
