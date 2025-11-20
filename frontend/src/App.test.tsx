import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Since we redirect to login/landing, we can check for basic elements
    // or just ensure it doesn't throw
    expect(document.body).toBeTruthy()
  })
})
