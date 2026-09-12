import { supabase } from "./supabase";

// Maps a handful of common, expected Supabase Auth error strings to
// friendlier text. Anything NOT in this list (including PGRST/schema
// errors) passes through completely untouched -- those raw messages are
// exactly what's needed to diagnose a missing table/column/RPC, so this
// deliberately never papers over them.
const FRIENDLY_AUTH_ERRORS = {
  "Invalid login credentials": "Incorrect email or password.",
  "User already registered": "An account with that email already exists. Try logging in instead.",
  "Email not confirmed": "Please confirm your email before logging in (check your inbox).",
  "Password should be at least 6 characters": "Password must be at least 6 characters.",
};

function cleanError(error) {
  // Always log the raw error -- this is what you actually want visible in
  // the browser console while diagnosing schema/RLS/RPC issues.
  console.error("[Supabase error]", error);
  const message = FRIENDLY_AUTH_ERRORS[error?.message] || error?.message || "Something went wrong";
  throw new Error(message);
}

async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Please log in again.");
  return data.user;
}

async function getUserId() {
  const user = await getAuthUser();
  return user.id;
}

export const api = {
  signup: async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim(), avatar: "🧙" } }
    });
    if (error) cleanError(error);
    return data;
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) cleanError(error);
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) cleanError(error);
  },

  me: async () => {
    const authUser = await getAuthUser();

    // maybeSingle() returns { data: null, error: null } for zero rows,
    // instead of single()'s PGRST116 error -- this lets us tell "row is
    // genuinely missing" apart from "a real DB error happened" cleanly.
    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) cleanError(error);

    if (!data) {
      // Self-heal: the signup trigger (handle_new_user) should always
      // create this row, but if it ever didn't fire -- an account created
      // before the trigger existed, a trigger error that was swallowed,
      // etc. -- a fully authenticated user would otherwise be stuck being
      // treated as "logged out" forever with no way to recover. RLS's
      // "auth.uid() = id" check policy permits this insert because we're
      // only ever writing our own row.
      const insertResult = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Adventurer",
          email: authUser.email,
          avatar: authUser.user_metadata?.avatar || "🧙"
        })
        .select()
        .single();

      if (insertResult.error) cleanError(insertResult.error);
      data = insertResult.data;
    }

    return { ...data, progression: progression(data.xp) };
  },

  tasks: async () => {
    const id = await getUserId();
    const { data, error } = await supabase.from("tasks")
      .select("*").eq("user_id", id).order("created_at", { ascending: false });
    if (error) cleanError(error);
    return data || [];
  },

  createTask: async ({ title, category, description = "", rewardXp = 50 }) => {
    const id = await getUserId();
    const xp = Math.max(10, Math.min(500, Number(rewardXp) || 50));
    const gold = Math.max(5, Math.round(xp * 0.2));

    const { data, error } = await supabase.from("tasks").insert({
      user_id: id,
      title: title.trim(),
      category,
      description: description.trim(),
      reward_xp: xp,
      reward_gold: gold,
      attribute_gain: 1
    }).select().single();

    if (error) cleanError(error);
    return data;
  },

  completeTask: async (taskId) => {
    const { data, error } = await supabase.rpc("complete_quest", { p_task_id: taskId });
    if (error) cleanError(error);

    const result = data;
    return {
      user: { ...result.user, progression: progression(result.user.xp) },
      reward: result.reward
    };
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) cleanError(error);
    return { message: "Quest deleted" };
  },

  shop: async () => {
    const id = await getUserId();
    const { data, error } = await supabase
      .from("shop_items")
      .select("*, inventory!left(id,user_id,item_id)")
      .order("id");

    if (error) cleanError(error);

    return (data || []).map(item => ({
      ...item,
      owned: (item.inventory || []).some(x => x.user_id === id)
    }));
  },

  buy: async (id) => {
    const { data, error } = await supabase.rpc("buy_shop_item", { p_item_id: id });
    if (error) cleanError(error);
    return data;
  },

  profile: async () => {
    const id = await getUserId();

    const [{ data: user, error: userError },
           { data: completed, error: completedError },
           { data: inventory, error: inventoryError }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("tasks").select("id,title,category,reward_xp,reward_gold,completed_at")
        .eq("user_id", id).eq("status", "completed").order("completed_at", { ascending: false }).limit(10),
      supabase.from("inventory").select("id,shop_items(id,name,description,price,type,icon)")
        .eq("user_id", id).order("purchased_at", { ascending: false })
    ]);

    if (userError) cleanError(userError);
    if (completedError) cleanError(completedError);
    if (inventoryError) cleanError(inventoryError);

    return {
      user: { ...user, progression: progression(user.xp) },
      completed: completed || [],
      inventory: (inventory || []).map(x => x.shop_items).filter(Boolean)
    };
  }
};

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function progression(xp) {
  const level = levelFromXp(xp);
  const start = Math.pow(level - 1, 2) * 100;
  const next = Math.pow(level, 2) * 100;
  return {
    level,
    currentXp: xp - start,
    neededXp: next - start,
    percent: Math.min(100, Math.round(((xp - start) / (next - start)) * 100))
  };
}
