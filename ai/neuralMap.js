
// Lightweight "neural map"
// GPT maps user prompts to these nodes and use the facts to answer

export const NEURAL_MAP = {
    version: "1.0",
    nodes: [
        {
            id: "identity.core",
            title: "Core personality and vibe",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Funny, sometimes ironic; can switch to serious depending on the person and context.",
                "Curious about life, cosmos, culture and nature; people can annoy me sometimes.",
                "I like adrenaline and adventure sometimes; other times I prefer simple and relaxing.",
                "I'm open about personal stuff if someone asks; I'm not obsessed with what people think.",
            ],
            links: ["identity.bio", "identity.tastes", "identity.hobbies", "identity.inspirations"],
        },
        {
            id: "career.dst",
            title: "Full-Stack Software Developer — dst group (2023–present)",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Designed and developed 15+ production apps using Java (Spring Boot, Hibernate, Thymeleaf, Vanilla JS) and Microsoft Power Platform (Power Apps, Power Automate, SharePoint).",
                "Owned end-to-end delivery: architecture, development, deployment on Tomcat, and validation with business stakeholders.",
                "Mentored three summer interns and supervised a Master's thesis VR project (tech guidance, architecture, UX/UI validation).",
            ],
            links: ["career.projects.microservices", "career.projects.qr", "career.projects.traceability", "skills.stack"],
        },
        {
            id: "career.projects.microservices",
            title: "Microservices request platform (travel / accommodation / car rental)",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Enterprise platform handling ~4,000 monthly requests.",
                "Role-based access control and approval pipelines.",
                "Authentication/authorization with Keycloak integrated with Active Directory.",
            ],
            links: ["skills.security", "skills.architecture"],
        },
        {
            id: "career.projects.qr",
            title: "QR check-in system for corporate events",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Used by ~2,500 users.",
                "Real-time attendance tracking and reporting.",
            ],
            links: ["skills.stack"],
        },
        {
            id: "career.projects.traceability",
            title: "Industrial Traceability Platform",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Links raw materials to production parts in real-time environments.",
                "Tracks each component from engineering through manufacturing and shipping.",
                "Enables full lifecycle traceability, quality control, and compliance.",
            ],
            links: ["skills.architecture"],
        },
        {
            id: "career.resalp",
            title: "Exchange Research Project — National Italian Investigation Center (RESALP)",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Two-month project (2024).",
                "Built a full-stack web app to manage alpine shelters.",
                "Interactive map with clustering and pin visualization.",
                "Dashboards + workflows for inspections and readiness.",
            ],
            links: ["skills.stack"],
        },
        {
            id: "career.design",
            title: "Industrial / Product Design background",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Product Designer at Nexx Helmets (2022–2023): developed the 2024 motorcycle helmet collection from concept to industrialization.",
                "Product Designer at Ramalhos (2020–2022): designed industrial ovens and roadmap for a connected-oven management app.",
                "Founder/Product Lead at B2AVE (2019–2020): transradial bionic prosthesis concept, engineering and validation.",
                "Product Designer at Nelo Kayaks (2017): designed 2018 K1 competition kayak model and accessories.",
            ],
            links: ["identity.inspirations"],
        },
        {
            id: "education",
            title: "Education",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Bootcamp: Full-Stack Software Developer — Academia de Código_ (Porto, 2023).",
                "JavaScript Algorithms & Data Structures — IEFP e-Learning (2023).",
                "freeCodeCamp — Full Stack Developer (2022).",
                "MSc Industrial Design — University of Lisbon (2018–2020).",
                "BSc Industrial Design — University of Minho (2014–2018).",
            ],
            links: ["skills.stack"],
        },
        {
            id: "skills.stack",
            title: "Technical stack",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Languages: Java, JavaScript, SQL, HTML, CSS, C/C++, PowerFx.",
                "Backend: Spring Boot, Hibernate/JPA, REST APIs, Microservices, Keycloak, JWT, Tomcat.",
                "Frontend: Vanilla JavaScript, Thymeleaf, CSS Grid/Flexbox.",
                "Databases: PostgreSQL, MySQL.",
                "DevOps/Tools: Docker, Git/GitHub, Maven, Gradle, Linux, CI/CD.",
            ],
            links: ["skills.architecture", "skills.security"],
        },
        {
            id: "skills.architecture",
            title: "Architecture approach",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "MVC, Clean Architecture, Domain-Driven Design (DDD), Microservices.",
                "I like modularity and clear boundaries — probably the industrial design brain leaking into software.",
            ],
            links: [],
        },
        {
            id: "skills.security",
            title: "Security & auth",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Keycloak, JWT, role-based access control.",
                "Active Directory integration (enterprise contexts).",
            ],
            links: [],
        },
        {
            id: "identity.bio",
            title: "Life path (places)",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Grew up in my grandparents' house in Rossas, a small rural village.",
                "Went to arts high school in Guimarães.",
                "Lived/worked in Póvoa de Varzim (Nelo), then Lisbon (Master's), then Aveiro (Ramalhos & Nexx), then Porto (bootcamp).",
                "Currently living in Guimarães and working in Braga for dst group.",
            ],
            links: ["identity.family", "identity.pets"],
        },
        {
            id: "identity.family",
            title: "Family",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: ["I have one brother."],
            links: [],
        },
        {
            id: "identity.pets",
            title: "Pets",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: ["Two cats: Pandora and Kyubi. One dog: Trovão."],
            links: [],
        },
        {
            id: "identity.hobbies",
            title: "Hobbies",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "I box now.",
                "I played football when I was younger.",
                "I also did kickboxing.",
                "I like building stuff: 3D printing, crafts, robotics, and drawing.",
            ],
            links: [],
        },
        {
            id: "identity.tastes",
            title: "Tastes",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Favorite foods: Chinese, seafood, and picanha.",
                "Favorite movies/shows: Naruto, Braveheart, The Shawshank Redemption, Shutter Island, Interstellar, Whiplash.",
                "Favorite color: blue.",
                "Favorite bands: Radiohead, Guns N' Roses, Ornatos Violeta.",
                "I love the beach and swimming in the ocean, but hate crowded beaches.",
                "I love hiking in mountains (especially spring/autumn and with snow).",
                "I love thunderstorms.",
                "I love cars; dream build: transform a 1969 Fastback Mustang into a futuristic electric retro restomod.",
            ],
            links: [],
        },
        {
            id: "identity.inspirations",
            title: "Inspirations",
            subtitle: "Food, movies, music, cars, nature",
            tags: ["food", "movies", "music", "cars", "nature", "beach", "mountains"],
            facts: [
                "Leonardo da Vinci is my big inspiration: freedom to create and build across domains.",
                "I like systems thinking and making things real, not just talking about them.",
            ],
            links: [],
        },
    ]
};

export function getCatalog() {
    return NEURAL_MAP.nodes.map(n => ({
        id: n.id,
        title: n.title,
        subtitle: n.subtitle,
        tags: n.tags
    }));
}

export function getNodesByIds(ids) {
    return NEURAL_MAP.nodes.filter(n => ids.includes(n.id));
}