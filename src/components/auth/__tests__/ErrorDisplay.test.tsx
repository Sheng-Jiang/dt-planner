import React from 'react'
import { render, screen } from '@testing-library/react'
import { ErrorDisplay, FieldError } from '../ErrorDisplay'

describe('ErrorDisplay', () => {
  it('renders error message', () => {
    render(<ErrorDisplay error="Test error message" />)
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('does not render when error is null', () => {
    render(<ErrorDisplay error={null} />)
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
  })
})

describe('FieldError', () => {
  it('renders field error message', () => {
    render(<FieldError error="Field is required" />)
    expect(screen.getByText('Field is required')).toBeInTheDocument()
  })

  it('does not render when error is undefined', () => {
    render(<FieldError error={undefined} />)
    expect(screen.queryByText('Field is required')).not.toBeInTheDocument()
  })
})