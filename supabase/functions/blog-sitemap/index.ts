import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SITE_URL = "https://omurgam.com";

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "\u0026amp;";
      case "<":
        return "\u0026lt;";
      case ">":
        return "\u0026gt;";
      case '"':
        return "\u0026quot;";
      case "'":
        return "\u0026apos;";
      default:
        return char;
    }
  });
}

function validLastMod(post: any): string | null {
  const candidate =
    post?.updatedAt ||
    post?.createdAt ||
    post?.created_at ||
    null;

  if (!candidate) return null;

  const date = new Date(candidate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET",
      },
    });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are missing.");
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data, error } = await supabase
      .from("kv_store_b69488c3")
      .select("value")
      .like("key", "blog:%");

    if (error) {
      throw error;
    }

    const posts = (data ?? [])
      .map((row: any) => row.value)
      .filter(
        (post: any) =>
          post &&
          post.published === true &&
          typeof post.id === "string" &&
          post.id.length > 0,
      );

    const urls = posts.map((post: any) => {
      const loc = `${SITE_URL}/blog/${encodeURIComponent(post.id)}`;
      const lastmod = validLastMod(post);

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        "  </url>",
      ].join("\n");
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      "</urlset>",
      "",
    ].join("\n");

    const xmlBlob = new Blob([xml], {
  type: "application/xml; charset=utf-8",
});

return new Response(xmlBlob, {
  status: 200,
  headers: {
    "Cache-Control": "public, max-age=300",
  },
});
  } catch (error) {
    console.error("Blog sitemap generation failed:", error);

    return new Response("Unable to generate sitemap.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
});
