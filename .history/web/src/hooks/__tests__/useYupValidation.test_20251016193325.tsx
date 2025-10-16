import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useYupValidation } from '../useYupValidation';
import { loginValidationSchema } from '../../validations/schemas';
import * as Yup from 'yup';

// Test component that uses the hook
function TestComponent() {
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  } = useYupValidation(loginValidationSchema, {
    email: '',
    password: '',
  });

  return (
    <div>
      <input
        data-testid="email"
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      {errors.email && <span data-testid="email-error">{errors.email}</span>}
      
      <input
        data-testid="password"
        type="password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
      />
      {errors.password && <span data-testid="password-error">{errors.password}</span>}
      
      <button
        data-testid="submit"
        disabled={!isValid}
        onClick={validateAll}
      >
        Submit
      </button>
      
      <button data-testid="reset" onClick={reset}>
        Reset
      </button>
      
      <span data-testid="is-valid">{isValid.toString()}</span>
    </div>
  );
}

describe('useYupValidation Hook', () => {
  it('should initialize with default values', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('email')).toHaveValue('');
    expect(screen.getByTestId('password')).toHaveValue('');
    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
  });

  it('should update values when input changes', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const emailInput = screen.getByTestId('email');
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should show validation errors on blur', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const emailInput = screen.getByTestId('email');
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const passwordInput = screen.getByTestId('password');
    await user.click(passwordInput);
    await user.tab(); // Trigger blur without typing
    
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });

  it('should show form as valid when all fields are valid', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'validPassword123');
    
    await waitFor(() => {
      expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
    });
  });

  it('should reset form when reset is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const emailInput = screen.getByTestId('email');
    const resetButton = screen.getByTestId('reset');
    
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    
    await user.click(resetButton);
    expect(emailInput).toHaveValue('');
  });

  it('should validate all fields when validateAll is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const submitButton = screen.getByTestId('submit');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });
});
