import '@testing-library/jest-dom';

// Basic ResizeObserver polyfill for jsdom tests (used by Recharts ResponsiveContainer)
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserver;
