import { useNavigate } from 'react-router-dom';

// Link used by the converted design screens. App paths navigate in-app; other targets are plain links.
export function DLink({ href = '#', children, ...rest }) {
  const nav = useNavigate();
  const internal = href.startsWith('/');
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        if (internal) {
          e.preventDefault();
          nav(href);
        }
      }}
    >
      {children}
    </a>
  );
}

export default DLink;
