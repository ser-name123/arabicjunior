export type BlogCategory = "Curriculum" | "Grade" | "Exams" | "Schools";

export interface BlogAction {
    link: string;
    text: string;
}

export interface BlogImage {
    link: string;
    width: number;
    height: number;
    altText: string;
}

export interface IBlog {
    "@type": string;
    title: string;
    slug: string;
    shortDescription: string;
    thumbnail: string;
    category: BlogCategory[];
    action: BlogAction;
    imageDetails: BlogImage;
    author: {
        "@type": string;
        name: string;
        url: string;
    }
    datePublished: string;
    dateModified: string;
    image: string;
}

export const BLOGS: IBlog[] = [
    {
        "@type": "BlogPosting",
        title: "Discover Arabic Learning in UAE: Culture, Curriculum & Confidence",
        slug: "discover-arabic-learning-uae",
        shortDescription: "Explore how Online Arabic Tuition UAE helps students excel in MOE, CBSE, British & IB curricula. Discover the cultural and academic benefits of Arabic learning with certified tutors.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161084/blog-4_a7zhja.png",
        category: ["Curriculum", "Schools", "Exams", "Grade"],
        action: {
            link: "/blogs/discover-arabic-learning-uae",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1738161084/blog-4_a7zhja.png',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161084/blog-4_a7zhja.png",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Arabic for Beginners UAE Online: Getting Started with Grade 1 Students",
        slug: "arabic-for-beginners-uae-online",
        shortDescription: "Arabic for Beginners UAE Online: Grade 1 learning with certified tutors, interactive lessons, and full curriculum alignment for young Arabic learners.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161082/blog-3_oxfubh.png",
        category: ["Grade"],
        action: {
            link: "/blogs/arabic-for-beginners-uae-online",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1738161082/blog-3_oxfubh.png',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161082/blog-3_oxfubh.png",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Getting Started with Arabic Grammar: A Beginner’s Guide for UAE Students",
        slug: "arabic-grammar-basics-uae",
        shortDescription: "Getting Started with Arabic Grammar - A beginner’s guide to Arabic sentence structures, root systems, and grammar rules for UAE students.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045113/school-boy-taking-virtual-classes_bp8fsl.jpg",
        category: ["Schools"],
        action: {
            link: "/blogs/arabic-grammar-basics-uae",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1754045113/school-boy-taking-virtual-classes_bp8fsl.jpg',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045113/school-boy-taking-virtual-classes_bp8fsl.jpg",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Exam Prep Tips: How Arabic Juniors Classes Help Children Excel in School Tests",
        slug: "how-arabic-juniors-classes-help-children",
        shortDescription: "Discover exam prep tips with Arabic Juniors. Weekly tests, MOE curriculum support & certified tutors help UAE students excel in Arabic school exams.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161018/450d30a2e71ff211efe7fc2ef693cd22_txmlzk.png",
        category: ["Exams"],
        action: {
            link: "/blogs/how-arabic-juniors-classes-help-children",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1738161018/450d30a2e71ff211efe7fc2ef693cd22_txmlzk.png',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1738161018/450d30a2e71ff211efe7fc2ef693cd22_txmlzk.png",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Preparing Your Child for a Free Trial Class at Arabic Juniors",
        slug: "preparing-your-child-for-a-free-trial-class",
        shortDescription: "Explore how to prepare your child for a free Arabic trial class at Arabic Juniors. Tips, what to expect, and how we support Grade 1–10 students across UAE curricula.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045112/home-laptop-girl-with-knowledge-online-class_sqejk1.jpg",
        category: ["Grade"],
        action: {
            link: "/blogs/preparing-your-child-for-a-free-trial-class",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1754045112/home-laptop-girl-with-knowledge-online-class_sqejk1.jpg',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045112/home-laptop-girl-with-knowledge-online-class_sqejk1.jpg",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Top 5 Signs Your Child Needs Extra Arabic Support in MOE or CBSE Curriculum",
        slug: "top-5-signs-arabic-support-uae",
        shortDescription: "Top 5 Signs Your Child Needs Extra Arabic Support in MOE or CBSE Curriculum",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045124/schoolboy-Laptop_ii72fw.jpg",
        category: ["Curriculum"],
        action: {
            link: "/blogs/top-5-signs-arabic-support-uae",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1754045124/schoolboy-Laptop_ii72fw.jpg',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045124/schoolboy-Laptop_ii72fw.jpg",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Why Online Arabic Tuition in UAE Is the Smartest Choice for Your Child in 2025",
        slug: "why-online-arabic-tuition-in-uae-Is-the-smartest-choice",
        shortDescription: "Discover why online Arabic tuition in UAE is the best option for your child. Learn about flexible learning, expert tutors, MOE curriculum support, and more.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045123/diverse-children-enjoying-digital-learning-laptops-tablets_neqdol.jpg",
        category: ["Curriculum"],
        action: {
            link: "/blogs/why-online-arabic-tuition-in-uae-Is-the-smartest-choice",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1754045123/diverse-children-enjoying-digital-learning-laptops-tablets_neqdol.jpg',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045123/diverse-children-enjoying-digital-learning-laptops-tablets_neqdol.jpg",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    },
    {
        "@type": "BlogPosting",
        title: "Why Learning Arabic Is Valuable in the UAE and Beyond | Arabic Juniors",
        slug: "why-studying-arabic-is-useful-in-the-uae-and-in-the-world",
        shortDescription: "Discover the educational, career, and cultural advantages of learning Arabic in the UAE. Help your child succeed with Arabic Juniors' immersive language programs.",
        thumbnail: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045119/girl-studying-online-learning_pygrsy.jpg",
        category: ["Curriculum", "Exams", "Grade", "Schools"],
        action: {
            link: "/blogs/why-studying-arabic-is-useful-in-the-uae-and-in-the-world",
            text: "Read More",
        },
        author: {
            "@type": "Person",
            name: "Arabic Juniors",
            url: 'https://arabicjuniors.com'
        },
        datePublished: "2025-07-31T00:00:00+05:30",
        dateModified: "2025-07-31T00:00:00+05:30",
        image: 'https://res.cloudinary.com/dromjx3rx/image/upload/v1754045119/girl-studying-online-learning_pygrsy.jpg',
        imageDetails: {
            link: "https://res.cloudinary.com/dromjx3rx/image/upload/v1754045119/girl-studying-online-learning_pygrsy.jpg",
            width: 1380,
            height: 920,
            altText: "learning with game blog",
        },
    }
];
