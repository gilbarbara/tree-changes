# tree-changes-hook

[![NPM version](https://badge.fury.io/js/tree-changes-hook.svg)](https://www.npmjs.com/package/tree-changes-hook) [![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara-github_tree-changes-hook&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=gilbarbara-github_tree-changes-hook) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara-github_tree-changes-hook&metric=coverage)](https://sonarcloud.io/summary/new_code?id=gilbarbara-github_tree-changes-hook)

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

> It's safe to run all the methods with a `useEffect` without dependencies, but it works with them too.

## API

Please refer to [tree-changes](https://github.com/gilbarbara/tree-changes/tree/master/packages/tree-changes) README for detailed usage.

## License

MIT
