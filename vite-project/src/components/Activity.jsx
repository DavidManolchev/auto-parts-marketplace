import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useActivity } from "../hooks/useActivity";
import { useAuth } from "../store";
import "../activity.css";

const MAX = 500;

export default function Activity({ listingId }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { comments, likes, status, reload, addComment, deleteComment, toggleLike } = useActivity(listingId, user);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action, message) => {
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch {
      setError(message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return setError("Write a comment before posting.");
    if (await run(() => addComment(body), "Couldn't post your comment. Try again.")) setText("");
  };

  if (status.loading) return <p className="count" role="status">Loading comments…</p>;
  if (status.error)
    return (
      <div className="empty" role="alert">
        <p>{status.error}</p>
        <button className="btn btn-outline" onClick={reload}>Try again</button>
      </div>
    );

  return (
    <section className="activity" aria-labelledby="activity-title">
      <div className="activity-head">
        <h2 id="activity-title">Comments ({comments.length})</h2>
        {user ? (
          <button
            type="button"
            className={`btn btn-outline like ${likes.mine ? "on" : ""}`}
            aria-pressed={likes.mine}
            disabled={busy}
            onClick={() => run(toggleLike, "Couldn't update your like. Try again.")}
          >
            {likes.mine ? "Liked" : "Like"} · {likes.count}
          </button>
        ) : (
          <span className="like-count">{likes.count} {likes.count === 1 ? "like" : "likes"}</span>
        )}
      </div>

      {comments.length === 0 ? (
        <p className="no-comments">No comments yet.</p>
      ) : (
        <ul className="comments">
          {comments.map((c) => (
            <li key={c.id}>
              <div className="comment-meta">
                <strong>{c.author_name || "User"}</strong>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                {user?.id === c.owner_id && (
                  <button
                    type="button"
                    className="link-btn"
                    disabled={busy}
                    onClick={() => run(() => deleteComment(c.id), "Couldn't delete your comment. Try again.")}
                    aria-label="Delete your comment"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <label>
            Add a comment
            <textarea value={text} maxLength={MAX} rows={3} onChange={(e) => setText(e.target.value)} />
          </label>
          <span className="hint">{text.length}/{MAX}</span>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Posting…" : "Post comment"}</button>
        </form>
      ) : (
        <p><Link to="/login" state={{ from: pathname }}>Log in</Link> to like or comment.</p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
