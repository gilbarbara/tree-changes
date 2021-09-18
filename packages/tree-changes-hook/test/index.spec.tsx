import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';

import useTreeChanges from '../src';

jest.useFakeTimers();

const mockState = jest.fn();
const mockRatio = jest.fn();
const mockSize = jest.fn();

interface State {
  count: number;
  isActive: boolean;
  isReady: boolean;
  milestones: number[];
}

function WithState() {
  const [state, setState] = React.useState<State>({
    count: 0,
    isActive: false,
    isReady: false,
    milestones: [],
  });
  const { added, changed, emptied, filled, removed } = useTreeChanges(state);

  React.useEffect(() => {
    setTimeout(() => {
      setState(s => ({ ...s, isActive: true }));
    }, 1500);
  }, []);

  React.useEffect(() => {
    if (changed('isActive', true)) {
      setState(s => ({ ...s, isReady: true }));

      mockState('changes:isActive');
    }

    if (changed('isReady', true)) {
      mockState('changes:isReady');
    }

    if (changed('count', 3)) {
      setState(s => ({ ...s, milestones: [...s.milestones, 3] }));
      mockState('changed:count:3');
    }

    if (added('milestones', 3)) {
      mockState('added:milestone:3');
    }

    if (filled('milestones')) {
      mockState('filled:milestones');
    }

    if (changed('count', 6)) {
      setState(s => ({ ...s, milestones: [...s.milestones, 6] }));
      mockState('changed:count:6');
    }

    if (added('milestones', 6)) {
      mockState('added:milestone:6');
    }

    if (changed('count', 9)) {
      setState(s => ({ ...s, milestones: [] }));
      mockState('changed:count:9');
    }

    if (removed('milestones', 6)) {
      mockState('removed:milestones');
    }

    if (emptied('milestones')) {
      mockState('emptied:milestones');
    }
  }, [added, changed, emptied, filled, removed, state]);

  const handleClickCount = () => {
    setState(s => ({ ...s, count: s.count + 1 }));
  };

  return (
    <div data-testid="app">
      <header>
        <h1>tree-changes</h1>
        <button onClick={handleClickCount} type="button">
          Clicked {state.count} times
        </button>
        {state.isReady ? <p>side-effect is complete</p> : <p>loading...</p>}
      </header>
    </div>
  );
}

function WithProps(props: any) {
  const { changed } = useTreeChanges(props);

  React.useEffect(() => {
    if (changed('ratio')) {
      mockRatio();
    }

    if (changed('size')) {
      mockSize();
    }
  });

  return <div>Update</div>;
}

describe('useTreeChanges', () => {
  afterEach(() => {
    mockSize.mockReset();
    mockRatio.mockReset();
  });

  it('with props', () => {
    const props = { padding: 10, ratio: 1, size: 12 };
    const { rerender } = render(<WithProps {...props} />);

    expect(mockSize).toHaveBeenCalledTimes(0);

    rerender(<WithProps {...props} size={16} />);
    expect(mockSize).toHaveBeenCalledTimes(1);

    rerender(<WithProps {...props} size={16} />);
    expect(mockSize).toHaveBeenCalledTimes(1);

    rerender(<WithProps {...props} />);
    expect(mockSize).toHaveBeenCalledTimes(2);

    rerender(<WithProps {...props} ratio={2} size={15} />);
    expect(mockSize).toHaveBeenCalledTimes(3);

    rerender(<WithProps {...props} size={15} />);
    expect(mockSize).toHaveBeenCalledTimes(3);

    expect(mockRatio).toHaveBeenCalledTimes(2);
  });

  it('with state', async () => {
    render(<WithState />);

    expect(screen.getByTestId('app')).toMatchSnapshot();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockState).toHaveBeenCalledWith('changes:isActive');
    expect(mockState).toHaveBeenCalledWith('changes:isReady');

    expect(screen.getByTestId('app')).toMatchSnapshot();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    expect(mockState).toHaveBeenCalledWith('changed:count:3');
    expect(mockState).toHaveBeenCalledWith('added:milestone:3');
    expect(mockState).toHaveBeenCalledWith('filled:milestones');

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    expect(mockState).toHaveBeenCalledWith('changed:count:6');
    expect(mockState).toHaveBeenCalledWith('added:milestone:6');

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    expect(mockState).toHaveBeenCalledWith('changed:count:9');
    expect(mockState).toHaveBeenCalledWith('removed:milestones');
    expect(mockState).toHaveBeenCalledWith('emptied:milestones');
  });
});
