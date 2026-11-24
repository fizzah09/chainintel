// Renders one design page exactly as published (public/design/project/<name>.dc.html).
export function DesignPage({ name }) {
  return <iframe title={name} src={`/design/project/${name}.dc.html`}
    style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#fff' }} />;
}

export default DesignPage;
