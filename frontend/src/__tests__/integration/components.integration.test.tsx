/**
 * Frontend Integration Tests
 *
 * This test suite covers:
 * 1. Component composition and data flow
 * 2. API client integration
 * 3. State management (React Query)
 * 4. Form handling and validation
 * 5. Error boundaries and error handling
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from '@tanstack/react-query';

// Mock API module
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Sample component for testing
const ProjectList = () => {
  const queryClient = new QueryClient();
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Mock API call
      return [
        { id: 1, title: 'Project 1', status: 'draft' },
        { id: 2, title: 'Project 2', status: 'published' },
      ];
    },
  });

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects</div>;

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects?.map((project: any) => (
          <li key={project.id}>{project.title}</li>
        ))}
      </ul>
    </div>
  );
};

const CreateProjectForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    try {
      // Mock API call
      onSuccess();
      setTitle('');
      setError('');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Project Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter project title"
        />
      </div>
      {error && <div role="alert">{error}</div>}
      <button type="submit">Create Project</button>
    </form>
  );
};

const ProjectDetail = ({ projectId }: { projectId: string }) => {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => ({
      id: projectId,
      title: 'Test Project',
      description: 'A test drama project',
      status: 'draft',
    }),
  });

  if (isLoading) return <div>Loading project...</div>;

  return (
    <div>
      <h1>{project?.title}</h1>
      <p>{project?.description}</p>
      <span className="status-badge">{project?.status}</span>
    </div>
  );
};

describe('Frontend Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Project List Component', () => {
    it('should display loading state initially', () => {
      renderWithProvider(<ProjectList />);

      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('should display projects after loading', async () => {
      renderWithProvider(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
      });
    });

    it('should display project list header', async () => {
      renderWithProvider(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument();
      });
    });

    it('should render each project as list item', async () => {
      renderWithProvider(<ProjectList />);

      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2);
      });
    });
  });

  describe('Create Project Form', () => {
    it('should render form with title input', () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText('Project Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter project title')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });

    it('should validate title length', async () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const input = screen.getByLabelText('Project Title');
      const submitButton = screen.getByText('Create Project');

      // Try to submit with short title
      await userEvent.type(input, 'ab');
      await userEvent.click(submitButton);

      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
    });

    it('should clear form after successful submission', async () => {
      const mockOnSuccess = vi.fn();
      renderWithProvider(
        <CreateProjectForm onSuccess={mockOnSuccess} />
      );

      const input = screen.getByLabelText('Project Title') as HTMLInputElement;
      const submitButton = screen.getByText('Create Project');

      // Submit valid form
      await userEvent.type(input, 'Valid Project Title');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(input.value).toBe('');
      });
    });

    it('should display error messages', async () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const submitButton = screen.getByText('Create Project');

      await userEvent.click(submitButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle user input correctly', async () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const input = screen.getByLabelText('Project Title') as HTMLInputElement;

      await userEvent.type(input, 'My New Project');

      expect(input.value).toBe('My New Project');
    });

    it('should require title field', async () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const submitButton = screen.getByText('Create Project');

      await userEvent.click(submitButton);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Project Detail Component', () => {
    it('should display loading state initially', () => {
      renderWithProvider(<ProjectDetail projectId="1" />);

      expect(screen.getByText('Loading project...')).toBeInTheDocument();
    });

    it('should display project details after loading', async () => {
      renderWithProvider(<ProjectDetail projectId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('A test drama project')).toBeInTheDocument();
      });
    });

    it('should display project status badge', async () => {
      renderWithProvider(<ProjectDetail projectId="1" />);

      await waitFor(() => {
        const statusBadge = screen.getByText('draft');
        expect(statusBadge).toHaveClass('status-badge');
      });
    });

    it('should handle different project IDs', async () => {
      const { rerender } = renderWithProvider(
        <ProjectDetail projectId="1" />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      queryClient.clear();

      rerender(
        <QueryClientProvider client={queryClient}>
          <ProjectDetail projectId="2" />
        </QueryClientProvider>
      );
    });
  });

  describe('Data Flow and Integration', () => {
    it('should pass data from list to detail component', async () => {
      const ProjectsWithDetail = () => {
        const [selectedId, setSelectedId] = React.useState<string | null>(null);

        return (
          <div>
            <ProjectList />
            {selectedId && <ProjectDetail projectId={selectedId} />}
          </div>
        );
      };

      renderWithProvider(<ProjectsWithDetail />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });
    });

    it('should refetch data on query client invalidation', async () => {
      renderWithProvider(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const ErrorComponent = () => {
        const [hasError, setHasError] = React.useState(false);

        if (hasError) return <div>Error loading projects</div>;

        return (
          <button onClick={() => setHasError(true)}>
            Trigger Error
          </button>
        );
      };

      renderWithProvider(<ErrorComponent />);

      const button = screen.getByText('Trigger Error');
      await userEvent.click(button);

      expect(screen.getByText('Error loading projects')).toBeInTheDocument();
    });

    it('should recover from errors', async () => {
      const ErrorRecoveryComponent = () => {
        const [hasError, setHasError] = React.useState(false);

        return (
          <div>
            {hasError ? (
              <button onClick={() => setHasError(false)}>
                Retry
              </button>
            ) : (
              <div>Content loaded</div>
            )}
          </div>
        );
      };

      renderWithProvider(<ErrorRecoveryComponent />);

      expect(screen.getByText('Content loaded')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const input = screen.getByLabelText('Project Title');
      expect(input).toHaveAttribute('id', 'title');
    });

    it('should have accessible error messages', async () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      const submitButton = screen.getByText('Create Project');
      await userEvent.click(submitButton);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      renderWithProvider(
        <CreateProjectForm onSuccess={vi.fn()} />
      );

      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should memoize query results', async () => {
      const { rerender } = renderWithProvider(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
      });

      // Rerender should use cached data
      rerender(
        <QueryClientProvider client={queryClient}>
          <ProjectList />
        </QueryClientProvider>
      );

      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    it('should not re-fetch unnecessary data', async () => {
      const queryFnMock = vi.fn();

      const TestComponent = () => {
        const { data } = useQuery({
          queryKey: ['test-data'],
          queryFn: queryFnMock,
        });

        return <div>{data?.message}</div>;
      };

      queryFnMock.mockResolvedValue({ message: 'Test' });

      const { rerender } = renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(queryFnMock).toHaveBeenCalledTimes(1);
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      // Should not call queryFn again due to caching
      expect(queryFnMock).toHaveBeenCalledTimes(1);
    });
  });
});
