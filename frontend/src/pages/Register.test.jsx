import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import * as AuthService from '../services/auth.service';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Register Component', () => {
    let mockRegisterUser;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRegisterUser = vi.spyOn(AuthService, 'registerUser');
    });

    const renderRegister = () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    it('renders register form correctly', () => {
        renderRegister();
        expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows error when name is missing', async () => {
        renderRegister();
        const button = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(button);
        
        expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it('shows error when password is too short', async () => {
        renderRegister();
        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '123' } });
        
        const button = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(button);
        
        expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it('calls register and navigates on success', async () => {
        renderRegister();
        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        mockRegisterUser.mockResolvedValueOnce();

        const button = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('displays error message on registration failure', async () => {
        renderRegister();
        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        const mockError = { response: { data: { message: 'Email already in use' } } };
        mockRegisterUser.mockRejectedValueOnce(mockError);

        const button = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(button);

        expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
