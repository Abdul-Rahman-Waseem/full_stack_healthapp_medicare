// components/StatusBadge.js
export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
