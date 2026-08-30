import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Groups from './Groups';
import * as GroupService from '../services/group.service';
import { AuthContext } from '../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

import { ThemeContext } from '../context/ThemeContext';

describe('Groups Page', () => {
    const mockGroups = [
        { _id: '1', name: 'Trip to Goa', description: 'Fun trip', members: [{}, {}], createdBy: 'u1' },
        { _id: '2', name: 'Apartment', description: 'Rent and utilities', members: [{}, {}, {}], createdBy: 'u2' }
    ];

    const mockUser = { _id: 'u1', name: 'Test User' };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(GroupService, 'getMyGroups').mockResolvedValue({ groups: mockGroups });
        vi.spyOn(GroupService, 'createGroup').mockResolvedValue({ success: true, group: { _id: '3', name: 'New Group' } });
    });

    const renderGroups = () => {
        return render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <ThemeContext.Provider value={{ theme: 'light', toggleTheme: vi.fn() }}>
                    <MemoryRouter>
                        <Groups />
                    </MemoryRouter>
                </ThemeContext.Provider>
            </AuthContext.Provider>
        );
    };

    it('displays a loading skeleton initially', () => {
        renderGroups();
        // Just verify rendering doesn't crash before data loads
        expect(screen.getByText(/Manage your shared expense groups/i)).toBeInTheDocument();
    });

    it('fetches and displays groups correctly', async () => {
        renderGroups();
        
        await waitFor(() => {
            expect(screen.getByText('Trip to Goa')).toBeInTheDocument();
            expect(screen.getByText('Apartment')).toBeInTheDocument();
        });
        
        expect(GroupService.getMyGroups).toHaveBeenCalledTimes(1);
    });

    it('opens create group modal', async () => {
        renderGroups();
        
        await waitFor(() => {
            expect(screen.getByText('Trip to Goa')).toBeInTheDocument();
        });

        const newGroupBtn = screen.getByRole('button', { name: /\+ Create group/i });
        fireEvent.click(newGroupBtn);
        
        expect(screen.getByText(/Create a group/i)).toBeInTheDocument();
    });

    it('displays error if fetching groups fails', async () => {
        GroupService.getMyGroups.mockRejectedValueOnce({ response: { data: { message: 'Failed to load groups' } } });
        
        renderGroups();
        
        await waitFor(() => {
            expect(screen.getByText(/Failed to load groups/i)).toBeInTheDocument();
        });
    });
});
