export function Loading({ label }: { label: string }) {
  return <div className="loading" role="status"><span className="loading__spinner" />{label}</div>;
}
