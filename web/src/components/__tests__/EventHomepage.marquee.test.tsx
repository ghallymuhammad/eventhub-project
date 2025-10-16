import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventHomepage from '../EventHomepage';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock API
jest.mock('@/libs/api', () => ({
  api: {
    events: {
      getAll: jest.fn().mockResolvedValue({
        data: {
          success: true,
          events: [],
          total: 0
        }
      })
    }
  }
}));

describe('EventHomepage Marquee', () => {
  test('renders marquee section', async () => {
    render(<EventHomepage />);
    
    // Check if the marquee section title is present
    expect(screen.getByText('🎉 Featured Events & Announcements')).toBeInTheDocument();
  });

  test('shows fallback announcements when no featured events', async () => {
    render(<EventHomepage />);
    
    // Wait for component to load and check for fallback announcements
    await screen.findByText(/New music events added every week!/);
    expect(screen.getByText(/Tech conferences coming soon/)).toBeInTheDocument();
  });
});
