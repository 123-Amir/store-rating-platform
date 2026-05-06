import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface RouterContextType {
  path: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({ path: '/', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname + window.location.search);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useParams(): Record<string, string> {
  const { path } = useRouter();
  const params: Record<string, string> = {};
  const match = path.match(/\/admin\/users\/([^/]+)/);
  if (match) params.id = match[1];
  return params;
}

export function useQueryParams(): Record<string, string> {
  const { path } = useRouter();
  const params: Record<string, string> = {};
  const searchIndex = path.indexOf('?');
  if (searchIndex >= 0) {
    const search = path.substring(searchIndex + 1);
    for (const pair of search.split('&')) {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return params;
}
