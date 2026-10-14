import { supabase, isSupabaseConfigured, logAnonymousMetric } from "../lib/supabase";
import { HealthTipHistory } from "../types";

const LOCAL_TIPS_KEY = "health_app_local_tips_history";

export async function recordTipView(
  userId: string,
  tipId: string,
  tipTitle: string,
  category?: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("health_tips_history").insert({
        user_id: userId,
        tip_id: tipId,
        tip_title: tipTitle,
        category: category || "Wellness",
        bookmarked: false,
      });
      await logAnonymousMetric("health_tip_viewed", "info");
      return;
    } catch (e) {
      console.warn("Could not record tip in Supabase:", e);
    }
  }

  // Local fallback
  try {
    const raw = sessionStorage.getItem(LOCAL_TIPS_KEY);
    const list: HealthTipHistory[] = raw ? JSON.parse(raw) : [];
    list.unshift({
      id: "tip-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      tip_id: tipId,
      tip_title: tipTitle,
      category,
      bookmarked: false,
      viewed_at: new Date().toISOString(),
    });
    sessionStorage.setItem(LOCAL_TIPS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}

  await logAnonymousMetric("health_tip_viewed_local", "info");
}

export async function toggleTipBookmark(
  userId: string,
  tipId: string,
  tipTitle: string,
  category?: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from("health_tips_history")
        .select("id, bookmarked")
        .eq("user_id", userId)
        .eq("tip_id", tipId)
        .maybeSingle();

      if (data) {
        const nextState = !data.bookmarked;
        await supabase
          .from("health_tips_history")
          .update({ bookmarked: nextState })
          .eq("id", data.id);
        await logAnonymousMetric("health_tip_bookmark_toggle", "info");
        return nextState;
      } else {
        await supabase.from("health_tips_history").insert({
          user_id: userId,
          tip_id: tipId,
          tip_title: tipTitle,
          category: category || "Wellness",
          bookmarked: true,
        });
        await logAnonymousMetric("health_tip_bookmark_toggle", "info");
        return true;
      }
    } catch (e) {
      console.warn("Bookmark toggle error:", e);
    }
  }

  // Local fallback
  try {
    const raw = sessionStorage.getItem(LOCAL_TIPS_KEY);
    const list: HealthTipHistory[] = raw ? JSON.parse(raw) : [];
    const item = list.find((t) => t.tip_id === tipId && t.user_id === userId);
    let newState = true;
    if (item) {
      item.bookmarked = !item.bookmarked;
      newState = item.bookmarked;
    } else {
      list.unshift({
        id: "tip-" + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        tip_id: tipId,
        tip_title: tipTitle,
        category,
        bookmarked: true,
        viewed_at: new Date().toISOString(),
      });
    }
    sessionStorage.setItem(LOCAL_TIPS_KEY, JSON.stringify(list));
    await logAnonymousMetric("health_tip_bookmark_toggle_local", "info");
    return newState;
  } catch {
    return false;
  }
}

export async function fetchUserTipsHistory(userId: string): Promise<HealthTipHistory[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("health_tips_history")
        .select("*")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: false });

      if (!error && data) {
        return data as HealthTipHistory[];
      }
    } catch (e) {
      console.warn("Error fetching tips history:", e);
    }
  }

  try {
    const raw = sessionStorage.getItem(LOCAL_TIPS_KEY);
    if (raw) {
      const list: HealthTipHistory[] = JSON.parse(raw);
      return list.filter((t) => t.user_id === userId);
    }
  } catch {}

  return [];
}
