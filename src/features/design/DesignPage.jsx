import { SCREENS } from '../designscreens';

// Renders one design screen as a React page (no app shell: the design has its own layout).
export function DesignPage({ name }) {
  const Screen = SCREENS[name];
  if (Screen) return <Screen />;
  return (
    <iframe
      title={name}
      src={`/design/project/${name}.dc.html`}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#fff' }}
    />
  );
}

export default DesignPage;
