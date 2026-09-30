import type {Showcase, Category, Project, ProjectMedia} from "../../generated/prisma/client.js";

type NewShowcaseType = Omit<Showcase, 'id'> & {
    slug: string
}

export const showcaseData: NewShowcaseType[] = [
    {
        name: "Capstone",
        year: 2026,
        semester: 1,
        description: null,
        publishedDate: new Date("2026-11-01"),
        slug: "capstone-2026-1"
    },
    {
        name: "Apple Foundation Program",
        year: 2025,
        semester: 2,
        description: null,
        publishedDate: new Date("2025-07-13"),
        slug: "afp-2025-2"
    },
    {
        name: "Apple Foundation Program",
        year: 2026,
        semester: 1,
        description: null,
        publishedDate: new Date("2026-06-01"),
        slug: "afp-2026-1"
    },
    {
        name: "RMIT Hackathon",
        year: 2026,
        semester: 0,
        description: null,
        publishedDate: new Date("2026-11-1"),
        slug: "rmit-hackathon-2026"
    }
]

type NewCategoryType = Omit<Category, 'id'>
export const categoryData: NewCategoryType[] = [
    {
        name: "Health"
    },
    {
        name: "Education"
    },
    {
        name: "Social Media"
    },
    {
        name: "Workplace"
    },
    {
        name: "Creative"
    },
    {
        name: "Finance"
    },
    {
        name: "News"
    },
    {
        name: "Entertainment"
    },
    {
        name: "Games"
    },
    {
        name: "Photo & Video"
    },
    {
        name: "Business"
    },
    {
        name: "Utilities"
    }
]

type ShowcaseSearch = {
    name: string,
    year: number,
    semester: number,
}

export type NewProjectType = Omit<Project, 'categoryId' | 'showcaseId' | 'order' | 'featured' | 'canBeHero' | 'heroArtUrl'> & {
    categoryNames: string[],
    showcase: ShowcaseSearch,
    slug: string,
    featured?: boolean,
    heroArtUrl?: string

}

export const projectData: NewProjectType[] = [
    // Apple Foundation Program 2025 Sem 2
    {
        id: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        name: "Instagram",
        slug: "instagram",
        description: "# Bringing you closer to the people and things you love – Instagram from Meta\n" +
            "\n" +
            "Connect with friends, share what you're up to or see what's new from others all over the world. Explore our community where you can feel free to be yourself and share everything from your daily moments to life's highlights.\n" +
            "\n" +
            "## Express yourself and connect with friends\n" +
            "\n" +
            "* Add photos and videos to your story that disappear after 24 hours, and bring them to life with fun creative tools.\n" +
            "* Message your friends with Messenger. Share and connect over what you see on feed and Stories.\n" +
            "* Create and discover short, entertaining videos on Instagram with Reels.\n" +
            "* Post photos and videos to your feed that you want to show on your profile.\n" +
            "\n" +
            "## Learn more about your interests\n" +
            "\n" +
            "* Watch videos from your favourite creators and discover new content through Instagram video and Reels.\n" +
            "* Get inspired by photos and videos from new accounts in Explore.\n" +
            "* Discover brands and small businesses, and shop products that are relevant to your personal style.\n" +
            "  Some Instagram features may not be available in your country or region.",
        subtitle: "Videos, Creators & Friends",
        iconUrl: "ad1987aa-6278-4408-b35f-304863998196",
        heroArtUrl: "77272cab-8f1f-4fb1-b021-a8da5fa12fd5",
        developers: ["Frantzisko Monifa", "Earl Sue"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://example.com/",
            "https://github.com/odisfm/hapi"
        ],
        featured: true,
        categoryNames: ["Social Media", "Photo & Video"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        name: "Smart Receipts: Expenses and Tax",
        slug: "smart-receipts",
        description: "# AI-Powered Receipts Scanner & Expense Tracker\n" +
            "\n" +
            "\n" +
            "PDF/CSV Expense Reports. Spend management. Receipts keeper.\n" +
            "\n" +
            "Transform your phone into a powerful receipt scanner, expense tracker, and mileage tracker — all in one app.\n" +
            "Smart Receipts helps individuals, freelancers, and business owners capture every expense, maximise every ATO deduction, and turn tax season from a headache into a few taps.\n" +
            "\n" +
            "## SMART RECEIPTS — YOUR ALL-IN-ONE EXPENSE SOLUTION\n" +
            "\n" +
            "Whether you're managing personal finances or running a small business, Smart Receipts delivers customisable PDF, CSV, and ZIP reports built for real-world accounting. Organise expenses into \"folders,\" categorise spending, and generate professional reports that simplify tax filings, reimbursements, and bookkeeping.\n" +
            "\n" +
            "## KEY FEATURES\n" +
            "\n" +
            "- Powerful receipt scanner with AI-powered OCR — capture every detail in seconds\n" +
            "- Snap photos with your camera or import existing images\n" +
            "- Upload and process PDF receipts effortlessly\n" +
            "- Import your existing CSV files or bank statements in seconds\n" +
            "- Connect your bank account (USA & Canada only) to automatically pull in expenses and transactions\n" +
            "- Track price, tax, currency, and payment method for every purchase\n" +
            "- Tag entries with names, categories, comments, and custom metadata\n" +
            "- Built-in mileage tracker for reimbursement and ATO deduction claims\n" +
            "- Automatic exchange rate calculations for international travel and business trips\n" +
            "- Smart predictions based on past entries — faster reporting every time\n" +
            "- Fully customisable PDF, CSV, and ZIP reports\n" +
            "\n" +
            "## SAVE HOURS EVERY WEEK\n" +
            "\n" +
            "Stop typing expenses into spreadsheets. Smart Receipts eliminates manual data entry by combining a fast receipt scanner, CSV import, and direct bank sync (USA/Canada). Whether you're tracking a single business trip or a year of deductions, your records stay organised and tax-ready.\n" +
            "\n" +
            "## BUILT FOR ACCOUNTING & BOOKKEEPING\n" +
            "\n" +
            "Accountants, bookkeepers, and small business owners trust Smart Receipts to keep clients audit-ready. Export clean, ATO-friendly reports in seconds and spend less time chasing paperwork.\n" +
            "\n" +
            "## YOUR DATA, SECURED\n" +
            "\n" +
            "Smart Receipts protects your sensitive financial information with secure automatic backups to our private cloud and AI-powered OCR for accurate scanning. Your records stay safe, organised, and accessible whenever you need them.\n" +
            "\n" +
            "## JOIN OVER 1,000,000 USERS\n" +
            "\n" +
            "More than a million people trust Smart Receipts as their go-to expense tracker and mileage tracker. Built by a seasoned consultant, the app is designed for efficiency, flexibility, and the realities of modern financial management.\n" +
            "\n" +
            "Download Smart Receipts today and take control of your expenses, deductions, and tax returns.",
        subtitle: "Receipt Scanner, Tracker",
        iconUrl: "ecdd9658-a03d-4eb3-8370-6386fc70d9ee",
        developers: ["Orion Nestan"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/"
        ],
        categoryNames: ["Finance", "Utilities", "Workplace", "Business"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        name: "Substack",
        slug: "substack",
        description: "",
        subtitle: "Videos, writing & Podcasts",
        iconUrl: "261be61a-cb4d-4de4-a9aa-0abf3156493a",
        developers: ["Iouri Bilal", "Sven Ameer"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx",
            "https://example.com/",
            "https://github.com/odisfm/hapi"
        ],
        categoryNames: ["News", "Education", "Entertainment"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: false
    },
    {
        id: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        name: "Patreon",
        slug: "patreon",
        description: "# Exclusive access to your favourite creators and communities from anywhere.\n" +
            "\n" +
            "Patreon is where you can access exclusive podcasts, videos, art, writing, recipes, courses, music and more from your favourite creators, and build community with both the creators you love and other fans.\n" +
            "\n" +
            "When you join a creator’s Patreon, you unlock access to a world of exclusive posts, a community group chat and more. Here’s how you can use the Patreon app to make your experience even better:\n" +
            "\n" +
            "*ACCESS* exclusive work from your favourite creators in seconds, from sneak peeks and bonus episodes to demo tracks and behind-the-scenes looks.\n" +
            "\n" +
            "*JOIN* the conversation in community group chats, where you can engage directly with creators and other fans in an intimate space outside of the comments section.\n" +
            "\n" +
            "*DOWNLOAD* podcasts, music and other audio for easy offline listening.\n" +
            "\n" +
            "*BE* the first to experience the latest releases from creators you love.\n" +
            "\n" +
            "*IMMERSE* yourself in creators’ worlds, where their work is grouped and displayed in easy-to-navigate collections.\n" +
            "\n" +
            "*GET* to know other fans and let other fans get to know you through personalised fan profiles.",
        subtitle: "Exclusive creator communities",
        iconUrl: "e484563e-99e2-4820-bb23-0b0b0aa1adc0",
        developers: ["Nazaire Sa'dia", "Disha Anu", "Olympas Iuppiter"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx"
        ],
        featured: true,
        categoryNames: ["Social Media", "Entertainment"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        name: "DocPlay",
        slug: "docplay",
        description: "Watch a curated collection of the world's most amazing and thought-provoking documentaries. From festival favourites to Oscar™ winners with new titles each and every week - start exploring DocPlay today!\n" +
            "\n" +
            "Premium Membership:\n" +
            "DocPlay Premium is a paid membership that gets you ad-free access to the entire DocPlay catalog in HD.\n",
        subtitle: "The World's Best Documentaries",
        iconUrl: "e3605c03-2a72-4416-a137-79b99a8a6f90",
        developers: ["Yoel Dileep", "Zoila Sara"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://github.com/odisfm/hapi"
        ],
        categoryNames: ["Entertainment", "Education"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        name: "Letterboxd",
        slug: "letterboxd",
        description: "# Letterboxd for iOS puts the popular social network for film lovers on your iPhone or iPad, so you can log films and catch up on your friends’ activity with ease.\n" +
            "\n" +
            "Sign in with your existing account (or create one for free) to enjoy our native app interface. These features of the web experience are supported, with more to come:\n" +
            "\n" +
            "- Sign in (with 1Password support) or create an account\n" +
            "- Browse popular, highly rated and most anticipated films (including our official list of the Top 250 Narrative Features)\n" +
            "- Log films with date, rating, review and tags\n" +
            "- View film info (including cast & crew, popular lists and reviews) and rate, like, watchlist or mark as watched\n" +
            "- View (and filter) your activity feed\n" +
            "- Read and comment on reviews and lists\n" +
            "- Create and edit lists\n" +
            "- View member profiles including films, reviews, diary entries, tags, stats and more\n" +
            "- Follow members to see their activity in your feed\n" +
            "- Filter and sort collections of films based on specific criteria\n" +
            "- Search for films, content and people\n" +
            "- Edit your profile settings",
        subtitle: "The social app for film lovers",
        iconUrl: "68d5dee6-9ede-4d52-a3eb-1c734b87f0d6",
        developers: ["Liss Azize"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://github.com/odisfm/hapi",
            "https://example.com/"
        ],
        categoryNames: ["Social Media", "Creative"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        name: "ABC Listen: Radio & Podcasts",
        slug: "abc-listen",
        description: "# Download the free ABC listen app to take your favourite podcasts, radio & audiobooks with you on the go\n" +
            "\n" +
            "Stream live sport, choose your news, and explore a world of music anywhere, anytime, and all for free!\n" +
            "\n" +
            "## APP FEATURES\n" +
            "\n" +
            "For Kids & Families:\n" +
            "\n" +
            "* All new exclusive episodes of Bluey Listen Along.\n" +
            "* Create sub-profiles for Kids or multiple users.\n" +
            "* Optional Kids lock helps kids stay in a space designed just for them.\n" +
            "* Soundtrack your child’s day with ABC Kids listen podcasts, radio, audiobooks and music – all in one place.\n" +
            "\n" +
            "Live Radio on the Go:\n" +
            "\n" +
            "* Instant access to all ABC local and national stations and radio programs, including ABC Radio National, ABC NEWS, ABC SPORT, ABC Kids listen, Double J, triple j and more.&#x20;\n" +
            "* Tune in to live broadcasts and catch up on what you've missed.&#x20;\n" +
            "* See upcoming programs or recently played music and tracklists&#x20;\n" +
            "* Limited internet coverage? Find the broadcast frequencies for local and national ABC Radio from anywhere in the country.&#x20;\n" +
            "* Hear live, expert and ad-free ABC SPORT coverage of national and international games, including AFL, NRL, cricket, tennis and soccer.&#x20;\n" +
            "\n" +
            "Discover Podcasts & Audiobooks:\n" +
            "\n" +
            "* Dive into a free podcast library with over 200 podcasts and radio programs available at your fingertips.&#x20;\n" +
            "* Explore the free curated audiobook library, updated with new fiction, non-fiction and kids titles for readers of all ages.&#x20;\n" +
            "* Exclusive ABC Timeless Audiobooks giving classic titles a fresh take by a new generation of Australian voices.&#x20;\n" +
            "\n" +
            "Stay informed with Daily News and Sports:&#x20;\n" +
            "- Stay up to date with essential news streams delivered in under 5 minutes.&#x20;\n" +
            "- Go more in-depth with daily news briefings, covering local updates to global happenings.\n" +
            "\n" +
            "Tailored Music Collections, Classic Albums and Live Shows:&#x20;\n" +
            "- Music for every mood - explore curated collections from popular stations like ABC Classic, ABC Country, ABC Jazz, Double J and triple j.\n" +
            "- Music for every occasion - soundtrack your day with Music for Your Warm Up, triple j House Party and Music To Sleep To collections and more.&#x20;\n" +
            "- Music, songs and children's entertainment for kids of all ages to help little ears sleep, learn and play.&#x20;\n" +
            "\n" +
            "Join the Conversation&#x20;\n" +
            "- Tap directly into on-air conversations with Call or Text In buttons at your fingertips.&#x20;\n" +
            "\n" +
            "Life sounds better with ABC listen - download the free app today!&#x20;",
        subtitle: "Music, Sport, News, Audiobooks",
        iconUrl: "4b469e71-1672-4fae-873c-d55244afd584",
        developers: ["Erik Astrid"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://github.com/odisfm/hapi",
            "https://example.com/",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        featured: true,
        categoryNames: ["News", "Entertainment"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "601a6641-7d7d-436d-bf20-7b11902192aa",
        name: "Discord — Talk, Play, Hang Out",
        slug: "discord",
        subtitle: "Group Chat That's Fun & Games",
        description: "# Discord is designed for gaming and great for just chilling with friends or building a community.\n" +
            "\n" +
            "\n" +
            "Customise your own space and gather your friends to talk while playing your favourite games or just hang out.\n" +
            "\n" +
            "## GROUP CHAT THAT’S ALL FUN AND GAMES\n" +
            "\n" +
            "Discord is great for playing games and chilling with friends or even building a worldwide community. Customise your own space to talk, play and hang out in.\n" +
            "\n" +
            "## MAKE YOUR GROUP CHATS MORE FUN\n" +
            "\n" +
            "Create custom emojis, stickers, soundboard effects and more to add your personality to voice, video or text chat. Set your avatar, a custom status and write your own profile to show up in chat your way.\n" +
            "\n" +
            "## STREAM LIKE YOU’RE IN THE SAME ROOM\n" +
            "\n" +
            "High-quality and low-latency streaming makes it feel like you’re hanging out on the couch with friends while playing a game, watching shows, looking at photos or idk, doing homework or something.\n" +
            "\n" +
            "## HOP IN WHEN YOU’RE FREE, NO NEED TO CALL\n" +
            "\n" +
            "Easily hop in and out of voice or text chats without having to call or invite anyone, so you can chat with your friends before, during and after your game session.\n" +
            "\n" +
            "## SEE WHO’S AROUND TO CHILL\n" +
            "\n" +
            "See who’s around, playing games or just hanging out. For supported games, you can see what modes or characters your friends are playing and directly join up.\n" +
            "\n" +
            "## ALWAYS HAVE SOMETHING TO DO TOGETHER\n" +
            "\n" +
            "Watch videos, play built-in games, listen to music or just scroll together and spam memes. Seamlessly text, call, video chat and play games, all in one group chat.\n" +
            "\n" +
            "## WHEREVER YOU GAME, HANG OUT HERE\n" +
            "\n" +
            "On your PC, phone or console, you can still hang out on Discord. Easily switch between devices and use tools to manage multiple group chats with friends.",
        iconUrl: "aa765045-ce5c-494b-bb9f-f7652b38266c",
        developers: ["Jaska Arend", "Elsa Grozdana", "Ramzan Alam"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://testflight.apple.com/join/xxxxxx"
        ],
        featured: true,
        categoryNames: ["Social Media", "Games"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        name: "Twitch — Live Streaming",
        slug: "twitch",
        subtitle: "Stream, Watch, Chat. Live.",
        description: "# Twitch is where thousands of communities come together\n" +
            "\n" +
            "Download Twitch and join millions enjoying live games, music, sports, esports, podcasts, cooking shows, IRL streams, and whatever else crosses our community’s wonderfully absurd minds. We’ll see you in chat.\n" +
            "\n" +
            "Here’s a convenient list of other awesome things about Twitch:\n" +
            "\n" +
            "- Everyone is “about” community. We actually are one: Whatever you nerd out about, you can find your people on Twitch.\n" +
            "- Give support, get support: Find new streamers and subscribe to your favorites. - Plus,  unlock exclusive perks for your support.\n" +
            "- Start your own channel: The Twitch app is one of the easiest ways to start streaming. Just create an account, go live directly from the app, and bring people together around whatever you’re passionate about.\n" +
            "- You never know what you’ll find: Popular games are always live, but so are music festivals, rocket launches, street tours of Tokyo, and goat yoga. Yes, really.\n" +
            "- Dark mode: Y’all love this one. Black and purple have never looked this good together.",
        iconUrl: "0b87b97e-0c10-42f9-bfa0-ca311e60d845",
        developers: ["Tina Nora", "Misi Meena", "Reuel Liberato"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        categoryNames: ["Social Media", "Games", "Entertainment"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    {
        id: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        name: "Bluey's Quest for The Gold Pen",
        slug: "bluey-gold-pen",
        subtitle: "A story-driven adventure game",
        description:
            "# Join Bluey in a new adventure game with story by the show's creator. \n" +
            "\n" +
            "Set off on an epic quest featuring new characters, fully animated cutscenes, and hand-drawn environments inspired by the Dragon and Escape episodes in the TV series.\n" +
            "\n" +
            "Explore vibrant worlds, solve trifficult puzzles and complete fun challenges, all as you embark on Bluey’s Quest for The Gold Pen.\n" +
            "\n" +
            "## A NEW BLUEY STORY\n" +
            "\n" +
            "Dive into an adventure game fuelled by a brand-new story from the show's creator! Discover the humour and warmth Bluey brings in this fun new game for the family, with story by Joe Brumm.\n" +
            "\n" +
            "## EMBARK ON A HEART-WARMING ADVENTURE\n" +
            "\n" +
            "Bluey is drawing at the table when Dad suddenly yoinks the Gold Pen she needs! Bluey sets off on an adventure with the whole family. Mum designs the strange and distant lands, Dad rocks up on his cool bike as self-declared King Goldie Horns, and Bingo transforms into her honk-happy alter ego — Bingooose! Away they go on an exciting quest to retrieve the Gold Pen – and have heaps of fun along the way.\n" +
            "\n" +
            "## GO ON FUN-FILLED CHALLENGES \n" +
            "\n" +
            "Uncover hidden treasures, solve playful puzzles, and take on delightful mini-quests as you glide, fly, and skate through each level. Interact with quirky characters and help little lost critters return to their homes. Search near and far for goosefood and beads to unlock new moments in the adventure as you keep Bluey moving onwards in her quest.\n" +
            "\n" +
            "## EXPLORE HAND-DRAWN WORLDS \n" +
            "\n" +
            "Explore lively levels brimming with snowy mountains, golden beaches, lush forests, and iconic Australian landscapes. Each environment is packed with vibrant details and opportunities for discovery.\n" +
            "\n" +
            "## FUN FOR EVERYONE \n" +
            "\n" +
            "Just like the animated series, Bluey’s Quest for the Gold Pen sparks laughter and encourages players of all ages to discover through play. Packed full of trifficult puzzles and wholesome moments, this is an adventure for the whole household.",
        iconUrl: "d4911a18-5b87-4109-968f-cc7346832c38",
        heroArtUrl: "7b2970ed-ebf3-4a6d-8f69-5199594a30a8",
        developers: ["Viktorie Haiyang", "Natalija Zoilus"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        featured: true,
        categoryNames: ["Games"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        },
        published: true
    },
    // Apple Foundation Program 2026 Sem 1
    {
        id: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        name: "Duolingo: Language & Chess",
        slug: "duolingo",
        subtitle: "Learn Spanish, Math & more",
        description: "# Learn a new language, chess & more with the world's most downloaded education app!\n" +
            "\n" +
            "Duolingo is the fun, free app for learning 40+ languages through quick, bite-sized lessons. Practice speaking, reading, listening & writing to build your vocabulary & grammar skills.\n" +
            "\n" +
            "Designed by learning experts & loved by hundreds of millions worldwide, our lessons make learning effective & fun and help you prepare for real conversations in Spanish, French, Japanese, Korean, Chinese, Italian, German, English and more.\n" +
            "\n" +
            "And now, you can learn CHESS on Duolingo! Whether you're a total beginner or looking to level up your game, you'll love learning chess the Duolingo way. Play matches and fun chess lessons for all levels, no matter the language - chess, ajedrez, xadrez, schach, Шахматы, الشطرنج.\n" +
            "\n" +
            "- *Chess*: Learn the moves, level up your game & play matches in our Chess course. Learn the basics, solve fun chess puzzles & improve your strategy with guided lessons. Whether you're new to chess or already play, our course is designed to help you have fun and build real skills. Checkmate!\n" +
            "\n" +
            "- *Math*: Forget lectures and math worksheets! Built by learning experts, our Math course makes math feel like a game. Boost learning and fight the summer slide with standards-aligned math lessons for elementary school, middle school, and high school students.\n" +
            "\n" +
            "- *Music*: Learn how to read music & play songs in our Music course, no instrument needed! Using an on-screen keyboard, you'll learn bit-by-bit.\n" +
            "\n" +
            "Whether you're learning a language for travel, school, career or your brain health, you'll love learning with Duolingo.\n" +
            "\n" +
            "## Why Duolingo?\n" +
            "\n" +
            "- Duolingo is fun & effective. Game-like language lessons & fun characters help you build speaking, reading, listening, & writing skills, plus enjoy fun chess & competitive online chess in one app.\n" +
            "\n" +
            "- Duolingo works. Designed by learning experts, Duolingo has a science-based teaching methodology proven to foster long-term knowledge retention across language lessons & chess lessons alike.\n" +
            "\n" +
            "- Track your progress. Work toward your learning goals with playful rewards & achievements when you make practicing language lessons or chess online part of your daily habit.\n" +
            "\n" +
            "- Join millions of learners. Stay motivated with competitive Leaderboards as you learn languages & play chess online alongside our global community.\n" +
            "\n" +
            "- Every course is free. Learn Spanish, French, German, Italian, Russian, Portuguese, Turkish, Dutch, Irish, Danish, Swedish, Ukrainian, Esperanto, Polish, Greek, Hungarian, Norwegian, Hebrew, Welsh, Arabic, Latin, Hawaiian, Scottish Gaelic, Vietnamese, Korean, Japanese, English, & even High Valyrian! And now, learn Math, Music & improve your Chess skills with fun, bite-sized lessons.\n" +
            "\n" +
            "## What the world is saying about Duolingo:\n" +
            "\n" +
            ">\"Far & away the best language-learning app.\" - The Wall Street Journal\n" +
            "\n" +
            ">\"This free app & website is among the most effective language-learning methods I've tried… lessons come in the form of brief challenges, speaking, translating, answering multiple-choice questions, that keep me coming back for more.\" - The New York Times\n" +
            "\n" +
            ">\"Duolingo may hold the secret to the future of education.\" - TIME Magazine\n" +
            "\n" +
            ">\"Duolingo is cheerful, lighthearted & fun.\" - Forbes\n" +
            "\n" +
            ">\"I Can't Stop Playing Duolingo Chess.\" - Wired",
        iconUrl: "58e26c42-a120-4c08-9b46-be2749243817",
        heroArtUrl: "c546b654-226a-4f0b-9759-5ae38c32bc3a",
        developers: ["Märyäm Agapitos", "Aisha Anand"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://testflight.apple.com/join/xxxxxx",
            "https://example.com/"
        ],
        featured: true,
        categoryNames: ["Education"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        name: "Simply Piano: Learn Piano Fast",
        slug: "simply-piano",
        subtitle: "Piano Songs & Lessons",
        description: "# Learn to play the songs you love with Simply Piano!\n" +
            "\n" +
            "Simply Piano is a fast and fun way to learn piano, from beginner to pro. Works with any piano or keyboard. Chosen as one of the best iPhone apps.\n" +
            "\n" +
            "- Tons of fun songs like Imagine, Chandelier, All Of Me and Counting Stars, also J.S. Bach\n" +
            "- Includes courses for different musical tastes and playing levels-\n" +
            "- Learn the basics step-by-step from reading sheet music to playing with both hands\n" +
            "- Slow down library songs to choose your own pace for easy learning\n" +
            "- Personalized 5-Min Workouts ensuring you progress fast and always succeed\n" +
            "- Suitable for all ages, no previous knowledge required to learn piano\n" +
            "\n" +
            "No Piano? Try the Touch Courses with 3D Touch to turn your device into an on-screen keyboard!\n" +
            "\n" +
            "## How it works\n" +
            "\n" +
            "- Place your device (iPhone/iPad/iPod) on your acoustic/MIDI piano or keyboard and play; the app will immediately recognize what you are playing\n" +
            "- Get instant feedback on your playing to quickly learn and improve your piano skills\n" +
            "- Discover the magic of music with fun songs in the Library and complete courses to start sounding like a pro\n" +
            "\n" +
            "Have questions, feedback or suggestions? Reach out to us via the in-app chat, just tap on Settings and ‘Have a Question’.\n" +
            "\n" +
            "Enjoy Playing!",
        iconUrl: "65405e6c-4eab-4cab-bacb-8623e222fd6f",
        developers: ["Kristofor Lal"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        categoryNames: ["Education", "Creative"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: false
    },
    {
        id: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        name: "Elevate — Brain Training",
        slug: "elevate",
        subtitle: "Vocab, Memory, & Math Puzzles",
        description: "# Elevate is a brain training program designed to improve your mind’s focus, memory, speaking abilities, processing speed, math skills, and more. \n" +
            "\n" +
            "Each person is provided with a personalized training program that adjusts over time to maximize results.\n" +
            "\n" +
            "The more you train with Elevate, the more you’ll improve critical cognitive skills that are proven to boost productivity, earning power, and self-confidence. 90%+ report improved vocabulary, math skills, and overall mental sharpness when they frequently use Elevate.\n" +
            "\n" +
            "## IN THE NEWS\n" +
            "\n" +
            "> “Elevate comes out ahead” in the battle of the brain training apps. - CNET\n" +
            "\n" +
            "> Elevate is a “cognitive pick-me-up” with games that are “good for mental breaks throughout the workday.” - Washington Post\n" +
            "\n" +
            "## FEATURES\n" +
            "\n" +
            "- 40+ Brain Training Games: Improve your critical cognitive skills like focus, memory, processing, math, precision, and comprehension with 40+ brain training games.\n" +
            "- Performance Tracking: Measure your performance against yourself and others. Weekly reports highlight your key accomplishments and opportunities.\n" +
            "- Personalized Workouts: Customize your daily training focus and choose between 3 and 5 games. Get personalized daily workouts that include the skills you need most.\n" +
            "- Adaptive Progression: Train your brain with adaptive difficulty progression that ensures your experience is challenging.\n" +
            "- Workout Calendar: Track your streaks and stay motivated with Elevate’s workout calendar.\n" +
            "- Elevate Dash on Apple Watch: Play 4 additional mini-games and review your performance on your Apple Watch with Elevate Dash.\n" +
            "- And more!\n" +
            "\n" +
            "## WHY YOU NEED ELEVATE\n" +
            "\n" +
            "- Express yourself more effectively in writing. Write with clarity, persuasiveness, and concision.\n" +
            "- Improve your spelling and punctuation. Avoid common writing pitfalls.\n" +
            "- Become a better reader. Read everyday materials faster and with greater understanding.\n" +
            "- Expand your vocabulary.\n" +
            "- Quickly and easily solve everyday math problems. Get better at comparing prices, splitting bills, and calculating discounts and markups.\n" +
            "- Speak more effectively. Become more articulate and better at communicating tone and meaning.\n" +
            "\n" +
            "## RESEARCH BEHIND ELEVATE\n" +
            "\n" +
            "Elevate's games are designed in collaboration with experts in neuroscience and cognitive learning and are based on extensive scientific research. Elevate’s brain training algorithms further focus the learning experience by drawing from research in memory studies to develop a personalized training program for each member.",
        iconUrl: "d7beb5b9-b958-44e1-894d-649bc5ce4192",
        developers: ["Giosuè Rollie", "Víkingr Ela"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://testflight.apple.com/join/xxxxxx",
            "https://github.com/odisfm/hapi"
        ],
        featured: true,
        categoryNames: ["Education", "Health", "Games"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "181039d7-2674-464b-bc68-05a372f03558",
        name: "LinkedIn Learning",
        slug: "linkedin-learning",
        subtitle: "Online Courses to Learn Skills",
        description: "# Achieve your next career goal with LinkedIn Learning!\n" +
            "\n" +
            "With the LinkedIn Learning app, you can:\n" +
            "\n" +
            "- Learn from industry experts on the most in-demand business, tech, and creative skills\n" +
            "- Get personalized content recommendations based on your skills and goals\n" +
            "- Stay up-to-date on the latest skills with new courses added weekly\n" +
            "- Learn the way you want online or offline—with bite-sized video, audio, or full course options\n" +
            "- Start learning a little bit every day with Daily\n" +
            "- Earn Professional Certificates and Continuing Education Credits\n" +
            "- Add certificates of completion to your LinkedIn profile\n" +
            "- Learn in the language that's best for you, including English, German, French, Spanish, Japanese, Chinese, Portuguese, Dutch, Indonesian, Polish, Turkish, and Korean\n" +
            "\n" +
            "## Trending topics include\n" +
            "\n" +
            "- Artificial intelligence and generative AI\n" +
            "- Business productivity and software\n" +
            "- Cybersecurity\n" +
            "- Diversity, equity, and inclusion\n" +
            "- Leadership and management\n" +
            "- Software development",
        iconUrl: "dab6bd42-0b5f-46b0-ad4c-1a0e8dd2f0f1",
        heroArtUrl: "ff28e1d1-2b82-4348-93e8-673f2fcec3d9",
        developers: ["Aucaman Krystiana", "Zabulon Nindaanis", "Su-bin Barak"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        featured: true,
        categoryNames: ["Education", "Workplace", "Business"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        name: "Candy Crush Saga",
        slug: "candy-crush-saga",
        subtitle: "The fun match 3 puzzle game!",
        description: "# A legendary puzzle game loved by millions of players around the world.\n" +
            "\n" +
            "With over a trillion levels played, this sweet match 3 puzzle game is one of the most popular mobile games of all time!\n" +
            "\n" +
            "Switch and match Candies in this tasty puzzle adventure to progress to the next level for that sweet winning feeling! Solve puzzles with quick thinking and smart moves, and be rewarded with delicious rainbow-colored cascades and tasty candy combos!\n" +
            "\n" +
            "Plan your moves by matching 3 or more candies in a row, using boosters wisely in order to overcome those extra sticky puzzles! Blast the chocolate and collect sweet candy across thousands of levels, guaranteed to have you craving more!\n" +
            "\n" +
            "## THE GAME THAT KEEPS YOU CRAVING MORE\n" +
            "\n" +
            "Thousands of the best levels and puzzles in the Candy Kingdom and with more added every 2 weeks your sugar fix is never far away!\n" +
            "\n" +
            "## MANY WAYS TO WIN REWARDS\n" +
            "\n" +
            "Check back daily and spin the Daily Booster Wheel to receive free tasty rewards, and take part in time limited challenges to earn boosters to help you level up!\n" +
            "\n" +
            "## VARIETY OF SUGAR-COATED CHALLENGES\n" +
            "\n" +
            "Sweet ways to play: Game modes including Target Score, Clear the Jelly, Collect the Ingredients and Order Mode\n" +
            "\n" +
            "## PLAY ALONE OR WITH FRIENDS\n" +
            "\n" +
            "Get to the top of the leaderboard events and compare scores with friends and competitors!\n" +
            "\n" +
            "Levels range from easy to hard for all adults to enjoy – accessible on-the-go, offline and online.\n" +
            "It's easy to sync the game between devices and unlock full game features when connected to the Internet or Wifi.",
        iconUrl: "9fb303f7-5b03-43c7-8310-15aeb4857d26",
        heroArtUrl: "7294ee97-d5c5-42d4-ae00-c2307970f562",
        developers: ["Geno Ceallach", "Deasún Ron"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://github.com/odisfm/hapi"
        ],
        featured: true,
        categoryNames: ["Games"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        name: "Splitwise",
        slug: "splitwise",
        subtitle: "Split expenses with friends",
        description: "# Splitwise is the easiest way to share expenses with friends and family and stop stressing about “who owes who”.\n" +
            "\n" +
            "Millions of people around the world use Splitwise to organize group bills for households, trips, and more. Our mission is to reduce the stress and awkwardness that money places on our most important relationships.\n" +
            "\n" +
            "## Splitwise is great for\n" +
            "\n" +
            "* Roommates splitting rent and apartment bills\n" +
            "* Group trips around the world\n" +
            "* Splitting a vacation house for skiing or at the beach\n" +
            "* Weddings and bachelor/bachelorette parties\n" +
            "* Couples sharing relationship costs\n" +
            "* Friends and co-workers who go out to lunch or dinner together frequently\n" +
            "* Loans and IOUS between friends\n" +
            "* And so much more\n" +
            "\n" +
            "## Splitwise is simple to use\n" +
            "\n" +
            "* Create groups or private friendships for any splitting situation\n" +
            "* Add expenses, IOUs, or informal debts in any currency, with support for offline entry\n" +
            "* Expenses are backed up online so everyone can log in, view their balances, and add expenses\n" +
            "* Keep track of who should pay next, or settle up by recording cash payments or using our integrations\n" +
            "\n" +
            "We also have powerful features that can handle almost any money sharing situation. Here are some of our industry-leading features:\n" +
            "\n" +
            "* Multi-platform support for smartphones and web\n" +
            "* Simplify debts into the easiest repayment plan\n" +
            "* Expense categorization\n" +
            "* Calculate group totals\n" +
            "* Export to CSV\n" +
            "* Comment directly on expenses\n" +
            "* Split expenses equally or unequally by percentages, shares, or exact amounts\n" +
            "* Add informal debts and IOUs\n" +
            "* Create bills that reccur monthly, weekly, yearly, fortnightly\n" +
            "* Add multiple payers on a single expense\n" +
            "* See total balances with a person across multiple groups and private expenses\n" +
            "* Custom user avatars\n" +
            "* Cover photos for groups\n" +
            "* Activity feed and push notifications help you stay on top of changes\n" +
            "* View your edit history for changes to an expense\n" +
            "* Any deleted group or bill can be restored easily\n" +
            "* World-class customer support\n" +
            "* Pay back using our integrated payments: Venmo and PayPal (US only), Paytm (India only)\n" +
            "* 100+ currencies and growing\n" +
            "* 7+ supported languages\n" +
            "\n" +
            "## Endorsements\n" +
            "\n" +
            "> “Makes it easy to split everything from your dinner bill to rent.” - NY Times\n" +
            "\n" +
            "> \"Fundamental for tracking finances. As good as WhatsApp for containing awkwardness.\" – The Financial Times\n" +
            "> “I never fight with roommates over bills because of this genius expense-splitting app”- Business Insider\n" +
            "\n" +
            "> “The Single Best App You Can Download for Group Trips of Any Kind” - Thrillist\n" +
            "\n" +
            "> “Life Changing! I don’t review many things, but this app has seriously improved my quality of life. It has saved my sanity when it comes to splitting utilities, mortgage, groceries, dog expenses...the list goes on. No more saving receipts, making spreadsheets, and manually calculating each month. So handy for group trips/weekends, too! THANK YOU!!” – Courtney via the App Store\n",
        iconUrl: "f9ab8a29-f90f-4f01-bdae-dd91bd276bad",
        developers: ["Jitender Yannick", "Sachiko Yuliy"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://github.com/odisfm/hapi"
        ],
        categoryNames: ["Finance", "Utilities"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: false
    },
    {
        id: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        name: "Strava: Run, Bike, Walk",
        slug: "strava",
        subtitle: "Track & share with friends",
        description:
            "# Strava makes fitness tracking social.\n" +
            "\n" +
            "\n" +
            "\n" +
            "We house your entire active journey in one spot – and you get to share it with friends. Here’s how:\n" +
            "\n" +
            "- Record everything – runs, rides, hikes, yoga and over 30 other sport types. Think of Strava as the homebase of your movement.\n" +
            "- See the full story of your strength training – Lifting in the gym weekly, doing HIIT workouts, and showing up to your group weight training classes? Use your favorite device or strength app and your exercises, sets, reps, weights and a muscle map show up automatically. Or start your strength journey today and see how quickly strength workouts become a key part of your active life.\n" +
            "\n" +
            "- Discover anywhere – our Routes tool uses de-identified Strava data to intelligently recommend popular routes based on your preferences. You can also build your own.\n" +
            "\n" +
            "- Build a support network – Strava’s about celebrating movement. Here you’ll find your community and cheer each other on.\n" +
            "\n" +
            "- Train smarter – get data insights to understand your progress and see how you improve. Your Training Log is the record of all your workouts.\n" +
            "\n" +
            "- Get more from your workout – Powered by AI, Athlete Intelligence turns workout data into into instant insights. Keeping you motivated and ready for the next workout – without the guesswork.\n" +
            "\n" +
            "- Move safer – share your real-time location with loved ones while outdoors for an extra layer of safety.\n" +
            "\n" +
            "- Sync your favorite apps and devices – Strava is compatible with thousands of them (Apple Watch, Fitbit, Garmin – you name it).\n" +
            "\n" +
            "- Join and create challenges – join millions in monthly challenges to chase new goals, collect digital badges and stay accountable.\n" +
            "\n" +
            "- Embrace the unfiltered – your feed on Strava is filled with real efforts from real people. That’s how we motivate each other.\n" +
            "\n" +
            "- Whether you’re a world-class athlete or a total beginner, you belong here. Just record and go.\n" +
            "\n" +
            "Strava includes both a free version and a subscription version with premium features.\n" +
            "Strava uses HealthKit to export your Strava activities into the Health app and to read heart rate and biometric data.",
        iconUrl: "b10b346b-1277-479c-9068-b03f660e86be",
        heroArtUrl: "49aecc1f-5973-4477-8eda-04894d32ead1",
        developers: ["Yami Briggs", "Czarek Nina"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        featured: true,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://example.com/"
        ],
        categoryNames: ["Social Media", "Health"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        name: "Blackmagic Camera",
        slug: "blackmagic-camera",
        subtitle: "Unlock the power of your iPhone",
        description: "# Introducing Digital Film for iPhone and iPad!\n" +
            "\n" +
            "Blackmagic Camera unlocks the power of your iPhone and iPad by adding digital film camera controls and operating systems! Now you can create the same cinematic ‘look’ as Hollywood feature films. You get the same intuitive and user friendly interface as Blackmagic Design’s award winning cameras. So it’s just like using a professional digital film camera! This means you can adjust settings such as frame rate, shutter angle, white balance and ISO all in a single tap. Or record directly to Blackmagic Cloud in industry standard 10-bit Apple ProRes files up to 4K! Recording to Blackmagic Cloud Storage lets you collaborate on DaVinci Resolve projects with editors anywhere in the world, all at the same time!\n" +
            "\n" +
            "## Get the \"Hollywood Look\" with Digital Film!\n" +
            "\n" +
            "Blackmagic Camera puts the professional features you need for feature film, television and documentaries in your pocket. Now you can create YouTube and TikTok content with a cinematic look, and broadcast quality ENG! Imagine having a run and gun camera on hand to capture breaking news whenever it happens! Or use Blackmagic Camera as a B Cam to capture angles that are difficult to reach with traditional cameras, while still retaining control of important settings. Best of all, recording to Blackmagic Cloud allows you to get your footage to the newsroom or post production studio in minutes.\n" +
            "\n" +
            "## Interactive Controls for Fast Setup\n" +
            "\n" +
            "Blackmagic Camera has all the controls you need to quickly setup and start shooting!  Everything is interactive, so you can tap any item and instantly change settings without searching through confusing menus! The HUD shows status and record parameters, histogram, focus peaking indicators, levels, frame guides and more. Show or hide the HUD by swiping up or down. You can auto focus by tapping the screen in the area you want to focus. You can shoot in 16:9 or vertical aspect ratios, plus you can shoot 16:9 while holding your phone vertically if you want to shoot unobtrusively.\n" +
            "\n" +
            "## On Screen Heads Up Display\n" +
            "\n" +
            "The heads up display, or HUD, controls have the most important camera controls such as lens selection, frame rate, shutter angle, timecode, ISO, white balance, gain and audio levels. You can adjust settings such as exposure by touching the ISO indicator, or you can change the audio levels simply by touching the audio meters. Everything is interactive, so if you tap any item you can instantaneously change its settings without having to search through complex menus!\n" +
            "\n" +
            "## Camera Setup Menus\n" +
            "\n" +
            "The settings tab unlocks the full power of your phone’s camera, with quick access to advanced settings such as monitoring, audio, camera setup, recording and more! The record tab gives you total control over video resolution and recording format including industry standard Apple ProRes or space efficient H.264 and H.265. Plus, you can set anamorphic de-squeeze and lens correction settings. Professional audio options include AAC and PCM format and VU or PPM audio metering. You can even add external microphones! Or add 3D LUTs to recreate film looks!\n" +
            "\n" +
            "## Media\n" +
            "\n" +
            "The Blackmagic Camera media tab has all the controls you need to browse or scrub clips for quick review, search and sort and view the upload status of your media. Access your media from Blackmagic Camera’s all clips folder by choosing the Media button to see the thumbnails for each clip you have stored. Plus, you can save to the files folder on the phone, send it to Blackmagic Cloud Storage via Blackmagic Cloud or manually choose which clips to upload to a project library. You can even sync media from Blackmagic Camera directly into the DaVinci Resolve project so you’re ready to edit!\n" +
            "\n" +
            "## Live Sync to Blackmagic Cloud Storage\n" +
            "\n" +
            "When shooting with Blackmagic Camera, the video you capture can be instantly uploaded as a proxy file, followed by the camera originals, and saved to Blackmagic Cloud Storage. This means you can start editing quickly using your proxies, speeding up your workflow.",
        iconUrl: "d6e6f63c-9690-41f0-a20d-3c96bb45bc9a",
        developers: ["Sawsan Victoria", "Chip Sharia"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        categoryNames: ["Photo & Video", "Creative", "Utilities"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        name: "Microsoft Teams",
        slug: "microsoft-teams",
        subtitle: "Call. Chat. Collaborate.",
        description:
            "# Microsoft Teams helps bring people together so that they can get things done.\n" +
            "\n" +
            "It’s the only app that has communities, events, chats, channels, meetings, storage, tasks, and calendars in one place—so you can easily connect and manage access to information. Get your community, family, friends, or workmates together to accomplish tasks, share ideas, and make plans. Join audio and video calls in a secure setting, collaborate in documents, and store files and photos with built-in cloud storage. You can do it all in Microsoft Teams.\n" +
            "\n" +
            "## Easily connect with anyone\n" +
            "\n" +
            "- Skype is now part of Teams. Continue where you left off with your chats, calls and contacts in Microsoft Teams Free.\n" +
            "- Meet securely with communities, teammates, family, or friends.\n" +
            "- Set up a meeting within seconds and invite anyone by sharing a link or calendar invite.\n" +
            "- Chat 1-1 or to your entire community, @mention people in chats to get their attention.\n" +
            "- Create a dedicated community to discuss specific topics and make plans\\*.\n" +
            "- Work closely and collaborate by keeping conversations organized by specific topics and projects with teams and channels.\n" +
            "- Video or audio call anyone directly in Teams or instantly convert a group chat to a call.\n" +
            "- Use GIFs, emojis, and message animations to express yourself when words aren’t enough.\n" +
            "\n" +
            "## Accomplish plans and projects together\n" +
            "- Send photos and videos in chats to quickly and easily share important moments.\n" +
            "- Use cloud storage to access shared documents and files on the go.\n" +
            "- Organize shared content in a community — events, photos, links, files —so you don’t have to waste time searching\\*.\n" +
            "- Get the most out of your meetings by using screen share, whiteboard, or breakout in virtual rooms.\n" +
            "- Manage access to information and ensure the right people have access to the right info, even when people join and leave projects.\n" +
            "- Use task lists to stay on top of projects and plans - assign tasks, set due dates, and cross off items to keep everyone on the same page.\n" +
            "\n" +
            "## Designed to give you peace of mind:\n" +
            " \n" +
            "- Securely collaborate with others while maintaining control over your data.\n" +
            "- Keep communities safe by allowing owners to remove inappropriate content or members.\n" +
            "- Enterprise-level security and compliance you expect from Microsoft 365.",
        iconUrl: "63b7e43c-6480-470f-8b3f-b16ad7d09af3",
        developers: ["Ariadna Subramanian", "Regin Anselma"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx"
        ],
        categoryNames: ["Business", "Workplace"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        name: "Snapchat: Chat with Friends",
        slug: "snapchat",
        subtitle: "Share the moment",
        description: "# Snapchat is a fast and fun way to share the moment with your friends and family\n" +
            "\n" +
            "## SNAP\n" +
            "\n" +
            "- Snapchat opens right to the Camera — just tap to take a photo, or press and hold for video.\n" +
            "- Express yourself with Lenses, Filters, Bitmoji and more!\n" +
            "- Try out new Lenses daily created by the Snapchat community!\n" +
            "\n" +
            "## CHAT\n" +
            "\n" +
            "- Stay in touch with friends through live messaging, or share your day with Group Stories.\n" +
            "- Video Chat with up to 16 friends at once — you can even use Lenses and Filters when chatting!\n" +
            "- Express yourself with Friendmojis — exclusive Bitmoji made just for you and a friend.\n" +
            "\n" +
            "## STORIES\n" +
            "- Watch friends' Stories to see their day unfold.\n" +
            "- See Stories from the Snapchat community that are based on your interests.\n" +
            "- Discover breaking news and exclusive Original Shows.\n" +
            "\n" +
            "## SPOTLIGHT\n" +
            "- Spotlight showcases the best of Snapchat!\n" +
            "- Submit your own Snaps or sit back, relax, and watch.\n" +
            "- Pick your favorites and share them with friends.\n" +
            "\n" +
            "## MAP\n" +
            "\n" +
            "- Share your location with your best friends or go off the grid with Ghost Mode.\n" +
            "- See what your friends are up to on your most personal map when they share their location with you.\n" +
            "- Explore live Stories from the community nearby or across the world!\n" +
            "\n" +
            "## MEMORIES\n" +
            "\n" +
            "- Save unlimited photos and videos of all your favorite moments.\n" +
            "- Edit and send old moments to friends or save them to your Camera Roll.\n" +
            "- Create Stories from your favorite Memories to share with friends and family.\n" +
            "\n" +
            "## FRIENDSHIP PROFILE\n" +
            "\n" +
            "- Every friendship has its own special profile to see the moments you’ve saved together.\n" +
            "- Discover new things you have in common with Charms — see how long you’ve been friends, your astrological compatibility, your Bitmoji fashion sense, and more!\n" +
            "- Friendship Profiles are just between you and a friend, so you can bond over what makes your friendship special.\n" +
            "\n" +
            "Happy Snapping!",
        iconUrl: "546fac9b-76f2-4c9f-adf3-6a11991ae254",
        developers: ["Cyra Favour", "Elkan Starla"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        categoryNames: ["Social Media", "Photo & Video"],
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        },
        published: true
    },
    // Capstone 2026 Sem 1
    {
        id: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        name: "Swipewipe: Photo Storage",
        slug: "swipewipe",
        subtitle: "Organize & Delete Duplicates",
        description: "# Tidy up your camera roll, one swipe at a time.&#x20;\n" +
            "\n" +
            "Swipewipe makes cleaning up your photo gallery fun and easy. Reminisce while you declutter!\n" +
            "\n" +
            "Finally, a dead-simple way to manage your memories. Go month-by-month, take a trip down memory lane with our \"On This Day\" feature, explore your travels on a stunning memory map, and bring old photos back to life with AI enhancement.\n" +
            "\n" +
            "Decide what to keep and what to bin with a simple swipe.\n" +
            "\n" +
            "## Here's what makes it great\n" +
            "\n" +
            "- Simple Swipe: Right to keep, left to delete. It's that easy.\n" +
            "- On This Day: Relive your best memories from years gone by.\n" +
            "- Month-by-Month: Easily sort your photos chronologically.\n" +
            "- Memory Map: Rediscover your adventures all over the world.\n" +
            "- AI Photo Enhancer: Sharpen up your favourite memories.\n" +
            "- Easy Navigation: Tap to go back, hold for photo details.\n" +
            "\n" +
            "## Top Features\n" +
            "\n" +
            "- Bookmarks: Set aside photos you're on the fence about.\n" +
            "- Progress Tracking: See how much you've tidied up.\n" +
            "- Stats: Track reviewed photos and the storage space you've saved.\n" +
            "- \"On This Day\" Widget: Reminisce daily and build up a streak.\n" +
            "- World Map: See exactly where your memories were made.\n" +
            "- Photo Enhancement: Make old, blurry, or low-quality photos look brilliant.\n" +
            "\n" +
            "Let's be honest, our camera rolls can be a bit of a mess. Reclaim your memories, rediscover forgotten moments, and free up some serious storage space today.\n" +
            "\n" +
            "Download Swipewipe and get swiping!",
        iconUrl: "7b0ad2ac-fcfd-4272-a260-77d374f56a79",
        developers: ["Laurentino Wulfric"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://github.com/odisfm/hapi",
            "https://example.com/"
        ],
        categoryNames: ["Utilities", "Photo & Video"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        name: "Pedometer++",
        slug: "pedometer-plus-plus",
        subtitle: "Count Steps",
        description: "# Available on the iPhone and Apple Watch, Pedometer++ is the best way to review your step count, walking distance, active calories, and heart rate data.\n" +
            "\n" +
            "Set a custom step count goal and track your progress over time. The built-in graphs make reviewing your data easy and fun. Everyone loves awards, and Pedometer++ includes a range of Badges to motivate and reward your hard work! The app also totals how far you’ve walked each day, and even counts the flights of stairs you encounter each day.\n" +
            "\n" +
            "With full-featured widget support, Pedometer++ can display your step count or update you on your daily progress right from your iPhone's lock screen or home screen. You can also share your workouts with others and view trends over time.\n" +
            "\n" +
            "The Apple Watch app puts all this data on your wrist. With a wide range of Complications, it’s easy to check your progress with just a glance. Add a single Complication to your daily watch face, or add several to build a comprehensive fitness-focused look!\n" +
            "\n" +
            "## DETAILS\n" +
            "\n" +
            "For best results, keep your iPhone on you as you move throughout the day, ideally in a pocket close to your hips. If you have an Apple Watch, you can set Pedometer++ to sync step data across your devices for the most accurate data possible.\n" +
            "\n" +
            "The Apple Watch app can also start and track indoor and outdoor walking and running workouts and can serve as your guide while hiking.\n" +
            "\n" +
            "## ROUTES & MAPPING\n" +
            "\n" +
            "Pedometer++ is your ultimate companion for exploring the great outdoors. It allows you to import GPX files for waypoints and routes set by others.\n" +
            "\n" +
            "You can also use the app to create your own routes. Simply tap on your desired start and end points, and Pedometer++ will find the shortest route between them. You can then tweak the route based on terrain, trail popularity, or personal preference.\n" +
            "\n" +
            "Pedometer++ shows the distance of a route, the elevation changes you will encounter, and the estimated time it will take you to reach your destination. You can also monitor the weather that is expected along your route.\n" +
            "\n" +
            "The best part is that custom routing is available on the iPhone and Apple Watch. Of course, being out in nature often means losing cell service, so Pedometer++ allows you to download offline map data for large areas, not just for your specific route. Offline map data is also available on the iPhone and Apple Watch, as long as your Watch is within range of your phone.",
        iconUrl: "76731acf-95cc-4461-b0bb-aa3845bfb6b6",
        developers: ["Arushi Dechen", "Gautam Audrius"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx",
            "https://github.com/odisfm/hapi",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        categoryNames: ["Health"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        name: "Hoopla",
        slug: "hoopla",
        subtitle: "Your library anywhere",
        description: "# Thousands of free books, audio, comics, and more available right now with your library card.\n" +
            "\n" +
            "No subscription. No ads. Just borrow and read.\n" +
            "\n" +
            "Hoopla Digital connects your local public library to your phone, giving you instant access to thousands of free audiobooks, eBooks, comics, graphic novels, manga, and magazines with new titles added daily.\n" +
            "\n" +
            "## Free Books and Audiobooks Available Right Now\n" +
            "\n" +
            "Borrow audiobooks and eBooks of all genres. From romance to psychological thrillers, discover chart-topping new releases, indie authors, and classics to stream or download anytime.\n" +
            "\n" +
            "## Comics, Manga, and Graphic Novels\n" +
            "\n" +
            "Dive into an enormous library of comics and manga across every genre. Our ActionView feature brings panel-by-panel reading to life with stunning detail.\n" +
            "\n" +
            "## Watch Free Movies and TV\n" +
            "\n" +
            "Stream movies, anime, documentaries, and TV shows at home or on the go. Use BingePass for seven-day unlimited access to premium channels like Hallmark+ and PBS or SeasonPass to borrow and binge watch the full season in one sitting.\n" +
            "\n" +
            "## Listen to Music Albums\n" +
            "\n" +
            "Borrow full albums by artists like Taylor Swift, Sabrina Carpenter, Bruno Mars and Morgan Wallen. Shuffle between multiple albums to create a unique playlist of songs by your favorite musical artists.\n" +
            "\n" +
            "## Built for How You Live\n" +
            "\n" +
            "* Apple CarPlay support for hands-free audiobooks and music on the road\n" +
            "* Dark mode for comfortable late-night reading\n" +
            "* Sleep timer so you never lose your place\n" +
            "* Offline downloads — no data needed once borrowed\n" +
            "\n" +
            "All you need is a free library card from a participating library.",
        iconUrl: "308c396b-2a14-42b5-ae39-354212f89993",
        developers: ["Osiris Zigmantas", "Ophiuchus Semisi", "Muzaffar Adeyemi"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://testflight.apple.com/join/xxxxxx",
            "https://example.com/"
        ],
        categoryNames: ["Education", "Entertainment"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        name: "Roost Social",
        slug: "roost",
        subtitle: "Old school messages, by pigeon",
        description: "# Slowcial Media. Make Friends and Stay Close. Watch your carrier pigeon travel in real time with your messages. Collect birds, train your flock, and stay in the moment.\n" +
            "\n" +
            "Roost brings back old school messages with carrier pigeons and snail mail. You send a note, a bird picks it up, and it flies across the world to your friends. No instant delivery. No read receipts ten seconds later. Just a little bird in the air, carrying your words, taking the time it takes.\n" +
            "\n" +
            "Watch yours and your friends birds fly in real time around the world. Be in the moment. Send something and go live your day. When your bird lands, it lands.\n" +
            "\n" +
            "## BUILD YOUR ROOKERY\n" +
            "\n" +
            "Catch birds of every feather. Your favorite New York Pigeon, rare cardinals, mythical phoenixes. Every one has its own speed based on their real speeds. Feed them, level them up, watch your flock grow.\n" +
            "\n" +
            "## REAL MAPS, REAL FLIGHTS\n" +
            "\n" +
            "Every delivery flies a real route across a real map. Track your bird as it goes. See where it is, how far it's come, when it's landing.\n" +
            "\n" +
            "## FRIENDS, NOT FEEDS\n" +
            "\n" +
            "No algorithms. No endless scroll. Just your people and the birds that carry your words. Add friends by username and keep your circle small and good.\n" +
            "\n" +
            "## TRAIN YOUR FLOCK\n" +
            "\n" +
            "Quick mini games boost speed, have fun. A faster pigeon means a faster message. A better flock means a better rookery.\n" +
            "\n" +
            "## WEEKLY REWARDS\n" +
            "\n" +
            "Log in for daily drops. Claim new birds from rotating events. Hunt for mythic birds in limited time releases.\n" +
            "\n" +
            "Slow your messages down. Send them by pigeon.\n" +
            "\n" +
            "Download Roost and launch your first flight.",
        iconUrl: "38dfdd5b-a44a-4469-b751-040a03b23a86",
        developers: ["Silvia Brage", "Þórgunnr Raginfrid", "Heidi Serafina"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://github.com/odisfm/hapi",
            "https://example.com/",
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://testflight.apple.com/join/xxxxxx"
        ],
        featured: true,
        categoryNames: ["Social Media"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        name: "SignNow: e-Signature app",
        slug: "sign-now",
        subtitle: "Sign documents & PDF forms",
        description: "# SignNow is used by over 6 million people worldwide to sign, send, and manage documents — wherever they are, on any device.\n" +
            "\n" +
            "Skip printing, scanning, and waiting. With SignNow, you can get legally binding e-signatures in minutes.\n" +
            "\n" +
            "## SIGN & SEND DOCUMENTS\n" +
            "\n" +
            "- Sign PDFs, Word files, and other formats in just a few taps\n" +
            "- Send documents to one or more recipients via email or link\n" +
            "- Set the signing order and assign roles\n" +
            "- Get notified in real time when documents are opened or signed\n" +
            "- Collect in-person signatures with Kiosk Mode — ideal for events, front desks, or check-ins\n" +
            "\n" +
            "## FILL & EDIT DOCUMENTS\n" +
            "\n" +
            "- Fill out forms, add text, checkboxes, dates, and stamps\n" +
            "- Convert images (JPEG, PNG, BMP, etc.) into PDFs\n" +
            "- Import files from email, Google Drive, Dropbox, OneDrive, and more\n" +
            "- Create reusable templates for documents you send often\n" +
            "\n" +
            "## MANAGE YOUR DOCUMENT WORKFLOW\n" +
            "\n" +
            "- Collaborate with your team on shared documents\n" +
            "- Track document status and view detailed audit history\n" +
            "- Organize files into folders for quick access\n" +
            "- Store all signed documents securely\n" +
            "\n" +
            "## SECURITY & COMPLIANCE\n" +
            "\n" +
            "- 256-bit encryption for data in transit and at rest\n" +
            "- Legally binding e-signatures compliant with ESIGN, UETA, and eIDAS\n" +
            "- Detailed audit trails with timestamps, IP addresses, and signer info\n" +
            "- Works offline — sign and edit documents without internet, sync when back online\n" +
            "- Supports MobileIron AppConnect for enterprise-grade security\n" +
            "\n" +
            "## MORE WAYS TO WORK\n" +
            "\n" +
            "- Sign in with your Google or Apple account\n" +
            "- Access documents from mobile or web\n" +
            "- Print documents directly from the app\n" +
            "- Use widgets for quick access to key actions",
        iconUrl: "72ffdc60-1d22-46a9-8315-dcbf605cd6bb",
        developers: ["Tutku Magnus"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://example.com/",
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663"
        ],
        categoryNames: ["Utilities", "Business"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        name: "Bandcamp",
        slug: "bandcamp",
        subtitle: "Buy music, support artists.",
        description: "# Bandcamp is an online record store and music community where passionate fans connect with and directly support the artists they love.\n" +
            "\n" +
            "The Bandcamp app lets fans explore a vast catalog of music by artists from every corner of the globe, allows them to directly support artists by buying their merch (and wishlisting albums & tracks for purchase at a later time), and lets them instantly listen to the music they've purchased, online or offline."
        ,iconUrl: "e5d956fd-0583-4cf4-9c04-544384eee795",
        developers: ["Myranda Onouphrios", "Raz Aoede"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://testflight.apple.com/join/xxxxxx",
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://github.com/odisfm/hapi"
        ],
        categoryNames: ["Entertainment", "Creative"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        name: "FocusFlight - Deepfocus Timer",
        slug: "focus-flight",
        subtitle: "Take off into deep focus",
        description: "# Focus Timer, App Blocker\n" +
            "\n" +
            "\n" +
            "In a world full of distractions, FocusFlight offers a unique way to focus: turning every session into an immersive flight journey.\n" +
            "\n" +
            "From boarding and takeoff to staying focused in the air and landing at the end, FocusFlight combines aviation-inspired design with practical focus tools. It is more than a timer or app blocker — it is an experience that helps you avoid distractions, get into flow, and complete what matters.\n" +
            "\n" +
            "FocusFlight has been featured by the App Store as App of the Day. Whether you are studying, working, reading, or simply trying to put your phone down, FocusFlight helps you start with intention and end with a sense of completion.\n" +
            "\n" +
            "## FOCUSFLIGHT FEATURES\n" +
            "\n" +
            "### Immersive Flight Experience\n" +
            "\n" +
            "Opening FocusFlight feels like boarding a focus flight. Set your boarding pass, choose your task and focus duration, then begin your own deep focus journey. When the session ends, your flight lands safely with a clear sense of achievement.\n" +
            "\n" +
            "### Airplane Mode, Block Distractions\n" +
            "\n" +
            "Turn on “Airplane Mode” to block distracting apps and websites during your focus session. Powered by Apple’s Screen Time integration, FocusFlight helps you stay away from interruptions and focus on what matters.\n" +
            "\n" +
            "### 3D Map Window View\n" +
            "\n" +
            "During your focus session, watch your journey through a 3D map window. As time passes, your flight moves across the world map, turning focus into a journey you can see and feel.\n" +
            "\n" +
            "### 3D Flight Routes\n" +
            "\n" +
            "Every focus session becomes a visualized flight route. See where you departed, where you are heading, and review the routes you have completed.\n" +
            "\n" +
            "### Random Route Mode】\n" +
            "Not sure where to fly? Start with Random Route Mode. No need to choose a destination in advance — just begin focusing, and discover where you land when the session ends.\n" +
            "\n" +
            "### FlightLog\n" +
            "\n" +
            "Every focus flight is saved in FlightLog. Review your departure city, landing city, focus duration, flight distance, and route history.\n" +
            "\n" +
            "### Membership Cards & Flight Miles\n" +
            "\n" +
            "As your focus time and flight miles grow, you can unlock and upgrade your own membership cards. Each card marks your progress and gives your journey a stronger sense of identity.\n" +
            "\n" +
            "### Multiple Map Modes\n" +
            "\n" +
            "FocusFlight offers 3D, satellite, and classic map modes. Explore routes and destinations from different perspectives, and enjoy traveling the world while staying focused.\n" +
            "\n" +
            "### White Noise & Focus Music\n" +
            "\n" +
            "During each focus flight, you can turn on white noise or focus music to create a calmer environment for studying, working, or reading. From airplane ambience to soothing focus tracks, FocusFlight helps you enter a quieter, more focused state.\n" +
            "\n" +
            "### Focus Records & Data Tracking\n" +
            "\n" +
            "Each session leaves a clear record, including your boarding pass, flight data, route, and focus duration. Use these records to review your focus habits and see the value of every session.\n" +
            "\n" +
            "### Different Focus Types\n" +
            "\n" +
            "Choose focus types through seat options, such as study, work, reading, or creative time. Make every flight better matched to your current task, and make focusing more flexible and fun.",
        iconUrl: "594d534e-99cd-4041-93c1-46c273a848ec",
        developers: ["Gunta Ingulf"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://testflight.apple.com/join/xxxxxx",
            "https://example.com/"
        ],
        featured: true,
        categoryNames: ["Utilities"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    },
    {
        id: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        name: "Mr Health",
        slug: "mr-health",
        subtitle: "Personal Health Companion",
        description: "# Mr Health helps you understand what’s actually inside the products you buy every day.\n" +
            "\n" +
            "Scan food, cosmetics, alcohol, and pet food to see clear, easy-to-understand breakdowns of ingredients — without the confusing labels, marketing fluff, or fine print.\n" +
            "\n" +
            "Whether you’re standing in the supermarket aisle or checking something at home, Mr Health gives you the information you need to make more informed choices.\n" +
            "\n" +
            "## What you can scan\n" +
            "\n" +
            "- Food & drinks\n" +
            "- Cosmetics & personal care\n" +
            "- Alcohol\n" +
            "- Pet food\n" +
            "\n" +
            "Each product is analysed and rated using a consistent, transparent scoring system so you can easily compare options.\n" +
            "\n" +
            "## How it works\n" +
            "\n" +
            "1. Scan the barcode\n" +
            "2. See a clear score and category\n" +
            "3. View ingredient insights and explanations\n" +
            "4. Compare with better alternatives\n" +
            "\n" +
            "No guesswork. No digging through labels.\n" +
            "\n" +
            "## Free features\n" +
            "\n" +
            "- Scan food and cosmetics (limited daily scans)\n" +
            "- View basic product scores\n" +
            "- See alternative product suggestions\n" +
            "\n" +
            "Premium features\n" +
            "\n" +
            "## Upgrade to unlock the full Mr Health experience:\n" +
            "\n" +
            "- Unlimited scans\n" +
            "- Full access to alcohol scans\n" +
            "- Full access to pet food scans\n" +
            "- No blurred results or daily limits\n" +
            "- Priority access to new features\n" +
            "\n" +
            "Premium is designed for people who want the full picture — across everything they eat, drink, use, or feed their pets.\n" +
            "\n" +
            "## Our approach\n" +
            "\n" +
            "Mr Health uses ingredient analysis, nutritional balance frameworks, and additive research to provide comparative product ratings.\n" +
            "Scores are designed to help you compare products — not to diagnose, treat, or replace professional advice.",
        iconUrl: "c6409053-52db-440a-8583-3e2a9ee60383",
        developers: ["Emiliya Aada"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://github.com/odisfm/hapi"
        ],
        categoryNames: ["Health"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: false
    },
    {
        id: "3ef625e2-3796-4756-831f-cda3d46114ab",
        name: "Yubo: Make friends & chat now",
        slug: "yubo",
        subtitle: "Meet new friends, find your bff",
        description: "# Yubo – the ultimate social platform for making new friends all over the world! \n" +
            "\n" +
            "With millions of users worldwide, we’re all about connecting you with like-minded people in a fun and safe place!\n" +
            "\n" +
            "## A FEW THINGS YOU NEED TO KNOW ABOUT YUBO\n" +
            "\n" +
            "1. SWIPE TO MAKE NEW FRIENDS: Use our swipe feature to find new friends who are online and share the same interests! With just a swipe, you could meet your new bestie!\n" +
            "2. CHAT WITH FRIENDS WORLDWIDE: One of the coolest things about Yubo is that you can chat with people from all over the world! Whether you're feeling silly, want to sing, dance, or chat about your day, Yubo has got you covered!\n" +
            "3. FIND YOUR TRIBE: At Yubo, finding your tribe is key to making lasting connections! Thanks to the Tags, you can find other people into gaming, beauty, sports, music, dance, and so much more! So, whether you’re a gamer, a makeup artist, or just looking for like-minded friends, Yubo has got you covered!\n" +
            "4. IT’S FREE: Yubo is totally free to use!\n" +
            "5. IT’S SAFE: We take your safety seriously. That's why we've designed many features and tools to ensure you can use Yubo safely.\n" +
            "\n" +
            "So, what are you waiting for?",
        iconUrl: "fb634641-fc81-4342-9f52-0dd154a22781",
        developers: ["Muireann Onnophris", "Mira Nontle"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [
            "https://apps.apple.com/au/app/rmit-app/id1584926663",
            "https://testflight.apple.com/join/xxxxxx"
        ],
        categoryNames: ["Social Media"],
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        },
        published: true
    }
]

type NewProjectMediaType = Omit<ProjectMedia, "id" | "status" | "order">

export const projectMediaData: NewProjectMediaType[] = [
// Instagram | media
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "b097a9d0-30d7-403f-b731-f7b558dc7951",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "62ce8ebd-8465-4520-b37b-70c950a59066",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "35329df3-1104-48c2-8afe-e9a92a5b6155",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "454f37a6-8763-406f-b964-8105f928b632",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "b6b60592-04eb-4742-b802-d54af775fddd",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "546e1466-c6ae-4442-8323-89af87397e25",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "758421d3-4410-4075-acdb-67ddc6210c91",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "0174b2a3-b3b6-473e-8bcc-e0bfcecfe82f",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "25abf8de-e73a-4ff2-9c3b-e20d36c89619",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "b8fc2939-d52b-4e1a-81b5-a8c9bcf5ab59",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "dd15e00d-ea40-40f5-94a3-a7c14bbb093b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "3f3a8529-996d-4dc0-ac8e-cb9a5a53f503",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "6afa7baa-b68e-4626-9e33-00af456c4d2c",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Smart Receipts: Expenses and Tax | media
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "28a9717b-8c48-43dd-bc62-cc3b6ab64825",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "54a747cc-5aed-4ebd-afb4-348afc995e6f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "1824020a-96d5-4895-b604-1af8951ded7b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "b1461ec9-a779-43ca-97f7-27ff0120fd69",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "b5fa67d1-e04d-4e64-b3ba-f51c9b06d8ac",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "1a1515b6-8214-4c35-b999-f05624ba13af",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "b14061bd-12a4-465d-829d-b0c8a9e31722",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "b4099327-38e9-4a1d-b95d-966df46303b3",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "2276a343-ee92-4c83-9ae4-e2023b5621d6",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "810951fc-4ae5-43da-aed6-695455af3a2e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "11fd52b0-0d78-4ac3-ba06-f44a5ce73fa4",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "adddcfe9-d08d-4dec-b906-4633495b1d38",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "d73333fa-1831-4afc-ad62-7ac6a82297fe",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "e522a285-954d-40f0-9896-80f4935ef580",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "cf6118a8-f740-4796-8088-582436a5bd56",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "4c7d36fa-af1b-4387-8ed5-5ef0eac1a8a8",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "b3094caa-6fb9-4cc8-b0db-618dd81071e1",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "4e2b619f-30c6-4437-a352-2bf96df8c8a4",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Substack | media
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "43fef47e-5409-4734-a09c-90d8969e1e4c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "5aa25382-100f-4a54-9e51-30da945f65eb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "5c7aa57d-6d5f-41af-ab35-4b1352b357fe",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "8f921a20-72af-4fc9-b555-c9b27328dcc6",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "2a4fc353-c4ca-4bf9-b79f-7e11be15886b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "89bac716-23cb-4e5b-b0db-4e9948df43ec",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "db192d8d-9483-4a6d-8c21-b4d6a3ecd961",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "747d14fd-0001-452c-905e-1d850e6d128e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "9afc7b17-4c76-4945-b95d-769ee472f768",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "65f84c2a-60a4-4151-addb-6d917f3e830b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "62325336-f08b-4e4b-bdbd-172eae6c2aa4",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "014de237-f531-4117-93b8-c443b8d19b59",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "16f05186-17a7-4619-b59d-529ef7513118",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "56441972-4f19-4ac3-8e75-60edbf917be2",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Patreon | media
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "763fe7b8-0338-4e12-b144-444852becd8a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "0a97c478-3ce6-4e9e-b7d7-119477e17d89",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "ee1d96cc-62d5-478f-a3d6-90cd8cc0439d",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "fbd291ca-c39a-480a-a7f5-c37754ce04e1",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "ca99aed3-2880-45ff-be42-4e5e7f482995",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "33bd2d04-8d24-425e-8814-e44d4cfb3e65",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "3b8b25c0-f67b-4d87-8ed6-3db2cc153977",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "b7721f0c-7508-4dc5-bd07-1d6f11e6773b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "62f36d8a-3ef3-4840-92b8-4621f57b47b5",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "bd12bf57-8c92-4ca8-9a3b-f50fc1b86549",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "8384d3d3-8129-4904-b754-b2c2f3e33a3d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "b09f8817-5a75-409b-8cd2-77e25b2d996d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "e8ba8bb0-6c49-46ed-ab5b-fa63db6508a5",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// DocPlay | media
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "e59c81eb-abb3-4bf6-8afa-8129780656d1",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "bac54893-a602-4841-a1c0-42ee619d6674",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "ac5efeb4-1a0a-4cce-8410-4f06b5dd5ea5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "bd05b525-4ac5-40ce-b479-025ca65617b6",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "2e27d8dc-cf71-4f10-974d-0049911a7c61",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "f9b74c24-1df4-4058-85be-a5de43c49b56",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "c00b8f99-87b9-4f17-8657-e8c4af287d12",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "80e1c923-6329-4e27-ac23-f4de79882f66",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "fac7a053-a8bb-47f3-b365-029dc0ebc216",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "f3d87d2d-aa98-47e5-bb53-b3c53661eb52",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "06c78d84-2cf1-413d-977c-25588c0e42dd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "85fb2fa6-305d-4a4c-a9aa-1a6e6e49a16d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "271496a3-ea46-4743-b814-94acbfcfa839",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "0603f09c-2c4c-47d5-9fb5-137a23f0ebde",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "b5632454-78b7-4d8d-933e-27be07b6933c",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "5e08fe68-d83c-46c8-ae92-6f093d9b8edf",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "5cb299b5-88b5-4073-bbac-24a8c77993a5",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "070a67e8-abd0-4a26-aac6-6d85dbddf721",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "a0267466-6507-4acd-a10f-d3e0ae487cfe",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "efaa5b5d-b36a-49e5-a4d4-50c432c1a543",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Letterboxd | media
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "89e0a985-6ad5-447a-95b9-ea93a06602ed",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "c0ef2377-2c0d-4cb7-9085-1a4b9959b940",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "d508fefe-156e-4eb7-af15-619da225922a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "771167ed-db33-4e52-9faa-866f33d4ff8a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "c4412f3e-c749-4acc-a441-6be5e8622b26",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "76f718a4-f216-4b20-85c0-27a2a4796ff9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "736d2b28-ea87-456f-9d83-5fd4d70755be",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "2e00b5c3-aaae-4435-94d2-db3a5e1dd2d9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "b67c4326-3d92-46bf-bfc7-dec1afa8bc12",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "21cc8770-b481-4e62-a469-d664692fa756",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "132d96be-87a0-45c0-8eb6-17683831800f",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "36b1b56d-5e81-48d4-867e-1ebfb85fd29b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "db007f17-8d63-437d-b84c-0ee3c48daf37",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "fdab96db-c0c3-46fb-95c1-78348e4c6cc1",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "89f5589d-8ece-461c-a142-58d13ffea0e1",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "d439dcdb-0806-472b-a84b-cd797b0546a2",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "aea4919f-3b4d-426e-895e-addcfcac3d38",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "25c8b39a-2e5a-4cb0-89a1-2112a4bb2e05",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "3061bdf7-bbd9-40ea-9303-5b4f8221b803",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// ABC Listen: Radio & Podcasts | media
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "1dbdce34-91b1-4e27-9117-3aad71f08733",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "b788ba5d-4816-46ec-bb1e-e7196412dc1f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "8be8ce3c-fd6e-4458-a721-480569ca05e5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "38894ed6-d760-4161-95a9-887c7c0838bb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "7154b993-8216-483c-8ed4-ab1779ed1a62",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "12c57d1b-6e5e-4d18-bfde-d44f2444ad50",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "40272007-c3c8-4247-87cb-a77ae1193813",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "72b56f55-d58a-459b-bdaf-f070128a2c11",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "4a92b4a9-d97b-429b-b681-0ea31c0a9926",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "68d0a203-553a-436f-a9ae-29f3a61a5a77",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "c908c189-cc8b-4ac9-92ec-417824bd48d2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "2ffa581d-aa54-47e7-b6d9-3d25ecb676fc",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "bf81abdb-1b16-4455-b159-a8a8e12fa229",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "27e70328-62ec-4c2f-8671-948e7e0b1547",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "516e70a0-c2a5-4f8a-a688-d22deb0caca5",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "0e312385-f065-4fac-9a9e-c7e4dee36865",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "7dfb8719-b9d0-4a28-bddc-0e65dd077475",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "cfa8f1f6-bb6b-484d-be35-ff3ffc5ee8a4",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "63482d7b-d9ee-44f4-b9cd-a264ec84124d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "2264abb1-baa4-4dd0-82a4-97c6c00b46f5",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "96c2b823-fa71-4119-b469-453a8bf48139",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Discord — Talk, Play, Hang Out | media
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "830c7738-ab1c-4e56-be91-89ad4912abd6",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "c14dbaa9-4cf0-490b-94e1-60a46bb1a469",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "10613168-dc20-44b7-a241-7f0316b22400",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "284f7109-1fd1-4a8f-a3fa-ec06ebd7152f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "d61e3593-fa06-49cf-acce-de68a851ecd4",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "178e1de7-72d9-445c-8b41-fda5deec4447",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "8a942e8b-b70f-4646-8e79-1ccfcad786d2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "da94311b-3462-4eb4-a397-88ec84290aa2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "ee7503c4-e248-4b7c-acbf-c0533cb96787",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "ef4331b4-f6d6-432d-8dea-21fb89e67ca9",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "afceab39-198c-42d7-8f19-32e598fdca80",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "211bcfc5-2a84-454c-80ca-4a2a7fe71e5b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
// Twitch — Live Streaming | media
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "a4ca4099-9296-470e-b1ab-a87e7950577a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "b35fc525-8146-4b5e-8acd-423e32e8c6d1",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "d07c8f69-839f-4017-9414-75d380d31fac",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "b920f3ef-e74d-4a9f-a31d-7d0fe05e0826",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "488e0559-7752-4824-809b-9e2669fed3e2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "d35c3142-11f5-4de9-9aa2-e1b24111b9c7",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "7446690a-22dc-4f2f-8dc7-b39e8f6aa70b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "d40987be-a7e8-4757-ae85-ce6acde0e907",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "48b7c70d-037a-4651-97c4-a2227cd0c3ac",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "c69fa639-a0fe-43bd-b67b-cf80514f093c",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "ce95307a-4880-42d8-b755-5ac3435ac39e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "7c803a50-d67c-4bb6-8eb1-457139642291",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "73c67c05-e7ff-4854-ac00-af03b72c0c5d",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "00203c4e-884f-4f98-a9ad-d22fb609ace7",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "e8672dd6-4663-4aaa-812e-64e89f0cb2b4",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "4584de49-b2c5-4927-a875-bbd0b2e717ef",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "799dfbb2-4515-4c39-99e2-13f33625e74d",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Bluey's Quest for The Gold Pen | media
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "bf549459-14ff-46a6-a0ca-4375939e5d7a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "c40f2336-176f-4cb8-8eeb-22b210e554a9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "17382c1f-2d90-462b-9d87-f8c30f493185",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "e0cee32d-304c-47b2-a69e-24103b990c44",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "a8571123-7aa2-42d1-889e-6b50b90cdfd0",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "da53e775-0741-48f5-983c-b69bb212cffb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "9df504de-ca8b-4d1b-952d-998ecf47db87",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "8cd7a9ca-8f7d-4559-a85d-724911a08dae",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "300c9e53-522c-4c27-86b3-6f52ce04d9dd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "a37d0181-b0bf-4565-9628-b82c554a333e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "ed7d6685-df01-4194-bec8-a25c92ab4bd2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "6a14460e-4c05-48ce-8ee3-c285c2078bce",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "0e6c6d15-3a5f-4b8f-8d2d-9f7cb7ded10b",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "40750686-f608-424e-8801-f45f22d4329e",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "3d875880-c724-4798-92b5-88ab1e4bbfc5",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "98d2b68c-60fc-474f-a82c-ed559acad71d",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "f48ce1eb-1645-491e-a965-cb71423e2f4d",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "6b51e93c-9aec-499f-af09-3dbb6220cb46",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "29ba06b5-f995-4575-8997-f01adc325943",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Duolingo: Language & Chess | media
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "90e35039-b6dc-4de1-9bcd-62f92c73f070",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "9ed59ab8-2012-489d-8fab-7fcc3654bab1",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "7dbb1b7f-8574-43dd-bbf2-e41d86e63bd1",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "eaa7e0e9-4f22-4de7-9abc-b048ece0e99d",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "646964fd-d9ef-448a-898e-b156153a10c9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "ac559e2b-c3de-444f-88cc-cdfc8c4bc0eb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "e2ddd16a-52e7-46f6-86de-92841e8cc590",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "8258a39d-570c-4a3b-804d-6285c8ee2b35",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "a46492bc-dcd3-42f2-b62e-5a1372dc7e16",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "72f108ae-c4da-4ee7-a7e4-9b4ea822e8cb",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "d9f00e7f-dca0-4e30-86db-d47f59aa783e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "8a25bb68-bbaa-48f1-b6e2-0f493b741b73",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "113e9c40-9952-4c03-bcaf-c5fdfa8ed6c2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "71682e56-308b-4e22-a9b4-8e4a72936b42",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "d4de5296-1fac-4b70-8c55-f3f56dfe3f2c",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "6f21a05e-6a21-4275-b0a1-3d905bf1e304",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "ac976f7f-dad7-4a87-9ec7-0c5be2264130",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Simply Piano: Learn Piano Fast | media
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "e9d498fa-bb3a-4e4e-864c-30815cfd0f8a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "18b4a0a6-6e21-4f5a-8955-38b1c1b0acf9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "8aa49b71-5c88-4996-9ce9-9d7a35e43e26",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "7c0a8211-4f6d-43a8-b911-bedb37be80f8",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "391d8f4a-b696-428a-afad-0f4c0f0c568c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "2ce9d712-0e66-41c8-a533-c889214c7625",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "63414d28-1132-424d-ae3b-a05be3968c1a",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "e9fb0b24-40cd-4330-8348-71083a1353a1",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "532f0273-4fa4-4ce9-aee2-00814b96362c",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "288860dc-8bfc-405d-aa6d-a958dc3a4f0b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "ffdfee73-fb96-4365-8b36-64857b376aa3",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "829dfff1-062f-4d91-95ea-29c3d3fd302b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "f1c7cd60-5143-4f6b-ae0e-aa657e62e6b5",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Elevate — Brain Training | media
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "dd0d4266-a724-4d61-ae88-d90206eace1f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "ee37a3d1-79bc-444a-80dc-1ad9cc5e0185",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "d01b2b99-bfca-4b1f-b40f-0f0e4788c1cc",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "4d547cd9-8ff7-46a8-ac12-8849ac4ecec7",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "53de9b8a-ed95-46c0-b3f3-44f2aba3a080",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "f37ccaad-31ca-441c-8f35-11b80b8e3d3d",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "1a713967-2d6c-4284-8889-f622af72e3a4",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "03db1327-931d-4062-af5b-dd9b59041233",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "2f7fc408-cb1f-4bf6-8204-014d02015837",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "5a02c31b-3fb4-4184-a2a8-68aed788aa07",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "f0b7c9cc-9291-41ed-b6cf-37ccd3fe6015",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "20b65b20-9c30-44a7-a487-d553f8b89e64",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "6b8cdfb8-42fa-4ed3-a01f-6d6ee4cfec32",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "2446bc37-11b3-43cb-abbf-73a786e5776e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "1c1ddbd8-5121-44c7-a93d-1787c57ae525",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "56b62873-06c0-4e0a-82d2-85b5eb311d0b",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "2817e2a3-e360-4b9c-91e6-cf1aaaba0222",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// LinkedIn Learning | media
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "0a70ef71-8024-420c-a51f-1ecba6b3c6cc",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "89c2cec6-c7d6-4be0-be2c-a339d9963a54",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "29a17ad9-5be9-44e2-891c-799bd80ee08a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "44bc8647-c8fa-4c85-a520-b66fce666aeb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "9b712a2c-2e7c-405e-8dfe-d7edbe2f2b57",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "a61c82ce-1a14-4076-879e-1762c31e6a00",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "822a4969-beb2-4fa3-80e6-3b90c85ac273",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "6500f1b8-cea0-4bb4-ad7b-72435bc69fc6",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "e0a53520-43ef-4fb1-b1e8-bbf88e98c583",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "af914130-f65e-4984-a4a6-d79adb582eac",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "8300f072-8714-40ec-b070-26317dd6e64d",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Candy Crush Saga | media
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "856157c6-d554-4820-a77b-24cd46780708",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "75bf4539-720d-4728-980e-b4f1080849a2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "1ab9db46-d3a3-4632-854b-897d6ad36cdf",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "a9839563-1dcd-494e-a0e3-375217917349",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "0a54ea8b-d899-47a7-9660-1a06b5f60902",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "cdd92bc8-498d-4270-898c-ede35964a4c5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "5756fdae-8972-4fa0-9da1-3e57d5feb89c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "39d68232-59b6-4830-9181-44c87a5c20bd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "4c64de5a-07d4-4fbd-b343-f98e2ab31899",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "455a90df-90f1-42bd-9b3b-f7986a443cfd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "a328fbb6-464f-4dfe-87ba-fd8216ad627f",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "17e1bc87-bf79-41eb-8421-e46484984f13",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "33d4c2e4-1e35-4710-8b10-2960e2fab687",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "064ef021-fd6e-4951-b922-cf4d4f300a49",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "0d316913-f04e-4d13-889d-ca52562632e4",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Splitwise | media
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "231b74a2-70fc-4d99-ae23-aa0f959e63d6",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "ab180d92-f52d-43d4-b638-89d7c943fb4a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "4d60444c-18a7-44bc-bbe4-55e41c871669",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "1facd3d7-4ca9-4c98-b2ca-5bdf27fc8593",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "6b72aa5d-bd7c-46cc-ac83-4ceb53a22e89",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "5bb081cd-5927-42d0-95ee-9fb8fc67d778",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "902fe609-6653-4d70-b7e4-c0bbbd9f2f85",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "03742556-0246-48f5-ac55-6e2925fd1432",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "17f2efeb-67ac-4468-b6cd-af760e577876",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Strava: Run, Bike, Walk | media
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "c780a139-2dc3-418f-8a50-f5df9321a02f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "f8bb1b20-5444-443e-b399-ea8ba1b894a3",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "602d84f6-880c-4f56-85b0-eed9c88e8457",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "abcbccd4-2fee-4e48-b924-c7a89780c776",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "8f14ea74-0449-4de5-8e1d-d007d7b29899",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "a8c0c9c1-2928-48ab-8800-327a1dfe2d56",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "9fe90c48-3a37-4628-8604-835748c91c73",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "4b2f650f-ca8c-43dc-ba0f-07db4071a88b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "ebd0f8c9-0ac0-4853-972d-ebbd89cec91c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "cabf33d9-c790-41c2-afc5-ac8a7f138259",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "dc455b77-ecb8-4c04-9dd9-3ef3d9dc79e7",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "6b1ea09e-8501-4c88-ba06-c64b2859b2ef",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "75b4bd7f-0a4c-4eee-955b-16846d427122",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Blackmagic Camera | media
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "5508f727-69b8-4339-a510-f8968f5c7abd",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "2e72c623-ce13-433e-9267-dc551f2c0baf",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "6ec5be40-c836-4cad-aecb-f05d47ef5944",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "3a71e482-0440-42e3-8392-9e3527cdb7bb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "2a489c1e-6bc7-466e-9588-d6cbcd85e231",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "c733ca25-726a-4989-bbbb-7ca15f7f8f99",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "c461220c-fe33-4b69-9d98-8c5f1fe20267",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "19931e4f-b99e-48e2-8e87-8864e7c018c2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "6b6724a4-a9f6-4ee5-9292-ae16b8810838",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "c36f3b6e-81f1-46b8-91da-b95692f1475c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "64a821e7-2739-43fc-b076-efdf24fc4567",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "b6553cab-8e69-44c1-9848-e36c6af5b198",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "dc8858d5-42c1-4650-8c8c-f79e09dc5dab",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "626c3cb9-8965-4879-ad84-d56515bd3741",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "41173b51-0919-4dc2-a833-00c52d36c9ca",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "7e075a4d-52ba-41ec-8d79-ba133ded5d84",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "0cded98d-1d98-4e39-872c-6e21b9a836b5",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Microsoft Teams | media
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "89c1fc75-5c57-4253-9055-530f2b8a1745",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "f2a01bba-3fc7-4d14-ad42-20721e6b6511",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "dcdd0169-00fb-4f38-b65b-a08d789eaaf3",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "a9e2dcbc-eb1e-49d8-9661-6fc864d2dacc",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "53175989-b604-432f-aaa2-63cf2a59d77d",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "3fe20c61-e274-46c8-b6f8-b5978aae1b50",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "e50f19b7-a507-4b74-b8c5-3461620b6673",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "bcc14bb9-0e69-4d4a-aa83-fbfa00fb634c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "990948e9-6ecf-428f-a5fb-37f15e4b9788",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "3e9d321b-da5e-4f21-9c82-dfaefe0b491e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "dd68c6f7-25d5-4d5c-95c5-6360dfb03122",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "c21071b2-34e2-4f98-818f-3f9a93fb4ea7",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "e4aa64e2-7f2f-4e86-91cc-ecd461686fef",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "60cb109d-be54-4f37-9d1f-ba87b35e74da",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "02b10de0-ba8c-4926-8c80-26afbb6cb0c9",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "64d47be2-cf1f-41cc-b2c1-087f61cd67c1",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "7fc3dd09-242a-4189-918b-60b701aa8dd0",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "847f1655-836c-4bc5-bd87-ece10fe1805a",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "695de116-d656-4149-9053-64ed60f53592",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "0ba68d7e-6a16-4e0a-899f-77b0326b6c55",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "012a3082-23d9-4aea-aab9-029d14a84052",
        deviceType: "AR",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "763e863b-1879-4b58-b046-488c6621045b",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Snapchat: Chat with Friends | media
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "1299ef9f-b819-4b4c-95bf-31cb61eeac7e",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "2191dad7-1472-4d09-a0c5-42cfa82af4ef",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "ddf904f9-6cd0-4e33-84ab-ae6a8622857d",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "ca5749c4-4d71-419e-bc8c-60f2c135035c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "8d2e4b00-22bc-4918-b46f-4bc989d264cf",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "b4f19508-b07d-4f1e-afc1-6072778b5120",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "93d1745a-6252-4a88-a476-11d307b3f50e",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "7031164d-a63d-457d-b253-feb0ab861967",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "45e5b6f1-ac2e-4d51-aeaf-7f46c15d2111",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "3eaac55a-21b7-43cb-9ab1-58eadb7ad555",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "10165b6d-4233-4154-9ec9-8f6dca750a0d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "60045709-0187-4d1b-9b1d-6fca72b93852",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "da4c5153-eed7-4fbd-810f-b46f66a33203",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "bba056e7-fdf0-4dfd-a56a-6219c3e150b7",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "0bdef352-b64a-4949-84fb-1716f8c753e6",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "60b52059-58a1-46f5-bf0f-66bf732e213c",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "13d6562b-dce8-4b47-a4db-02b7abf6af67",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "f5fc7ff1-09c4-4fff-bcc0-7122255bb252",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "95a9c15b-d60f-42e2-a2d5-861e724962b1",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "17a7701e-1868-4406-8819-37986abe2786",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "1fd3bd1c-a71a-4d42-8d39-d4c6e09a3e8e",
        deviceType: "PHONE",
        mediaType: "VIDEO",
    },
// Swipewipe: Photo Storage | media
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "c8122a9b-6e55-4894-9547-2eb02eeeb12e",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "df38e7f9-7e9d-4819-8a39-2908a96a4e23",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "6fa35727-86fd-49ef-bb60-0f10b5471aef",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "b34bce67-484d-4fa0-b850-16767de94b5b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "5c9d4c47-f480-4aae-b4d3-921b85308239",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "3e2c9426-a39f-4083-b688-f86455ce1175",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "eea6fd0d-f906-4e1b-99e8-5dd2bece1995",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "dd84d890-ffdc-4149-98a7-48491afa71c5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "c5deeb22-f36b-40df-aded-8168e8497b7f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "f93aa04a-a0cb-4ddc-bbfe-e5de6904af4f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "38fa7431-78d7-49f4-89ed-4871c7716dbd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "eb28a7fc-d681-4f2c-87e7-2b4b172d88ae",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "1caeb27f-a450-4d47-a768-ed59881cbf70",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "0706600c-e040-459b-b126-76ab235e0150",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "9c325180-f32f-4f13-a6d8-9231cae36e38",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "7a016e6c-1822-49bf-84d2-ecca48a67123",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "00ba6c5c-54c1-4f33-8426-13342ba10d1e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "42d838be-4914-4b1b-9f49-ed1af0ddde5e",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "f2978391-9e8b-4ca2-a826-f4e8f09a29f6",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "96916f9c-ae92-411b-bb8a-b0ac090be913",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
// Pedometer++ | media
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "05fd7279-e9ec-4827-ab3a-97023ca1e0e9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "eb8025da-b069-4900-a47e-92e1474f03b2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "f02d24d4-0afe-4f91-8e51-408157a16cf9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "518f6b79-7371-4cde-adf2-532baaca9782",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "d650315e-70ed-4524-a737-b70dc6b4ae5b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "57b74e78-0bf9-4702-a586-42ab7e0f7069",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "079c44f5-78cb-4100-a1cb-8461b999080a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "e1dec752-a579-493d-8d1c-8ed12ae95ee5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "2f261cfc-0cdf-4354-915b-a668d516fbf2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "04878d7d-5c6d-4b0e-92d6-65e593700c36",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "a93088dd-f2bb-4afd-95c3-70183cff61fd",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "6c031aee-a394-4072-9979-67dd05624370",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "f69545b2-5ee8-4148-962b-4dd5dda67333",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "a56ca8e4-cbe8-4077-8ebe-be705a1ad155",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "e19d6ef5-a238-4ee0-87f5-ad53667640d2",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "ef529630-c8d0-4bfb-a552-b5fc070b2c25",
        deviceType: "WATCH",
        mediaType: "SCREENSHOT",
    },
// Hoopla | media
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "b9bb65ad-1da6-4a0c-b100-29be70dfe443",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "6e047b24-b844-490a-99b8-7b8b21363b4e",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "78d27554-4f42-4f9d-ba54-0d08270408f5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "046a20c1-8a01-4150-ad2b-98bf7ed6661c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "f150258d-e4d6-405e-97d0-36d20d0f0c64",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "b9d15bbc-630c-4170-bfd6-b466b25803f5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "4bcff63d-4c3e-4c1e-af9e-5e022900449c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "58c7279e-e319-4362-9a79-87b3634a9c53",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "e5f1e2ee-8fb1-42f0-9ed3-65b6a13eea01",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "6e478a40-c88e-4ae1-bafa-acd9099e8460",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "6b9a8727-5820-420c-8027-d425bec89ca4",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "5d30a948-4f81-44cf-98a1-ffafcd59ca61",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "ec7fefa9-452b-46d7-ba91-8fd6cd3ebfac",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "76694321-b1f2-416a-aee6-9396c7d71fc4",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "22a46690-e516-4057-8236-0efbd95ad769",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "a92ee4db-2989-46c0-8ae7-8fa763de34a7",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "d33c4209-77fe-4e98-9883-eacf70b5557b",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "fa113719-08d4-4b3b-9870-22eaacc51147",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "01814c35-8d81-44d4-94fc-18ff0a42964f",
        deviceType: "TV",
        mediaType: "SCREENSHOT",
    },
// Roost Social | media
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "ede04795-2d71-4b32-9837-d3b86dc1a1d5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "a02b8ad7-1529-44f7-af7f-697fb0587813",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "5d08913c-ef09-4fa3-85ab-26c2aaac96de",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "ca8c5c00-5d9b-4df2-99cd-1b7da7bc0fa5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "a3bc3a5a-a558-4d5f-a06b-a8f5f5d9b3aa",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "d02bcfa0-3965-4699-85f8-00285ba23fb9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "3e2aa064-1998-4973-aa22-f1e7730f6d39",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
// SignNow: e-Signature app | media
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "0e65a315-6a09-419d-8cda-95dc743dd57c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "ca00a782-c6a1-4356-a52b-edd9c8f47a18",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "f879f93a-5a01-4290-a21d-47d754ff434a",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "a724bfbc-91e0-405e-b0af-cf0a8f2e1b94",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "363aee33-bcd8-44bd-b1a0-dc3ff8f1440c",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "a13402bb-ae12-4ea1-b8da-4afdc3ceedf0",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "29b97ae7-3bfa-4b30-aea5-e14cf3c658a9",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "3885d245-30fd-4404-9e9a-ed8f3a66368a",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "6cee9916-4d78-4f81-bd37-87e699afe6b1",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "a231e9c0-4cac-492a-9dbc-cfbe084d5faf",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "4d8d5604-a7a4-4705-a1d3-f36f7c80f2b3",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "b2b85186-94ac-44c5-b93f-e3fc3a5046fd",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        mediaUrl: "069781dc-82e6-456c-a929-0d6645dbc865",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
// Bandcamp | media
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "6a757d11-b363-477e-919c-d3fa05388936",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "68e33baf-8de7-4b0b-98f8-6b3e992bad38",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "fb400b80-c2a4-4e7d-9fdc-e833026c208b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "4f124683-7e23-4c86-95da-8afe793783cb",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "69bb0c11-3954-49f9-b593-568975fbd853",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "b1c333f0-204d-45ff-b239-f371cdd78a25",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "9ab8064d-032b-448f-9bb5-7aa3475c1499",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "5f1cd75e-6dc7-4306-bfde-507747702730",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
// FocusFlight - Deepfocus Timer | media
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "56e8f86a-4bab-469c-a0a0-640105fab59f",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "83f2e0e8-84e5-41b1-856c-e457ad5e6731",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "8de4e2ba-3ba7-47e6-aa83-9ab357f4928b",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "3030c893-8bf1-44a0-87a2-ba454ad18d07",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "c7372dc3-3a0b-46ba-bdc4-e9a5b4b7d3d6",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "8605093d-299e-420b-8af1-6baae6b94f78",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "611e080f-43c8-4edc-a532-9462a052de15",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "2ecbb8d6-17ac-469d-bfd5-456e1eddbd44",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "8bae6db1-85a6-4215-b428-afda3b3c12b8",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "8a2b282a-bdc8-42b8-9ece-9082c171093d",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "7444af72-3208-4059-847a-a8605e7059cf",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "9a3b8b05-8b29-481e-9772-021edee1cc13",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "e08bc919-3c9b-40f8-9bc9-7ffef9313ac2",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "265bbb8f-5731-4cca-bc11-dd0bd6d835c1",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "6662b641-fa41-4a03-8df3-f8161e23ea6a",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "2415f30c-293e-452c-a656-9663e0c1cf56",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "00558d7c-3887-47c8-81ef-2e21ba02fb9d",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "8c3e65ce-ad22-4a80-836e-0e7f8c1b91e0",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "f19c67dc-e664-4462-a41c-1f4a3d7b38df",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "7a723254-3492-482d-b4f2-9cfa1c44d0d7",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "dda16853-1630-4bea-898a-0b9c9ee661e3",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "95cedd51-ae4a-467e-a89e-9d0547f52092",
        deviceType: "DESKTOP",
        mediaType: "SCREENSHOT",
    },
// Mr Health | media
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "f293d9f5-4285-425a-bec9-ee386bf01d87",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "dfe2be9a-40bc-443b-98aa-237f54162e95",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "c54fef1d-0811-4a4f-990a-55e2052c4158",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "446808dc-55d1-49ed-a7f8-22ecb964d0bd",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "c20ac7b5-52fd-4db7-b86a-4adcb3131da2",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "3c258c9d-f19e-410f-b115-8f18f5e9cf74",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "aacbf23d-f67f-4397-9bde-37d0f539e7bf",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "1d472d25-38d3-49e3-a96a-d7b211fbd365",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "39084593-02a7-489e-8319-f2462d8d2000",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "7bb9533f-647a-446b-8d61-5bf6e45ad962",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "decd1344-fd1c-4fb8-83af-70b206655129",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "131d262d-365d-4336-91e6-3e4ddd44c7a8",
        deviceType: "TABLET",
        mediaType: "SCREENSHOT",
    },
// Yubo: Make friends & chat now | media
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "f6756706-d729-4d2f-a454-e5f709fc40b9",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "11ae9a0a-46d7-484a-ace9-9cb0f75a508e",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "78d63cb8-3687-4c91-8ef5-101fdc6e27e5",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "04eef0aa-0cac-4e7a-8254-dc149e10e2ae",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "e7a879ee-dfdd-4ce2-8f84-f487a640ea91",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "03d1fb91-3f19-4f93-b44d-bdf0927c4f51",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "fc895e5a-adde-41d3-9b92-b3fb39a21d27",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
    {
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "e9870615-a859-497f-83fa-93121da62d92",
        deviceType: "PHONE",
        mediaType: "SCREENSHOT",
    },
]
