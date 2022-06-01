/* eslint-disable no-console */
import React from 'react';
import { Box, Button, H1, H2, Paragraph, Spacer, Tag } from '@gilbarbara/components';
import useTreeChanges from 'tree-changes-hook';

interface State {
  count: number;
  isActive: boolean;
  isReady: boolean;
  milestones: number[];
}

function App() {
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
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (changed('isActive', true)) {
      setState(s => ({ ...s, isReady: true }));
      console.log('changed:isActive');
    }

    if (changed('count', 3)) {
      setState(s => ({ ...s, milestones: [...s.milestones, 3] }));
      console.log('changed:count:3');
    }

    if (added('milestones', 3)) {
      console.log('added:milestone:3');
    }

    if (filled('milestones')) {
      console.log('filled:milestones');
    }

    if (changed('count', 6)) {
      setState(s => ({ ...s, milestones: [...s.milestones, 6] }));
      console.log('changed:count:6');
    }

    if (added('milestones', 6)) {
      console.log('added:milestone:6');
    }

    if (changed('count', 9)) {
      setState(s => ({ ...s, milestones: [...s.milestones, 9] }));
      console.log('changed:count:6');
    }

    if (changed('count', 10)) {
      setState(s => ({ ...s, milestones: [], count: 0 }));
      console.log('changed:count:9');
    }

    if (added('milestones', 9)) {
      console.log('added:milestone:9');
    }

    if (removed('milestones', 6)) {
      console.log('removed:milestones');
    }

    if (emptied('milestones')) {
      console.log('emptied:milestones');
    }
  }, [added, changed, emptied, filled, removed, state]);

  const handleClickCount = () => {
    setState(s => ({ ...s, count: s.count + 1 }));
  };

  return (
    <Box minHeight="100vh" pt="lg" textAlign="center">
      <H1>tree-changes-hook</H1>

      {state.isReady ? (
        <Button onClick={handleClickCount}>
          {state.count === 9 ? 'Reset' : `Clicked ${state.count} times`}
        </Button>
      ) : (
        <Paragraph>loading...</Paragraph>
      )}

      {!!state.milestones.length && (
        <Box mt="md">
          <H2>Milestones:</H2>
          <Spacer distribution="center">
            {state.milestones.map(d => (
              <Tag key={d} shade="mid">
                {d}
              </Tag>
            ))}
          </Spacer>
        </Box>
      )}
    </Box>
  );
}

export default App;
