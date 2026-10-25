import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthCtx = createContext(null);
const ListingsCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export const useListings = () => useContext(ListingsCtx);

const toListing = (r) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  code: r.code,
  category: r.category,
  condition: r.condition,
  price: Number(r.price),
  seller: r.seller_name,
  city: r.city,
  fits: r.fits ?? [],
  images: (r.images ?? []).map(imageUrl),
  imagePaths: r.images ?? [],
  createdAt: r.created_at,
  owner: r.owner_id,
  contact: r.profiles?.contact_email ?? null,
});

const SELECT = "*, profiles(contact_email)";
const BUCKET = "listing-images";
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const imageUrl = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export function AppProviders({ children }) {
  /* ---------- auth ---------- */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const u = session?.user;
  const user = u ? { id: u.id, email: u.email, name: u.user_metadata?.name || u.email.split("@")[0] } : null;

  const signUp = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  };
  const logIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const logout = async () => {
    await supabase.auth.signOut();
  };

  /* ---------- listings ---------- */
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  const reload = useCallback(async () => {
    setStatus({ loading: true, error: "" });
    const { data, error } = await supabase.from("listings").select(SELECT).order("created_at", { ascending: false });
    if (error) return setStatus({ loading: false, error: "Couldn't load listings. Check your connection and try again." });
    setListings(data.map(toListing));
    setStatus({ loading: false, error: "" });
  }, []);

  const userId = user?.id ?? null;
  useEffect(() => {
    reload();
  }, [reload, userId]);

  const uploadFiles = async (files, uploaded) => {
    for (const file of files) {
      const path = `${user.id}/${crypto.randomUUID()}.${EXT[file.type]}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (error) throw error;
      uploaded.push(path);
    }
  };

  const addListing = async (l, files = []) => {
    const uploaded = [];
    try {
      await uploadFiles(files, uploaded);
      const { data, error } = await supabase
        .from("listings")
        .insert({
          kind: l.kind,
          title: l.title,
          code: l.code,
          category: l.category,
          condition: l.condition,
          price: l.price,
          city: l.city,
          fits: l.fits,
          images: uploaded,
          seller_name: user.name,
        })
        .select(SELECT)
        .single();
      if (error) throw error;
      setListings((cur) => [toListing(data), ...cur]);
    } catch (err) {
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      throw err;
    }
  };

  const updateListing = async (id, l, { keep, files }) => {
    const uploaded = [];
    try {
      await uploadFiles(files, uploaded);
      const { data, error } = await supabase
        .from("listings")
        .update({
          title: l.title,
          code: l.code,
          category: l.category,
          condition: l.condition,
          price: l.price,
          city: l.city,
          fits: l.fits,
          images: [...keep, ...uploaded],
        })
        .eq("id", id)
        .select(SELECT)
        .single();
      if (error) throw error;
      const removed = (listings.find((x) => x.id === id)?.imagePaths ?? []).filter((p) => !keep.includes(p));
      if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
      setListings((cur) => cur.map((x) => (x.id === id ? toListing(data) : x)));
    } catch (err) {
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      throw err;
    }
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signUp, logIn, logout }}>
      <ListingsCtx.Provider value={{ listings, status, reload, addListing, updateListing }}>{children}</ListingsCtx.Provider>
    </AuthCtx.Provider>
  );
}
