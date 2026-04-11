import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from "./kv_store.tsx";
import { seedDatabase } from "./seed.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey", "X-User-Token"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// OPTIONS preflight
app.options("*", (c) => c.text("", 204));

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
      const videos = await kv.getByPrefix("video_");
      videoCount = videos?.length || 0;
      const users = await kv.getByPrefix("user_");
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
    console.log("🌱 Environment check:");
    console.log("  - SUPABASE_URL:", Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING');
    console.log("  - SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING');
    
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error("❌ Seed error:", error);
    return c.json({ 
      success: false, 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    }, 500);
  }
});

// Direct seed endpoint (no auth required) - for initial setup
app.get("/seed-direct", async (c) => {
  try {
    console.log("🌱 DIRECT SEED - Starting database seed (NO AUTH)...");
    console.log("🌱 Environment check:");
    console.log("  - SUPABASE_URL:", Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING');
    console.log("  - SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING');
    
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error("❌ Direct seed error:", error);
    return c.json({ 
      success: false, 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    }, 500);
  }
});

// Seed test endpoint (simple version for debugging)
app.get("/seed-test", async (c) => {
  console.log("🧪 Seed test endpoint called!");
  return c.json({ 
    success: true,
    message: "Seed test endpoint is working!",
    timestamp: new Date().toISOString(),
    environment: {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING',
    }
  });
});

// SPECIAL ENDPOINT: Create Ceyhan Utlu admin user
app.get("/create-ceyhan", async (c) => {
  try {
    console.log("👤 Creating CEYHAN UTLU admin user...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // STEP 1: Try to find existing user and DELETE it
    console.log("🔍 Searching for existing Ceyhan user...");
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users) {
      const existingCeyhan = users.find(u => u.email === "ceyhan.utlu@omurgam.com");
      if (existingCeyhan) {
        console.log("🗑️ Found existing user, deleting:", existingCeyhan.id);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingCeyhan.id);
        if (deleteError) {
          console.error("⚠️ Delete error:", deleteError);
        } else {
          console.log("✅ Old user deleted!");
          // Also delete from KV store
          try {
            await kv.del(`user_${existingCeyhan.id}`);
            console.log("✅ Deleted from KV store");
          } catch (kvErr) {
            console.error("⚠️ KV delete error:", kvErr);
          }
        }
      } else {
        console.log("ℹ️ No existing Ceyhan user found");
      }
    }

    // STEP 2: Create fresh Ceyhan user
    console.log("🆕 Creating NEW Ceyhan user...");
    const { data: ceyhanUser, error: ceyhanError } = await supabase.auth.admin.createUser({
      email: "ceyhan.utlu@omurgam.com",
      password: "ceyhan123",
      user_metadata: { name: "Ceyhan Utlu", role: "admin" },
      email_confirm: true
    });

    console.log("🔍 Creation result:");
    console.log("  - User:", ceyhanUser);
    console.log("  - Error:", ceyhanError);

    if (ceyhanError) {
      throw ceyhanError;
    }

    if (!ceyhanUser?.user) {
      throw new Error("User creation failed - no user returned");
    }

    // STEP 3: Save to KV store
    console.log("💾 Saving to KV store...");
    await kv.set(`user_${ceyhanUser.user.id}`, {
      id: ceyhanUser.user.id,
      email: ceyhanUser.user.email,
      name: "Ceyhan Utlu",
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log("✅ Ceyhan Utlu created successfully!");
    console.log("  - User ID:", ceyhanUser.user.id);
    console.log("  - Email:", ceyhanUser.user.email);
    console.log("  - Metadata:", ceyhanUser.user.user_metadata);

    return c.json({
      success: true,
      message: "Ceyhan Utlu admin user created!",
      user: {
        id: ceyhanUser.user.id,
        email: ceyhanUser.user.email,
        name: "Ceyhan Utlu",
        role: "admin",
        metadata: ceyhanUser.user.user_metadata
      },
      credentials: {
        email: "ceyhan.utlu@omurgam.com",
        password: "ceyhan123"
      }
    });

  } catch (error) {
    console.error("❌ Ceyhan creation error:", error);
    return c.json({ 
      success: false, 
      error: error.message,
      details: error.toString(),
      stack: error.stack
    }, 500);
  }
});

// Reset admin users - DELETE ALL AND RECREATE
app.post("/reset-admins", async (c) => {
  try {
    console.log("🔄 RESETTING ADMIN USERS...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    const adminUsers = [
      {
        email: "defne.kayautlu@omurgam.com",
        password: "defne123",
        name: "Prof. Dr. Defne Kaya Utlu",
        role: "admin"
      },
      {
        email: "dorukhan.sayim@omurgam.com",
        password: "dorukhan123",
        name: "Dorukhan Sayım",
        role: "admin"
      },
      {
        email: "ceyhan.utlu@omurgam.com",
        password: "ceyhan123",
        name: "Ceyhan Utlu",
        role: "admin"
      }
    ];
    
    const results = [];
    
    for (const admin of adminUsers) {
      console.log(`\n📧 Processing ${admin.email}...`);
      
      // Step 1: Try to find existing user
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error("❌ List users error:", listError);
        results.push({ email: admin.email, status: "error", error: listError.message });
        continue;
      }
      
      const existingUser = users?.find(u => u.email?.toLowerCase() === admin.email.toLowerCase());
      
      // Step 2: If user exists, DELETE them
      if (existingUser) {
        console.log(`🗑️ Deleting existing user: ${existingUser.id}`);
        
        try {
          await supabase.auth.admin.deleteUser(existingUser.id);
          console.log(`✅ Deleted from Supabase Auth`);
        } catch (deleteError) {
          console.error(`⚠️ Delete error:`, deleteError);
        }
        
        try {
          await kv.del(`user_${existingUser.id}`);
          console.log(`✅ Deleted from KV store`);
        } catch (kvDeleteError) {
          console.error(`⚠️ KV delete error:`, kvDeleteError);
        }
        
        // Wait a bit for deletion to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Step 3: Create new user
      console.log(`➕ Creating fresh user: ${admin.email}`);
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        user_metadata: { name: admin.name, role: admin.role },
        email_confirm: true
      });
      
      if (authError) {
        console.error(`❌ Create error:`, authError);
        results.push({ 
          email: admin.email, 
          status: "error", 
          error: authError.message 
        });
        continue;
      }
      
      console.log(`✅ Auth user created: ${authData.user.id}`);
      
      // Step 4: Save to KV store
      const userData = {
        id: authData.user.id,
        email: authData.user.email,
        name: admin.name,
        role: admin.role,
        createdAt: new Date().toISOString(),
      };
      
      await kv.set(`user_${authData.user.id}`, userData);
      console.log(`✅ User data stored in KV with role: ${admin.role}`);
      
      results.push({
        email: admin.email,
        status: "success",
        userId: authData.user.id,
        role: admin.role
      });
    }
    
    console.log("\n🎉 ADMIN RESET COMPLETE!");
    console.log("Results:", results);
    
    return c.json({
      success: true,
      message: "Admin users reset successfully!",
      results: results
    });
    
  } catch (error) {
    console.error("❌ Reset admins error:", error);
    return c.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, 500);
  }
});

// ========================================
// AUTH ENDPOINTS
// ========================================

// Sign in endpoint - NEW!
app.post("/signin", async (c) => {
  try {
    console.log("🔐 Signin request received...");
    
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    console.log("📧 Email:", email);
    
    // Create Supabase client for authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: authError.message }, 401);
    }
    
    if (!authData.session || !authData.user) {
      return c.json({ error: "No session returned from login" }, 401);
    }
    
    console.log("✅ User authenticated:", authData.user.id);
    
    // Get user data from KV store
    console.log("📦 Fetching user data from KV store...");
    let userData = await kv.get(`user_${authData.user.id}`);
    
    if (!userData) {
      console.log("⚠️ User not in KV store, creating...");
      // Create user data if not exists
      userData = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || authData.user.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user_${authData.user.id}`, userData);
      console.log("✅ Created new user data:", userData);
    }
    
    console.log("✅ Signin successful, returning user data and session");
    
    return c.json({ 
      success: true,
      user: userData,
      session: authData.session,
    });
    
  } catch (error) {
    console.error("❌ Signin error:", error);
    return c.json({ 
      error: "Signin failed",
      details: error.message 
    }, 500);
  }
});

// Sign up endpoint
app.post("/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    console.log("📝 Signup request for:", email);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Check if email is an admin email
    const adminEmails = [
      "admin@omurgam.com",
      "defne.kayautlu@omurgam.com", 
      "dorukhan.sayim@omurgam.com",
      "ceyhan.utlu@omurgam.com"
    ];
    
    const isAdmin = adminEmails.includes(email.toLowerCase());
    const role = isAdmin ? 'admin' : 'user';

    console.log(`👤 Creating user with role: ${role}`);

    // Try to create user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0], role },
      email_confirm: true  // Auto-confirm email
    });

    if (authError) {
      console.error("❌ Auth error:", authError);
      
      // If user already exists, update their info instead
      if (authError.message.includes("already") || authError.message.includes("duplicate") || authError.code === "email_exists") {
        console.log("⚠️ User already exists, updating user info...");
        
        try {
          // Get existing user by email
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          
          if (listError) {
            console.error("❌ List users error:", listError);
            return c.json({ error: "Kullanıcı bilgileri güncellenemedi" }, 500);
          }
          
          const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
          
          if (!existingUser) {
            return c.json({ error: "Kullanıcı bulunamadı" }, 404);
          }
          
          console.log("🔄 Found existing user, updating...");
          
          // Update user with new password and confirm email
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: password,
              email_confirm: true,
              user_metadata: { name: name || email.split('@')[0], role }
            }
          );
          
          if (updateError) {
            console.error("❌ Update error:", updateError);
            return c.json({ error: "Kullanıcı güncellenemedi: " + updateError.message }, 500);
          }
          
          console.log("✅ User updated successfully!");
          
          // Update KV store
          try {
            const userData = {
              id: existingUser.id,
              email: existingUser.email,
              name: name || email.split('@')[0],
              role: role,
              updatedAt: new Date().toISOString(),
            };

            await kv.set(`user_${existingUser.id}`, userData);
            console.log(`✅ User data updated in KV with role: ${role}`);
          } catch (kvError) {
            console.error("⚠️ KV store error (non-critical):", kvError);
          }
          
          return c.json({
            success: true,
            message: "Kullanıcı bilgileri güncellendi. Şimdi giriş yapabilirsiniz!",
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: name || email.split('@')[0],
              role: role,
            },
          });
          
        } catch (updateErr: any) {
          console.error("❌ Update process error:", updateErr);
          return c.json({ error: "Güncelleme hatası: " + updateErr.message }, 500);
        }
      }
      
      return c.json({ error: authError.message }, 400);
    }

    console.log("✅ Auth user created:", authData.user?.id);

    // Store user in KV
    if (authData?.user) {
      try {
        const userData = {
          id: authData.user.id,
          email: authData.user.email,
          name: name || email.split('@')[0],
          role: role,
          createdAt: new Date().toISOString(),
        };

        await kv.set(`user_${authData.user.id}`, userData);
        console.log(`✅ User data stored in KV with role: ${role}`);
      } catch (kvError) {
        console.error("⚠️ KV store error (non-critical):", kvError);
        // Continue even if KV fails - auth is more important
      }
    }

    return c.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        role: role,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return c.json({ error: error.message || "Kayıt sırasında bir hata oluştu" }, 500);
  }
});

// Get session endpoint
app.get("/session", async (c) => {
  try {
    console.log("🔍 Session check request...");
    
    // Check for token in X-User-Token header (new approach) or Authorization header (fallback)
    let accessToken = c.req.header("X-User-Token");
    
    if (!accessToken) {
      const authHeader = c.req.header("Authorization");
      console.log("📋 Auth header:", authHeader?.substring(0, 50) + '...');
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }
    
    if (!accessToken) {
      console.log("❌ No token provided");
      return c.json({ user: null, session: null });
    }
    
    console.log("🔑 Access token (first 30 chars):", accessToken?.substring(0, 30) + '...');
    console.log("🔑 Access token length:", accessToken?.length);
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("🔧 Environment check:");
    console.log("  - SUPABASE_URL:", supabaseUrl ? 'SET' : 'MISSING');
    console.log("  - SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? `SET (${supabaseServiceKey.length} chars)` : 'MISSING');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing environment variables");
      return c.json({ 
        error: "Server configuration error",
        details: "Missing SUPABASE environment variables"
      }, 500);
    }
    
    // Create Supabase Admin client with SERVICE_ROLE_KEY
    // This allows us to verify any valid JWT token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verify token and get user using Admin API
    console.log("🔍 Verifying token with Supabase Admin API...");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError) {
      console.log("❌ Auth error from Supabase:", authError.message);
      console.log("❌ Full auth error:", JSON.stringify(authError, null, 2));
      return c.json({ 
        error: "Invalid token",
        details: authError.message 
      }, 401);
    }
    
    if (!user) {
      console.log("❌ No user returned from Supabase");
      return c.json({ 
        error: "Invalid token",
        details: "No user found" 
      }, 401);
    }
    
    console.log("✅ Valid session for user:", user.id);
    console.log("📋 User email:", user.email);
    
    // Get user data from KV store
    console.log("📦 Fetching user data from KV store...");
    const userData = await kv.get(`user_${user.id}`);
    
    if (!userData) {
      console.log("⚠️ User not in KV store, creating...");
      // Create user data if not exists
      const newUserData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user_${user.id}`, newUserData);
      console.log("✅ Created new user data:", newUserData);
      return c.json({ 
        user: newUserData,
        session: { access_token: accessToken }
      });
    }
    
    console.log("✅ Returning user data:", userData);
    return c.json({ 
      user: userData,
      session: { access_token: accessToken }
    });
  } catch (error) {
    console.error("❌ Session endpoint error:", error);
    console.error("❌ Error stack:", error.stack);
    return c.json({ 
      error: "Session check failed",
      details: error.message 
    }, 500);
  }
});

// ========================================
// SITE SETTINGS ENDPOINTS
// ========================================

// Get site settings
app.get("/site-settings", async (c) => {
  try {
    console.log("📖 Fetching site settings...");
    const settings = await kv.get("site_settings");
    
    if (!settings) {
      // Return default settings if not found
      const defaultSettings = {
        siteName: "Omurgam",
        siteTagline: "Prof. Dr. Defne Kaya Utlu",
        logoText: "Omurgam",
        email: "info@omurgam.com",
        phone: "+90 (212) 123 45 67",
        address: "İstanbul, Türkiye",
        instagram: "https://www.instagram.com",
        youtube: "https://www.youtube.com",
        linkedin: "https://www.linkedin.com",
        facebook: "",
        twitter: "",
        heroTitle: "Omurga Sağlığınız İçin Bilimsel Rehber",
        heroSubtitle: "Prof. Dr. Defne Kaya Utlu ile Omurga Sağlığı",
        heroDescription: "Bilimsel bilgi ve eğitici içeriklerle omurga sağlığınızı koruyun",
        aboutTitle: "Prof. Dr. Defne Kaya Utlu",
        aboutContent: "Fizik Tedavi ve Rehabilitasyon Uzmanı",
        footerAbout: "Omurga sağlığınız hakkında bilimsel bilgiler ve eğitici içerikler. Prof. Dr. Defne Kaya Utlu'nun bilgilendirme forumu.",
        footerDisclaimer: "Bu site bilgilendirme amaçlıdır. Tanı ve tedavi için mutlaka bir uzmana danışın.",
        footerCopyright: "© 2026 Omurgam. Tüm hakları saklıdır.",
        privacyPolicy: "",
        termsOfService: "",
        metaDescription: "Omurga sağlığı hakkında bilimsel bilgiler ve eğitici içerikler",
        metaKeywords: "omurga, bel ağrısı, boyun ağrısı, fizyoterapi",
      };
      
      // Save default settings
      await kv.set("site_settings", defaultSettings);
      return c.json(defaultSettings);
    }
    
    return c.json(settings);
  } catch (error) {
    console.error("❌ Error fetching site settings:", error);
    return c.json({ 
      error: "Failed to fetch site settings",
      details: error.message 
    }, 500);
  }
});

// Update site settings
app.put("/site-settings", async (c) => {
  try {
    console.log("💾 Updating site settings...");
    
    // Get user token from X-User-Token header (NOT from Authorization - that's the API key)
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      console.error("❌ No user token found in X-User-Token header");
      return c.json({ error: "Unauthorized: No user token provided" }, 401);
    }
    
    console.log("🔑 User token found (first 30 chars):", userToken.substring(0, 30) + "...");
    
    // Verify user is admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    
    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
    
    console.log("✅ User authenticated:", user.email);
    
    // Get user role from KV store
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') {
      console.error("❌ User is not admin. Role:", userData?.role);
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }
    
    console.log("✅ User is admin, proceeding with update...");
    
    // Get request body
    const updates = await c.req.json();
    console.log("📝 Updates received:", Object.keys(updates));
    
    // Get current settings
    const currentSettings = await kv.get("site_settings") || {};
    
    // Merge with updates
    const newSettings = { ...currentSettings, ...updates };
    
    // Save to KV store
    await kv.set("site_settings", newSettings);
    
    console.log("✅ Site settings updated successfully");
    return c.json(newSettings);
  } catch (error) {
    console.error("❌ Error updating site settings:", error);
    return c.json({ 
      error: "Failed to update site settings",
      details: error.message 
    }, 500);
  }
});

// ========================================
// VIDEO ENDPOINTS
// ========================================

// Get all videos
app.get("/videos", async (c) => {
  try {
    console.log("📹 Fetching all videos...");
    const videos = await kv.getByPrefix("video_");
    console.log(`📹 Found ${videos?.length || 0} videos`);
    return c.json({ videos: videos || [] });
  } catch (error) {
    console.error("❌ Error fetching videos:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    return c.json({ 
      error: "Failed to fetch videos", 
      details: error.message,
      stack: error.stack 
    }, 500);
  }
});

// Get video by ID
app.get("/videos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`📹 Fetching video ${id}...`);
    const video = await kv.get(`video_${id}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    return c.json(video);
  } catch (error) {
    console.error("❌ Error fetching video:", error);
    return c.json({ error: "Failed to fetch video", details: error.message }, 500);
  }
});

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoUrl: string): string | null => {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) return null;
  
  // Use maxresdefault for highest quality, fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Create video (admin only)
app.post("/videos", async (c) => {
  try {
    console.log("📹 Creating video...");

    // Get user token from X-User-Token header
    const userToken = c.req.header("X-User-Token");

    if (!userToken) {
      console.error("❌ No user token found in X-User-Token header");
      return c.json({ error: "Unauthorized: No user token provided" }, 401);
    }

    console.log("🔑 User token found (first 30 chars):", userToken.substring(0, 30) + "...");

    // Verify user is admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    console.log("✅ User authenticated:", user.email);

    // Get user role from KV store
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') {
      console.error("❌ User is not admin. Role:", userData?.role);
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    console.log("✅ User is admin, proceeding with video creation...");

    const body = await c.req.json();
    const id = crypto.randomUUID();
    
    // Auto-extract thumbnail from YouTube URL if not provided
    let thumbnailUrl = body.thumbnailUrl;
    if (!thumbnailUrl && body.videoUrl) {
      const autoThumbnail = getYouTubeThumbnail(body.videoUrl);
      if (autoThumbnail) {
        thumbnailUrl = autoThumbnail;
        console.log(`📸 Auto-extracted thumbnail: ${autoThumbnail}`);
      }
    }
    
    const video = {
      id,
      ...body,
      thumbnailUrl,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video_${id}`, video);
    console.log("✅ Video created:", id);
    return c.json(video);
  } catch (error) {
    console.error("❌ Error creating video:", error);
    return c.json({ error: "Failed to create video", details: error.message }, 500);
  }
});

// Update video (admin only)
app.put("/videos/:id", async (c) => {
  try {
    console.log("📹 Updating video...");

    // Get user token from X-User-Token header
    const userToken = c.req.header("X-User-Token");

    if (!userToken) {
      console.error("❌ No user token found in X-User-Token header");
      return c.json({ error: "Unauthorized: No user token provided" }, 401);
    }

    // Verify user is admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    // Get user role from KV store
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') {
      console.error("❌ User is not admin. Role:", userData?.role);
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    console.log("✅ User is admin, proceeding with video update...");

    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`video_${id}`);
    
    if (!existing) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    // Auto-extract thumbnail from YouTube URL if videoUrl changed and thumbnail not provided
    let thumbnailUrl = body.thumbnailUrl;
    if (!thumbnailUrl && body.videoUrl && body.videoUrl !== existing.videoUrl) {
      const autoThumbnail = getYouTubeThumbnail(body.videoUrl);
      if (autoThumbnail) {
        thumbnailUrl = autoThumbnail;
        console.log(`📸 Auto-extracted thumbnail on update: ${autoThumbnail}`);
      }
    }
    
    const updated = {
      ...existing,
      ...body,
      ...(thumbnailUrl && { thumbnailUrl }),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video_${id}`, updated);
    console.log("✅ Video updated:", id);
    return c.json(updated);
  } catch (error) {
    console.error("❌ Error updating video:", error);
    return c.json({ error: "Failed to update video", details: error.message }, 500);
  }
});

// Delete video (admin only)
app.delete("/videos/:id", async (c) => {
  try {
    console.log("📹 Deleting video...");

    // Get user token from X-User-Token header
    const userToken = c.req.header("X-User-Token");

    if (!userToken) {
      console.error("❌ No user token found in X-User-Token header");
      return c.json({ error: "Unauthorized: No user token provided" }, 401);
    }

    // Verify user is admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    // Get user role from KV store
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') {
      console.error("❌ User is not admin. Role:", userData?.role);
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    console.log("✅ User is admin, proceeding with video deletion...");

    const id = c.req.param("id");
    await kv.del(`video_${id}`);
    console.log("✅ Video deleted:", id);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting video:", error);
    return c.json({ error: "Failed to delete video", details: error.message }, 500);
  }
});

// Increment video views
app.post("/videos/:id/view", async (c) => {
  try {
    const id = c.req.param("id");
    const video = await kv.get(`video_${id}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    video.views = (video.views || 0) + 1;
    await kv.set(`video_${id}`, video);
    
    return c.json({ views: video.views });
  } catch (error) {
    console.error("❌ Error incrementing views:", error);
    return c.json({ error: "Failed to increment views", details: error.message }, 500);
  }
});

// Get video comments
app.get("/videos/:id/comments", async (c) => {
  try {
    const videoId = c.req.param("id");
    const allComments = await kv.getByPrefix("video_comment_");
    const videoComments = (allComments || []).filter((comment: any) => comment.videoId === videoId);
    return c.json({ comments: videoComments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) });
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments", details: error.message }, 500);
  }
});

// Add video comment
app.post("/videos/:id/comments", async (c) => {
  try {
    const videoId = c.req.param("id");
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Verify user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Get user data
    const userData = await kv.get(`user_${user.id}`);
    
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const comment = {
      id,
      videoId,
      userId: user.id,
      userName: userData?.name || user.email?.split('@')[0] || 'Anonim',
      userEmail: user.email,
      text: body.text,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`video_comment_${id}`, comment);
    console.log("✅ Comment added:", id);
    return c.json(comment);
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    return c.json({ error: "Failed to add comment", details: error.message }, 500);
  }
});

// Delete video comment
app.delete("/videos/:videoId/comments/:commentId", async (c) => {
  try {
    const commentId = c.req.param("commentId");
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Verify user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const comment = await kv.get(`video_comment_${commentId}`);
    
    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }
    
    // Check if user owns the comment or is admin
    const userData = await kv.get(`user_${user.id}`);
    if (comment.userId !== user.id && userData?.role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }
    
    await kv.del(`video_comment_${commentId}`);
    console.log("✅ Comment deleted:", commentId);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    return c.json({ error: "Failed to delete comment", details: error.message }, 500);
  }
});

// Like/Unlike video
app.post("/videos/:id/like", async (c) => {
  try {
    const videoId = c.req.param("id");
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Verify user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const likeId = `video_like_${videoId}_${user.id}`;
    const existingLike = await kv.get(likeId);
    
    if (existingLike) {
      // Unlike
      await kv.del(likeId);
      return c.json({ liked: false });
    } else {
      // Like
      await kv.set(likeId, {
        videoId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      return c.json({ liked: true });
    }
  } catch (error) {
    console.error("❌ Error toggling like:", error);
    return c.json({ error: "Failed to toggle like", details: error.message }, 500);
  }
});

// Get video like status
app.get("/videos/:id/like-status", async (c) => {
  try {
    const videoId = c.req.param("id");
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ liked: false, count: 0 });
    }
    
    // Verify user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ liked: false, count: 0 });
    }
    
    const likeId = `video_like_${videoId}_${user.id}`;
    const existingLike = await kv.get(likeId);
    
    // Get total likes
    const allLikes = await kv.getByPrefix(`video_like_${videoId}_`);
    
    return c.json({ 
      liked: !!existingLike,
      count: allLikes?.length || 0
    });
  } catch (error) {
    console.error("❌ Error getting like status:", error);
    return c.json({ liked: false, count: 0 });
  }
});

// ========================================
// QUESTION ENDPOINTS
// ========================================

// Get all questions
app.get("/questions", async (c) => {
  try {
    console.log("❓ Fetching all questions...");
    const questions = await kv.getByPrefix("question_");
    return c.json({ questions: questions || [] });
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    return c.json({ error: "Failed to fetch questions", details: error.message }, 500);
  }
});

// Get question by ID
app.get("/questions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const question = await kv.get(`question_${id}`);
    
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    return c.json(question);
  } catch (error) {
    console.error("❌ Error fetching question:", error);
    return c.json({ error: "Failed to fetch question", details: error.message }, 500);
  }
});

// Create question
app.post("/questions", async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const question = {
      id,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`question_${id}`, question);
    console.log("✅ Question created:", id);
    return c.json(question);
  } catch (error) {
    console.error("❌ Error creating question:", error);
    return c.json({ error: "Failed to create question", details: error.message }, 500);
  }
});

// Update question
app.put("/questions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`question_${id}`);
    
    if (!existing) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`question_${id}`, updated);
    console.log("✅ Question updated:", id);
    return c.json(updated);
  } catch (error) {
    console.error("❌ Error updating question:", error);
    return c.json({ error: "Failed to update question", details: error.message }, 500);
  }
});

// Delete question
app.delete("/questions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`question_${id}`);
    console.log("✅ Question deleted:", id);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting question:", error);
    return c.json({ error: "Failed to delete question", details: error.message }, 500);
  }
});

// Approve question
app.post("/questions/:id/approve", async (c) => {
  try {
    const id = c.req.param("id");
    const question = await kv.get(`question_${id}`);
    
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    question.status = "approved";
    question.updatedAt = new Date().toISOString();
    await kv.set(`question_${id}`, question);
    
    return c.json(question);
  } catch (error) {
    console.error("❌ Error approving question:", error);
    return c.json({ error: "Failed to approve question", details: error.message }, 500);
  }
});

// Answer question
app.post("/questions/:id/answer", async (c) => {
  try {
    const id = c.req.param("id");
    const { answer } = await c.req.json();
    const question = await kv.get(`question_${id}`);
    
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    question.answer = answer;
    question.status = "answered";
    question.updatedAt = new Date().toISOString();
    await kv.set(`question_${id}`, question);
    
    return c.json(question);
  } catch (error) {
    console.error("❌ Error answering question:", error);
    return c.json({ error: "Failed to answer question", details: error.message }, 500);
  }
});

// ========================================
// BLOG ENDPOINTS
// ========================================

// Get all blog posts
app.get("/blog", async (c) => {
  try {
    console.log("📝 Fetching all blog posts...");
    const posts = await kv.getByPrefix("blog_");
    return c.json({ posts: posts || [] });
  } catch (error) {
    console.error("❌ Error fetching blog posts:", error);
    return c.json({ error: "Failed to fetch blog posts", details: error.message }, 500);
  }
});

// Get blog post by ID
app.get("/blog/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(`blog_${id}`);
    
    if (!post) {
      return c.json({ error: "Blog post not found" }, 404);
    }
    
    return c.json(post);
  } catch (error) {
    console.error("❌ Error fetching blog post:", error);
    return c.json({ error: "Failed to fetch blog post", details: error.message }, 500);
  }
});

// Create blog post
app.post("/blog", async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const post = {
      id,
      ...body,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`blog_${id}`, post);
    console.log("✅ Blog post created:", id);
    return c.json(post);
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return c.json({ error: "Failed to create blog post", details: error.message }, 500);
  }
});

// Update blog post
app.put("/blog/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`blog_${id}`);
    
    if (!existing) {
      return c.json({ error: "Blog post not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`blog_${id}`, updated);
    console.log("✅ Blog post updated:", id);
    return c.json(updated);
  } catch (error) {
    console.error("❌ Error updating blog post:", error);
    return c.json({ error: "Failed to update blog post", details: error.message }, 500);
  }
});

// Delete blog post (admin only)
app.delete("/make-server-b69488c3/blog/:id", async (c) => {
  try {
    console.log("📝 Deleting blog post...");

    // Get user token from X-User-Token header
    const userToken = c.req.header("X-User-Token");

    if (!userToken) {
      console.error("❌ No user token found in X-User-Token header");
      return c.json({ error: "Unauthorized: No user token provided" }, 401);
    }

    // Verify user is admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    // Get user role from KV store
    const userData = await kv.get(`user_${user.id}`);
    if (!userData || userData.role !== 'admin') {
      console.error("❌ User is not admin. Role:", userData?.role);
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    console.log("✅ User is admin, proceeding with blog deletion...");

    const id = c.req.param("id");
    await kv.del(`blog_${id}`);
    console.log("✅ Blog post deleted:", id);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting blog post:", error);
    return c.json({ error: "Failed to delete blog post", details: error.message }, 500);
  }
});


// ========================================
// MR TERMS ENDPOINTS
// ========================================

// Get all terms
app.get("/terms", async (c) => {
  try {
    console.log("🧠 Fetching all MR terms...");
    const terms = await kv.getByPrefix("term_");
    return c.json({ terms: terms || [] });
  } catch (error) {
    console.error("❌ Error fetching terms:", error);
    return c.json({ error: "Failed to fetch terms", details: error.message }, 500);
  }
});

// Get term by ID
app.get("/terms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const term = await kv.get(`term_${id}`);
    
    if (!term) {
      return c.json({ error: "Term not found" }, 404);
    }
    
    return c.json(term);
  } catch (error) {
    console.error("❌ Error fetching term:", error);
    return c.json({ error: "Failed to fetch term", details: error.message }, 500);
  }
});

// Create term
app.post("/terms", async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const term = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`term_${id}`, term);
    console.log("✅ Term created:", id);
    return c.json(term);
  } catch (error) {
    console.error("❌ Error creating term:", error);
    return c.json({ error: "Failed to create term", details: error.message }, 500);
  }
});

// Update term
app.put("/terms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`term_${id}`);
    
    if (!existing) {
      return c.json({ error: "Term not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`term_${id}`, updated);
    console.log("✅ Term updated:", id);
    return c.json(updated);
  } catch (error) {
    console.error("❌ Error updating term:", error);
    return c.json({ error: "Failed to update term", details: error.message }, 500);
  }
});

// Delete term
app.delete("/terms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`term_${id}`);
    console.log("✅ Term deleted:", id);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting term:", error);
    return c.json({ error: "Failed to delete term", details: error.message }, 500);
  }
});

// Search terms
app.get("/terms/search", async (c) => {
  try {
    const query = c.req.query("q")?.toLowerCase() || "";
    const allTerms = await kv.getByPrefix("term_");
    
    const filtered = allTerms.filter((term: any) => 
      term.term?.toLowerCase().includes(query) ||
      term.description?.toLowerCase().includes(query)
    );
    
    return c.json({ terms: filtered });
  } catch (error) {
    console.error("❌ Error searching terms:", error);
    return c.json({ error: "Failed to search terms", details: error.message }, 500);
  }
});

// ========================================
// ADMIN ENDPOINTS
// ========================================

// Get all users (admin only)
app.get("/admin/users", async (c) => {
  try {
    console.log("👥 Fetching all users (admin only)...");
    
    // Check for user token
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }
    
    // Verify user with Supabase Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }
    
    // Check if current user is admin (from Supabase user_metadata)
    const currentUserRole = user.user_metadata?.role || 'user';
    
    if (currentUserRole !== 'admin') {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }
    
    // Get all users from Supabase Auth
    console.log("📋 Fetching all users from Supabase Auth...");
    const { data: { users: authUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      return c.json({ error: "Failed to list users", details: listError.message }, 500);
    }
    
    // Transform to expected format
    const users = authUsers.map((authUser: any) => ({
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'user',
      createdAt: authUser.created_at,
    }));
    
    console.log(`✅ Found ${users.length} users from Supabase Auth`);
    return c.json({ users: users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return c.json({ error: "Failed to fetch users", details: error.message }, 500);
  }
});

// Update user role (admin only)
app.put("/admin/users/role", async (c) => {
  try {
    console.log("🔧 Updating user role (admin only)...");
    
    // Check for user token
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }
    
    // Verify user with Supabase Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }
    
    // Check if current user is admin (from Supabase user_metadata)
    const currentUserRole = user.user_metadata?.role || 'user';
    
    if (currentUserRole !== 'admin') {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }
    
    // Get request body
    const { userId, role } = await c.req.json();
    
    if (!userId || !role) {
      return c.json({ error: "Missing userId or role" }, 400);
    }
    
    console.log(`🔄 Updating user ${userId} to role: ${role}`);
    
    // Update user metadata in Supabase Auth
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { 
          role: role,
          // Preserve existing name if it exists
          ...(user.user_metadata?.name && { name: user.user_metadata.name })
        }
      }
    );
    
    if (updateError) {
      console.error("❌ Error updating user in Supabase Auth:", updateError);
      return c.json({ error: "User not found or update failed", details: updateError.message }, 404);
    }
    
    // Also update in KV store if it exists (for backward compatibility)
    try {
      const kvUser = await kv.get(`user_${userId}`);
      if (kvUser) {
        kvUser.role = role;
        kvUser.updatedAt = new Date().toISOString();
        await kv.set(`user_${userId}`, kvUser);
        console.log("✅ Also updated in KV store");
      }
    } catch (kvError) {
      console.log("⚠️ KV update skipped (user not in KV):", kvError);
    }
    
    console.log(`✅ User role updated: ${userId} -> ${role}`);
    
    return c.json({
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      name: updatedUser.user.user_metadata?.name || updatedUser.user.email?.split('@')[0],
      role: role,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    return c.json({ error: "Failed to update user role", details: error.message }, 500);
  }
});

// Delete user (admin only)
app.delete("/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`🗑️ Deleting user ${userId} (admin only)...`);
    
    // Check for user token
    const userToken = c.req.header("X-User-Token");
    
    if (!userToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }
    
    // Verify user with Supabase Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }
    
    // Check if user is admin
    const userData = await kv.get(`user_${user.id}`);
    
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }
    
    // Don't allow deleting yourself
    if (userId === user.id) {
      return c.json({ error: "Cannot delete your own account" }, 400);
    }
    
    // Delete user from KV store
    await kv.del(`user_${userId}`);
    
    // Also delete from Supabase Auth (optional)
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log(`✅ User deleted from Supabase Auth: ${userId}`);
    } catch (deleteError) {
      console.log(`⚠️ Could not delete from Supabase Auth (user may not exist): ${deleteError.message}`);
    }
    
    console.log(`✅ User deleted from KV store: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return c.json({ error: "Failed to delete user", details: error.message }, 500);
  }
});

console.log("🚀 Omurgam server starting - v2.0");

Deno.serve(app.fetch);