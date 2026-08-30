import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import * as AuthContext from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Component', () => {
    const mockLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the useAuth hook
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            login: mockLogin,
        });
    });

    const renderLogin = () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    it('renders login form correctly', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows error when email is missing', async () => {
        renderLogin();
        const button = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(button);
        
        expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('shows error when password is missing', async () => {
        renderLogin();
        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        
        const button = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(button);
        
        expect(await screen.findByText(/please enter your password/i)).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('calls login and navigates on success', async () => {
        renderLogin();
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        mockLogin.mockResolvedValueOnce();

        const button = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays error message on login failure', async () => {
        renderLogin();
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        
        const mockError = { response: { data: { message: 'Invalid credentials' } } };
        mockLogin.mockRejectedValueOnce(mockError);

        const button = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(button);

        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
