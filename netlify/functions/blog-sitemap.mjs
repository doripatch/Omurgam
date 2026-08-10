const UPSTREAM =
  "https://nfgtnnypcfcnjnezwhbe.supabase.co/functions/v1/blog-sitemap";

export default async () => {
  try {
    const response = await fetch(UPSTREAM, {
      headers: {
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.error(
        `Supabase sitemap returned ${response.status} ${response.statusText}`,
      );

      return new Response("Unable to load sitemap.", {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const xml = await response.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Blog sitemap proxy failed:", error);

    return new Response("Unable to load sitemap.", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
};

export const config = {
  path: "/blog-sitemap.xml",
  method: "GET",
};