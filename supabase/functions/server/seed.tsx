/**
 * SEED DATA SCRIPT
 * 
 * Bu dosya ilk admin kullanıcısını ve örnek içerikleri oluşturur.
 * 
 * KULLANIM:
 * 1. Tarayıcıda şu URL'yi ziyaret et:
 *    https://{projectId}.supabase.co/functions/v1/make-server-b69488c3/seed
 * 
 * 2. Admin kullanıcıları:
 *    Email: admin@omurgam.com - Password: admin123
 *    Email: dorukhan.sayim@omurgam.com - Password: dorukhan123
 *    Email: defne.kayautlu@omurgam.com - Password: defne123
 *    Email: ceyhan.utlu@omurgam.com - Password: ceyhan123
 * 
 * 3. Test kullanıcısı (normal user - admin değil):
 *    Email: test@omurgam.com - Password: test123456
 * 
 * 4. Örnek videolar, sorular ve blog yazıları eklenecek
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

export async function seedDatabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Create admin user
    console.log("Creating admin user...");
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@omurgam.com",
      password: "admin123",
      user_metadata: { name: "Admin", role: "admin" },
      email_confirm: true
    });

    if (adminError && !adminError.message.includes("already")) {
      console.error("Admin creation error:", adminError);
      throw adminError;
    }

    if (adminUser?.user) {
      try {
        await kv.set(`user_${adminUser.user.id}`, {
          id: adminUser.user.id,
          email: adminUser.user.email,
          name: "Admin",
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log("✅ Admin user created");
      } catch (kvError) {
        console.error("KV store error for admin user:", kvError);
        // Continue even if KV fails for user - auth is more important
      }
    }

    // 2. Create Dorukhan Sayım admin user
    console.log("Creating Dorukhan Sayım admin user...");
    
    const { data: dorokhanUser, error: dorokhanError } = await supabase.auth.admin.createUser({
      email: "dorukhan.sayim@omurgam.com",
      password: "dorukhan123",
      user_metadata: { name: "Dorukhan Sayım", role: "admin" },
      email_confirm: true
    });

    if (dorokhanError && !dorokhanError.message.includes("already")) {
      console.error("Dorukhan creation error:", dorokhanError);
    } else if (dorokhanUser?.user) {
      try {
        await kv.set(`user_${dorokhanUser.user.id}`, {
          id: dorokhanUser.user.id,
          email: dorokhanUser.user.email,
          name: "Dorukhan Sayım",
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log("✅ Dorukhan Sayım admin user created");
      } catch (kvError) {
        console.error("KV store error for Dorukhan user:", kvError);
      }
    }

    // 3. Create Prof. Dr. Defne Kaya Utlu admin user
    console.log("Creating Prof. Dr. Defne Kaya Utlu admin user...");
    
    const { data: defneUser, error: defneError } = await supabase.auth.admin.createUser({
      email: "defne.kayautlu@omurgam.com",
      password: "defne123",
      user_metadata: { name: "Prof. Dr. Defne Kaya Utlu", role: "admin" },
      email_confirm: true
    });

    if (defneError && !defneError.message.includes("already")) {
      console.error("Defne creation error:", defneError);
    } else if (defneUser?.user) {
      try {
        await kv.set(`user_${defneUser.user.id}`, {
          id: defneUser.user.id,
          email: defneUser.user.email,
          name: "Prof. Dr. Defne Kaya Utlu",
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log("✅ Prof. Dr. Defne Kaya Utlu admin user created");
      } catch (kvError) {
        console.error("KV store error for Defne user:", kvError);
      }
    }

    // 4. Create Ceyhan Utlu admin user
    console.log("Creating Ceyhan Utlu admin user...");
    
    const { data: ceyhanUser, error: ceyhanError } = await supabase.auth.admin.createUser({
      email: "ceyhan.utlu@omurgam.com",
      password: "ceyhan123",
      user_metadata: { name: "Ceyhan Utlu", role: "admin" },
      email_confirm: true
    });

    console.log("🔍 Ceyhan Utlu creation result:");
    console.log("  - User data:", ceyhanUser);
    console.log("  - Error:", ceyhanError);

    if (ceyhanError && !ceyhanError.message.includes("already")) {
      console.error("❌ Ceyhan creation error:", ceyhanError);
      throw ceyhanError; // STOP IF ERROR!
    } else if (ceyhanUser?.user) {
      try {
        await kv.set(`user_${ceyhanUser.user.id}`, {
          id: ceyhanUser.user.id,
          email: ceyhanUser.user.email,
          name: "Ceyhan Utlu",
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log("✅ Ceyhan Utlu admin user created successfully!");
        console.log("  - User ID:", ceyhanUser.user.id);
        console.log("  - Email:", ceyhanUser.user.email);
      } catch (kvError) {
        console.error("❌ KV store error for Ceyhan user:", kvError);
        throw kvError; // STOP IF KV FAILS!
      }
    } else {
      console.log("⚠️ Ceyhan Utlu user already exists or creation skipped");
    }

    // 5. Create TEST USER (normal user)
    console.log("Creating test user...");
    
    const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
      email: "test@omurgam.com",
      password: "test123456",
      user_metadata: { name: "Test Kullanıcı", role: "user" },
      email_confirm: true
    });

    if (testError && !testError.message.includes("already")) {
      console.error("Test user creation error:", testError);
    } else if (testUser?.user) {
      try {
        await kv.set(`user_${testUser.user.id}`, {
          id: testUser.user.id,
          email: testUser.user.email,
          name: "Test Kullanıcı",
          role: 'user',
          createdAt: new Date().toISOString()
        });
        console.log("✅ Test user created (normal user - NOT admin)");
      } catch (kvError) {
        console.error("KV store error for test user:", kvError);
      }
    }

    // NOTE: Sample data removed - admins will add real content via admin panel
    console.log("ℹ️ No sample videos, blog posts, or questions created.");
    console.log("ℹ️ Admins should use the admin panel to add real content.");

    return {
      success: true,
      message: "Database seeded successfully!",
      data: {
        adminEmail: "admin@omurgam.com",
        adminPassword: "admin123",
        testUserEmail: "test@omurgam.com",
        testUserPassword: "test123456",
        videos: 0,
        blogPosts: 0,
        questions: 0
      }
    };

  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  }
}