// Revalidate the sitemap periodically so newly published blogs (added via
// the admin console) show up without requiring a redeploy.
export const revalidate = 3600; // seconds

interface ApiBlog {
    slug: string;
    datePublished?: string;
    dateModified?: string;
}

async function fetchBlogs(): Promise<ApiBlog[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs`, {
            next: { revalidate },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

export default async function Sitemap() {
    const domain = 'https://arabicjuniors.com';
    const staticUrls = [
        {
            url: `${domain}`,
            lastModified: new Date(),
        }, {
            url: `${domain}/about-us`,
            lastModified: new Date(),
        }, {
            url: `${domain}/pricing`,
            lastModified: new Date(),
        }, {
            url: `${domain}/blogs`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/careers`,
            lastModified: new Date(),

        }, {
            url: `${domain}/faq`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/contact-us`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/our-teachers`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/register`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/terms-and-conditions`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/privacy-policy`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/teacher-registration`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/academic-support-assistant`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/academic-head`,
            lastModified: new Date(),
        },
        {
            url: `${domain}/academic-teacher`,
            lastModified: new Date(),
        }
    ];

    // Generate blog URLs from the live API so newly published blogs appear
    // without a redeploy
    const blogs = await fetchBlogs();
    const blogUrls = blogs.map((blog) => ({
        url: `${domain}/blogs/${blog.slug}`,
        lastModified: blog.dateModified || blog.datePublished
            ? new Date(blog.dateModified || blog.datePublished!).toISOString()
            : new Date().toISOString(),
    }));


    // Combine all
    const sitemapUrls = [...staticUrls, ...blogUrls];

    return sitemapUrls;
}