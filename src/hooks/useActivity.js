import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useActivity(listingId, user) {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({ count: 0, mine: false });
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [tick, setTick] = useState(0);
  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, l] = await Promise.all([
        supabase.from("comments").select("*").eq("listing_id", listingId).order("created_at", { ascending: true }),
        supabase.from("likes").select("user_id").eq("listing_id", listingId),
      ]);
      if (cancelled) return;
      if (c.error || l.error)
        return setStatus({ loading: false, error: "Couldn't load comments and likes. Check your connection and try again." });
      setComments(c.data);
      setLikes({ count: l.data.length, mine: l.data.some((x) => x.user_id === userId) });
      setStatus({ loading: false, error: "" });
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId, userId, tick]);

  const reload = () => {
    setStatus({ loading: true, error: "" });
    setTick((t) => t + 1);
  };

  const addComment = async (body) => {
    const { data, error } = await supabase
      .from("comments")
      .insert({ listing_id: listingId, body, author_name: user.name })
      .select()
      .single();
    if (error) throw error;
    setComments((cur) => [...cur, data]);
  };

  const deleteComment = async (id) => {
    const { data, error } = await supabase.from("comments").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("The comment was not deleted.");
    setComments((cur) => cur.filter((c) => c.id !== id));
  };

  const toggleLike = async () => {
    if (likes.mine) {
      const { error } = await supabase.from("likes").delete().eq("listing_id", listingId).eq("user_id", user.id);
      if (error) throw error;
      setLikes((cur) => ({ count: cur.count - 1, mine: false }));
    } else {
      const { error } = await supabase.from("likes").insert({ listing_id: listingId });
      if (error) throw error;
      setLikes((cur) => ({ count: cur.count + 1, mine: true }));
    }
  };

  return { comments, likes, status, reload, addComment, deleteComment, toggleLike };
}
