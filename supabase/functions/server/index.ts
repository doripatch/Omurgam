import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from "./kv_store.tsx";
import { seedDatabase } from "./seed.tsx";

// 🪄 SİHİRLİ DOKUNUŞ: Frontend'den gelen hatalı ID'leri temizleyen kurtarıcı
const cleanId = (id: string | number) => {
  // Frontend'den gelen prefix'leri temizle
  String(id).replace(/^(video:|blog:|question_|term_)/, '');
  return cleaned;
};

// 1. basePath DOĞRU ŞEKİLDE EKLENDİ
const app = new Hono().basePath("/server");

// 2. Log ve Güvenlik Kapısı (CORS) - Bütün kilitler açıldı
app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['*']
}));

// 🧹 HAYALET AVCISI: Geçmişte kalan bozuk videoları temizleme rotası
app.get("/cleanup", async (c) => {
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { error: vErr } = await supabase.from("kv_store_b69488c3").delete().like("key", "video:%");
    const { error: bErr } = await supabase.from("kv_store_b69488c3").delete().like("key", "blog:%");
    if (vErr || bErr) throw new Error("Veritabanı temizlik hatası");
    return c.json({ success: true, message: "🎉 Bütün hayalet videolar ve taslak bloglar kalıcı olarak temizlendi!" });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. İŞTE BİZİM DEDEKTİFİMİZ! (Hangi adresi aradığını arayüze zorla gönderecek)
app.notFound((c) => {
  return c.json({ error: `BULUNDU! Gelen Adres: ${c.req.path}` }, 404);
});

// Health check
app.get("/health", (c) => {
  console.log("✅ Health check called!");
  return c.json({ 
    status: "WORKING", 
    server: "Omurgam Edge Function v2",
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get("/test", (c) => {
  return c.json({ message: "Test endpoint working!" });
});

// Debug endpoint - Check environment and database
app.get("/debug", async (c) => {
  try {
    console.log("🔍 Debug endpoint called");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const envCheck = {
      SUPABASE_URL: supabaseUrl ? `SET: ${supabaseUrl}` : 'MISSING',
      SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ', first 30 chars: ' + supabaseAnonKey.substring(0, 30) + '...)' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'MISSING',
    };
    
    // Try to connect to KV store
    let kvStatus = 'UNKNOWN';
    let videoCount = 0;
    let userCount = 0;
    try {
      const videos = await kv.getByPrefix("video:");
      videoCount = videos?.length || 0;
      const users = await kv.getByPrefix("user:");
      userCount = users?.length || 0;
      kvStatus = 'CONNECTED';
    } catch (error) {
      kvStatus = `ERROR: ${error.message}`;
    }
    
    return c.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      kvStore: {
        status: kvStatus,
        videoCount: videoCount,
        userCount: userCount,
      },
      endpoints: {
        auth: ['/signup', '/signin', '/session'],
        videos: ['/videos', '/videos/:id'],
        questions: ['/questions', '/questions/:id'],
        blog: ['/blog', '/blog/:id'],
        terms: ['/terms', '/terms/:id'],
        admin: ['/admin/users', '/admin/users/role', '/admin/users/:userId'],
        siteSettings: ['/site-settings'],
      }
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    return c.json({
      status: 'ERROR',
      error: error.message,
      stack: error.stack,
    }, 500);
  }
});

// Seed database endpoint
app.get("/seed", async (c) => {
  try {
    console.log("🌱 Starting database seed...");
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error("❌ Seed error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Direct seed endpoint (no auth required) - for initial setup
app.get("/seed-direct", async (c) => {
  try {
    console.log("🌱 DIRECT SEED - Starting database seed (NO AUTH)...");
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error("❌ Direct seed error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Seed test endpoint (simple version for debugging)
app.get("/seed-test", async (c) => {
  return c.json({ success: true, message: "Seed test endpoint is working!" });
});

// SPECIAL ENDPOINT: Create Ceyhan Utlu admin user
app.get("/create-ceyhan", async (c) => {
  try {
    console.log("👤 Creating CEYHAN UTLU admin user...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) throw new Error("Missing environment variables");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users) {
      const existingCeyhan = users.find(u => u.email === "ceyhan.utlu@omurgam.com");
      if (existingCeyhan) {
        await supabase.auth.admin.deleteUser(existingCeyhan.id);
        try { await kv.del(`user_${existingCeyhan.id}`); } catch (e) {}
      }
    }

    const { data: ceyhanUser, error: ceyhanError } = await supabase.auth.admin.createUser({
      email: "ceyhan.utlu@omurgam.com",
      password: "ceyhan123",
      user_metadata: { name: "Ceyhan Utlu", role: "admin" },
      email_confirm: true
    });

    if (ceyhanError) throw ceyhanError;

    await kv.set(`user_${ceyhanUser.user.id}`, {
      id: ceyhanUser.user.id,
      email: ceyhanUser.user.email,
      name: "Ceyhan Utlu",
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: "Ceyhan Utlu admin user created!",
      user: { id: ceyhanUser.user.id, email: ceyhanUser.user.email, name: "Ceyhan Utlu", role: "admin" }
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset admin users - DELETE ALL AND RECREATE
app.post("/reset-admins", async (c) => {
  try {
    console.log("🔄 RESETTING ADMIN USERS...");
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    
    const adminUsers = [
      { email: "defne.kayautlu@omurgam.com", password: "defne123", name: "Prof. Dr. Defne Kaya Utlu", role: "admin" },
      { email: "dorukhan.sayim@omurgam.com", password: "dorukhan123", name: "Dorukhan Sayım", role: "admin" },
      { email: "ceyhan.utlu@omurgam.com", password: "ceyhan123", name: "Ceyhan Utlu", role: "admin" }
    ];
    
    const results = [];
    
    for (const admin of adminUsers) {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find(u => u.email?.toLowerCase() === admin.email.toLowerCase());
      
      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id);
        try { await kv.del(`user_${existingUser.id}`); } catch (e) {}
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email, password: admin.password, user_metadata: { name: admin.name, role: admin.role }, email_confirm: true
      });
      
      if (authError) {
        results.push({ email: admin.email, status: "error", error: authError.message });
        continue;
      }
      
      await kv.set(`user_${authData.user.id}`, {
        id: authData.user.id, email: authData.user.email, name: admin.name, role: admin.role, createdAt: new Date().toISOString(),
      });
      
      results.push({ email: admin.email, status: "success", userId: authData.user.id, role: admin.role });
    }
    
    return c.json({ success: true, message: "Admin users reset successfully!", results });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// AUTH ENDPOINTS
// ========================================

app.post("/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password are required" }, 400);
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) return c.json({ error: authError.message }, 401);
    if (!authData.session || !authData.user) return c.json({ error: "No session returned from login" }, 401);
    
    let userData = await kv.get(`user_${authData.user.id}`);
    if (!userData) {
      userData = {
        id: authData.user.id, email: authData.user.email, name: authData.user.user_metadata?.name || authData.user.email, role: 'user', createdAt: new Date().toISOString(),
      };
      await kv.set(`user_${authData.user.id}`, userData);
    }
    
    return c.json({ success: true, user: userData, session: authData.session });
  } catch (error) {
    return c.json({ error: "Signin failed", details: error.message }, 500);
  }
});

app.post("/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password are required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
    const adminEmails = ["admin@omurgam.com", "defne.kayautlu@omurgam.com", "dorukhan.sayim@omurgam.com", "ceyhan.utlu@omurgam.com"];
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, user_metadata: { name: name || email.split('@')[0], role }, email_confirm: true
    });

    if (authError) {
      if (authError.message.includes("already") || authError.code === "email_exists") {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (!existingUser) return c.json({ error: "Kullanıcı bulunamadı" }, 404);
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: password, email_confirm: true, user_metadata: { name: name || email.split('@')[0], role }
        });
        
        if (updateError) return c.json({ error: "Kullanıcı güncellenemedi: " + updateError.message }, 500);
        
        await kv.set(`user_${existingUser.id}`, {
          id: existingUser.id, email: existingUser.email, name: name || email.split('@')[0], role: role, updatedAt: new Date().toISOString(),
        });
        
        return c.json({ success: true, user: { id: existingUser.id, email: existingUser.email, name: name || email.split('@')[0], role: role } });
      }
      return c.json({ error: authError.message }, 400);
    }

    const userData = { id: authData.user.id, email: authData.user.email, name: name || email.split('@')[0], role: role, createdAt: new Date().toISOString() };
    await kv.set(`user_${authData.user.id}`, userData);

    return c.json({ success: true, user: userData });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get("/session", async (c) => {
  try {
    let accessToken = c.req.header("X-User-Token");
    if (!accessToken) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) accessToken = authHeader.split(" ")[1];
    }
    
    if (!accessToken) return c.json({ user: null, session: null });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) return c.json({ error: "Configuration error" }, 500);
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) return c.json({ error: "Invalid token" }, 401);
    
    let userData = await kv.get(`user_${user.id}`);
    if (!userData) {
      userData = { id: user.id, email: user.email, name: user.user_metadata?.name || user.email, role: 'user', createdAt: new Date().toISOString() };
      await kv.set(`user_${user.id}`, userData);
    }
    
    return c.json({ user: userData, session: { access_token: accessToken } });
  } catch (error) {
    return c.json({ error: "Session check failed" }, 500);
  }
});

// ========================================
// SITE SETTINGS ENDPOINTS
// ========================================

app.get("/site-settings", async (c) => {
  try {
    const settings = await kv.get("site_settings");
    if (!settings) {
      const defaultSettings = {
        siteName: "Omurgam", siteTagline: "Prof. Dr. Defne Kaya Utlu", logoText: "Omurgam",
        email: "info@omurgam.com", phone: "+90 (212) 123 45 67", address: "İstanbul, Türkiye",
        heroTitle: "Omurga Sağlığınız İçin Bilimsel Rehber",
        footerCopyright: "© 2026 Omurgam. Tüm hakları saklıdır.",
      };
      await kv.set("site_settings", defaultSettings);
      return c.json(defaultSettings);
    }
    return c.json(settings);
  } catch (error) {
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

app.put("/site-settings", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);
    
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    const updates = await c.req.json();
    const currentSettings = await kv.get("site_settings") || {};
    const newSettings = { ...currentSettings, ...updates };
    
    await kv.set("site_settings", newSettings);
    return c.json(newSettings);
  } catch (error) {
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// ========================================
// VIDEO ENDPOINTS
// ========================================

app.get("/videos", async (c) => {
  try {
    const videos = await kv.getByPrefix("video:");
    return c.json({ videos: videos || [] });
  } catch (error) {
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
});

app.get("/videos/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const video = await kv.get(`video:${id}`);
    if (!video) return c.json({ error: "Video not found" }, 404);
    return c.json(video);
  } catch (error) {
    return c.json({ error: "Failed to fetch video" }, 500);
  }
});

const extractYouTubeId = (url: string): string | null => {
  const patterns = [/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/, /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/, /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (videoUrl: string): string | null => {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

app.post("/videos", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const body = await c.req.json();
    const id = body.id ? cleanId(body.id) : crypto.randomUUID();
    
    let thumbnailUrl = body.thumbnailUrl;
    if (!thumbnailUrl && body.videoUrl) {
      const autoThumbnail = getYouTubeThumbnail(body.videoUrl);
      if (autoThumbnail) thumbnailUrl = autoThumbnail;
    }
    
    const video = {
      ...body,
      id: id,
      thumbnailUrl,
      views: body.views || 0,
      published: true, // TASLAK SORUNU ÇÖZÜLDÜ
      status: "Yayında",
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${id}`, video);
    return c.json(video);
  } catch (error) {
    return c.json({ error: "Failed to create video" }, 500);
  }
});

app.put("/videos/:id", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    
    const userData = await kv.get(`user_${user?.id}`);
    if (userData?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const id = cleanId(c.req.param("id"));
    const body = await c.req.json();
    const existing = await kv.get(`video:${id}`);
    
    if (!existing) return c.json({ error: "Video not found" }, 404);
    
    let thumbnailUrl = body.thumbnailUrl;
    if (!thumbnailUrl && body.videoUrl && body.videoUrl !== existing.videoUrl) {
      const autoThumbnail = getYouTubeThumbnail(body.videoUrl);
      if (autoThumbnail) thumbnailUrl = autoThumbnail;
    }
    
    const updated = { ...existing, ...body, ...(thumbnailUrl && { thumbnailUrl }), updatedAt: new Date().toISOString() };
    await kv.set(`video:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Failed to update video" }, 500);
  }
});

app.delete("/videos/:id", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    
    const userData = await kv.get(`user_${user?.id}`);
    if (userData?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const id = cleanId(c.req.param("id"));
    await kv.del(`video:${id}`); // COLON kullan!
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete video" }, 500);
  }
});

app.post("/videos/bulk-delete", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized: No user token provided" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);

    const userData = await kv.get(`user_${user?.id}`);
    if (userData?.role !== 'admin') return c.json({ error: "Forbidden: Admin access required" }, 403);

    const { ids } = await c.req.json();
    if (!ids || !Array.isArray(ids)) return c.json({ error: "Geçersiz ID listesi" }, 400);

    // HAYALET SİLİCİ DEVREDE
    await Promise.all(ids.map(id => {
      const actualId = cleanId(typeof id === 'object' && id !== null ? (id.id || id._id || id) : id);
      return kv.del(`video:${actualId}`);
    }));
    
    return c.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    return c.json({ error: "Failed to delete videos" }, 500);
  }
});

app.post("/videos/:id/view", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const video = await kv.get(`video:${id}`);
    if (!video) return c.json({ error: "Video not found" }, 404);
    
    video.views = (video.views || 0) + 1;
    await kv.set(`video:${id}`, video);
    return c.json({ views: video.views });
  } catch (error) {
    return c.json({ error: "Failed to increment views" }, 500);
  }
});

app.get("/videos/:id/comments", async (c) => {
  try {
    const videoId = cleanId(c.req.param("id"));
    const allComments = await kv.getByPrefix("video_comment_");
    const videoComments = (allComments || []).filter((comment: any) => comment.videoId === videoId);
    return c.json({ comments: videoComments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  } catch (error) {
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

app.post("/videos/:id/comments", async (c) => {
  try {
    const videoId = cleanId(c.req.param("id"));
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    
    const userData = await kv.get(`user_${user.id}`);
    const body = await c.req.json();
    const id = crypto.randomUUID();
    
    const comment = {
      id, videoId, userId: user.id, userName: userData?.name || user.email?.split('@')[0] || 'Anonim',
      userEmail: user.email, text: body.text, createdAt: new Date().toISOString(),
    };
    
    await kv.set(`video_comment_${id}`, comment);
    return c.json(comment);
  } catch (error) {
    return c.json({ error: "Failed to add comment" }, 500);
  }
});

app.delete("/videos/:videoId/comments/:commentId", async (c) => {
  try {
    const commentId = cleanId(c.req.param("commentId"));
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    
    const comment = await kv.get(`video_comment_${commentId}`);
    if (!comment) return c.json({ error: "Comment not found" }, 404);
    
    const userData = await kv.get(`user_${user.id}`);
    if (comment.userId !== user.id && userData?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    await kv.del(`video_comment_${commentId}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});

app.post("/videos/:id/like", async (c) => {
  try {
    const videoId = cleanId(c.req.param("id"));
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    
    const likeId = `video_like_${videoId}_${user.id}`;
    const existingLike = await kv.get(likeId);
    
    if (existingLike) {
      await kv.del(likeId);
      return c.json({ liked: false });
    } else {
      await kv.set(likeId, { videoId, userId: user.id, createdAt: new Date().toISOString() });
      return c.json({ liked: true });
    }
  } catch (error) {
    return c.json({ error: "Failed to toggle like" }, 500);
  }
});

app.get("/videos/:id/like-status", async (c) => {
  try {
    const videoId = cleanId(c.req.param("id"));
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ liked: false, count: 0 });
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    if (!user) return c.json({ liked: false, count: 0 });
    
    const likeId = `video_like_${videoId}_${user.id}`;
    const existingLike = await kv.get(likeId);
    const allLikes = await kv.getByPrefix(`video_like_${videoId}_`);
    
    return c.json({ liked: !!existingLike, count: allLikes?.length || 0 });
  } catch (error) {
    return c.json({ liked: false, count: 0 });
  }
});

// ========================================
// QUESTION ENDPOINTS
// ========================================

app.get("/questions", async (c) => {
  try {
    const questions = await kv.getByPrefix("question_");
    return c.json({ questions: questions || [] });
  } catch (error) {
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

app.get("/questions/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const question = await kv.get(`question_${id}`);
    if (!question) return c.json({ error: "Question not found" }, 404);
    return c.json(question);
  } catch (error) {
    return c.json({ error: "Failed to fetch question" }, 500);
  }
});

app.post("/questions", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id ? cleanId(body.id) : crypto.randomUUID();
    const question = { ...body, id, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await kv.set(`question_${id}`, question);
    return c.json(question);
  } catch (error) {
    return c.json({ error: "Failed to create question" }, 500);
  }
});

app.put("/questions/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const body = await c.req.json();
    const existing = await kv.get(`question_${id}`);
    if (!existing) return c.json({ error: "Question not found" }, 404);
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`question_${id}`, updated);
    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Failed to update question" }, 500);
  }
});

app.delete("/questions/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    await kv.del(`question_${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete question" }, 500);
  }
});

app.post("/questions/:id/approve", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const question = await kv.get(`question_${id}`);
    if (!question) return c.json({ error: "Question not found" }, 404);
    
    question.status = "approved";
    question.updatedAt = new Date().toISOString();
    await kv.set(`question_${id}`, question);
    return c.json(question);
  } catch (error) {
    return c.json({ error: "Failed to approve question" }, 500);
  }
});

app.post("/questions/:id/answer", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const { answer } = await c.req.json();
    const question = await kv.get(`question_${id}`);
    if (!question) return c.json({ error: "Question not found" }, 404);
    
    question.answer = answer;
    question.status = "answered";
    question.updatedAt = new Date().toISOString();
    await kv.set(`question_${id}`, question);
    return c.json(question);
  } catch (error) {
    return c.json({ error: "Failed to answer question" }, 500);
  }
});

// ========================================
// BLOG ENDPOINTS
// ========================================

app.get("/blog", async (c) => {
  try {
    const posts = await kv.getByPrefix("blog:");
    return c.json({ posts: posts || [] });
  } catch (error) {
    return c.json({ error: "Failed to fetch blog posts" }, 500);
  }
});

app.get("/blog/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const post = await kv.get(`blog:${id}`);
    if (!post) return c.json({ error: "Blog post not found" }, 404);
    return c.json({ post });
  } catch (error) {
    return c.json({ error: "Failed to fetch blog post" }, 500);
  }
});

app.post("/blog", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id ? cleanId(body.id) : crypto.randomUUID();
    const post = {
      ...body,
      id: id,
      views: body.views || 0,
      published: true, // TASLAK SORUNU ÇÖZÜLDÜ
      status: "Yayında",
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`blog:${id}`, post);
    return c.json(post);
  } catch (error) {
    return c.json({ error: "Failed to create blog post" }, 500);
  }
});

app.put("/blog/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const body = await c.req.json();
    const existing = await kv.get(`blog:${id}`);
    if (!existing) return c.json({ error: "Blog post not found" }, 404);
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`blog:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Failed to update blog post" }, 500);
  }
});

app.delete("/blog/:id", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);
    
    const userData = await kv.get(`user_${user?.id}`);
    if (userData?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const id = cleanId(c.req.param("id"));
    await kv.del(`blog:${id}`); // COLON kullan!
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete blog post" }, 500);
  }
});

app.post("/blog/bulk-delete", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user } } = await supabase.auth.getUser(userToken);

    const userData = await kv.get(`user_${user?.id}`);
    if (userData?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);

    const { ids } = await c.req.json();
    if (!ids || !Array.isArray(ids)) return c.json({ error: "Geçersiz ID listesi" }, 400);

    // HAYALET SİLİCİ DEVREDE
    await Promise.all(ids.map(id => {
      const actualId = cleanId(typeof id === 'object' && id !== null ? (id.id || id._id || id) : id);
      return kv.del(`blog:${actualId}`);
    }));
    
    return c.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    return c.json({ error: "Failed to delete blogs" }, 500);
  }
});

// ========================================
// MR TERMS ENDPOINTS
// ========================================

app.get("/terms", async (c) => {
  try {
    const terms = await kv.getByPrefix("term_");
    return c.json({ terms: terms || [] });
  } catch (error) {
    return c.json({ error: "Failed to fetch terms" }, 500);
  }
});

app.get("/terms/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const term = await kv.get(`term_${id}`);
    if (!term) return c.json({ error: "Term not found" }, 404);
    return c.json(term);
  } catch (error) {
    return c.json({ error: "Failed to fetch term" }, 500);
  }
});

app.post("/terms", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id ? cleanId(body.id) : crypto.randomUUID();
    const term = { ...body, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await kv.set(`term_${id}`, term);
    return c.json(term);
  } catch (error) {
    return c.json({ error: "Failed to create term" }, 500);
  }
});

app.put("/terms/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    const body = await c.req.json();
    const existing = await kv.get(`term_${id}`);
    if (!existing) return c.json({ error: "Term not found" }, 404);
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`term_${id}`, updated);
    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Failed to update term" }, 500);
  }
});

app.delete("/terms/:id", async (c) => {
  try {
    const id = cleanId(c.req.param("id"));
    await kv.del(`term_${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete term" }, 500);
  }
});

app.get("/terms/search", async (c) => {
  try {
    const query = c.req.query("q")?.toLowerCase() || "";
    const allTerms = await kv.getByPrefix("term_");
    const filtered = allTerms.filter((term: any) => term.term?.toLowerCase().includes(query) || term.description?.toLowerCase().includes(query));
    return c.json({ terms: filtered });
  } catch (error) {
    return c.json({ error: "Failed to search terms" }, 500);
  }
});

// ========================================
// ADMIN ENDPOINTS
// ========================================

app.get("/admin/users", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);
    
    if (user.user_metadata?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    const { data: { users: authUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) return c.json({ error: "Failed to list users" }, 500);
    
    const users = authUsers.map((authUser: any) => ({
      id: authUser.id, email: authUser.email, name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'user', createdAt: authUser.created_at,
    }));
    
    return c.json({ users: users });
  } catch (error) {
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

app.put("/admin/users/role", async (c) => {
  try {
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);
    
    if (user.user_metadata?.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    const { userId, role } = await c.req.json();
    if (!userId || !role) return c.json({ error: "Missing parameters" }, 400);
    
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: role, ...(user.user_metadata?.name && { name: user.user_metadata.name }) }
    });
    
    if (updateError) return c.json({ error: "Update failed" }, 404);
    
    try {
      const kvUser = await kv.get(`user_${userId}`);
      if (kvUser) {
        kvUser.role = role;
        kvUser.updatedAt = new Date().toISOString();
        await kv.set(`user_${userId}`, kvUser);
      }
    } catch (e) {}
    
    return c.json({ id: updatedUser.user.id, email: updatedUser.user.email, name: updatedUser.user.user_metadata?.name || updatedUser.user.email?.split('@')[0], role: role, updatedAt: new Date().toISOString() });
  } catch (error) {
    return c.json({ error: "Failed to update role" }, 500);
  }
});

app.delete("/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userToken = c.req.header("X-User-Token");
    if (!userToken) return c.json({ error: "Unauthorized" }, 401);
    
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    if (authError || !user) return c.json({ error: "Unauthorized" }, 401);
    
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    if (userId === user.id) return c.json({ error: "Cannot delete yourself" }, 400);
    
    await kv.del(`user_${userId}`);
    try { await supabaseAdmin.auth.admin.deleteUser(userId); } catch (e) {}
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

console.log("🚀 Omurgam server starting - v2.0 (THE ULTIMATE FIX)");
Deno.serve(app.fetch);