import { useNavigate } from 'react-router-dom';

// Link used by the converted design screens. App paths navigate in-app; other targets are plain links.
export function DLink({ href = '#', children, onClick, ...rest }) {
  const nav = useNavigate();
  const internal = href.startsWith('/');
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        // A screen's own handler runs first; calling preventDefault there blocks the navigation.
        if (onClick) onClick(e);
        if (internal && !e.defaultPrevented) {
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
