import '@testing-library/jest-dom';
process.env.DATABASE_URL ||= 'postgresql://tabseed:tabseed@localhost:5432/tabseed';

// Ensure React global is available for classic JSX transforms in tests
 
// @ts-expect-error augment global for test runtime
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React;
