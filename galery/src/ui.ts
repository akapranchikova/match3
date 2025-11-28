// Common UI helpers used across multiple screens
export const createButton = (label: string, variant: 'primary' | 'secondary' = 'primary') => {
  const button = document.createElement('button')
  button.textContent = label
  button.className = `button ${variant}`
  return button
}
