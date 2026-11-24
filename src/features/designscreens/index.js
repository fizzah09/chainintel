// Registry of the 101 design screens (converted to React by tools/design_to_jsx.py).
import './base.css';

const modules = import.meta.glob('./*.jsx', { eager: true });

export const SCREENS = Object.fromEntries(
  Object.entries(modules).map(([file, mod]) => [file.replace(/^\.\/|\.jsx$/g, ''), mod.default]),
);

export default SCREENS;
