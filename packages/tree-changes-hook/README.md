# tree-changes-hook

[![NPM version](https://badge.fury.io/js/tree-changes-hook.svg)](https://www.npmjs.com/package/tree-changes-hook) [![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) [![Maintainability](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/maintainability)](https://codeclimate.com/github/gilbarbara/tree-changes/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/test_coverage)](https://codeclimate.com/github/gilbarbara/tree-changes/test_coverage)

React hook that uses [tree-changes](https://github.com/gilbarbara/tree-changes/tree/master/packages/tree-changes) to compare changes between two datasets.

## Setup

```bash
npm install tree-changes-hook
```

## Usage

```typescript
import React from 'react';
import useTreeChanges from 'tree-changes-hook';

function App(props) {
  const { changed } = useTreeChanges(props);

  React.useEffect(() => {
    if (changed('hasData', true)) {
    	sendAnalyticsEvent('load', 'MySuperPage');
  	}
  });

  return <div>...</div>;
}
```

> It's safe to run all the methods with a `useEffect` without dependencies but it works with them too.

## API

Please refer to [tree-changes](https://github.com/gilbarbara/tree-changes/tree/master/packages/tree-changes) README for detailed usage.

## License

MIT
