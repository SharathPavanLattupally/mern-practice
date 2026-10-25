
export default function Card({ title, description, icon = "✦" }) {
  return (
    <article className="card">
      <div className="card-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
