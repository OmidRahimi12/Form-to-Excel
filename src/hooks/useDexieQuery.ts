import { liveQuery, type Subscription } from 'dexie';
import { useEffect, useState, type DependencyList } from 'react';

export interface QueryState<T> {
  value: T;
  loading: boolean;
  error: boolean;
}

export function useDexieQuery<T>(query: () => Promise<T>, dependencies: DependencyList, initialValue: T): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ value: initialValue, loading: true, error: false });
  useEffect(() => {
    setState((current) => ({ ...current, loading: true, error: false }));
    const subscription: Subscription = liveQuery(query).subscribe({
      next: (value) => setState({ value, loading: false, error: false }),
      error: () => setState((current) => ({ ...current, loading: false, error: true })),
    });
    return () => subscription.unsubscribe();
    // Queries receive explicit primitive dependencies to control subscription replacement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  return state;
}
