import type {Showcase, Category, Project, ProjectMedia} from "../../generated/prisma/client.js";

type NewShowcaseType = Omit<Showcase, 'id'>

export const showcaseData: NewShowcaseType[] = [
    {
        name: "Capstone",
        year: 2026,
        semester: 1,
        description: null,
        publishedDate: null
    },
    {
        name: "Apple Foundation Program",
        year: 2025,
        semester: 2,
        description: null,
        publishedDate: null
    },
    {
        name: "Apple Foundation Program",
        year: 2026,
        semester: 1,
        description: null,
        publishedDate: null
    },
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

type NewProjectType = Omit<Project, 'categoryId' | 'showcaseId'> & {
    categoryName: string,
    showcase: ShowcaseSearch
}

export const projectData: NewProjectType[] = [
    // Apple Foundation Program 2025 Sem 2
    {
        id: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        name: "Instagram",
        description: "Bringing you closer to the people and things you love – Instagram from Meta\n" +
            "\n" +
            "Connect with friends, share what you're up to or see what's new from others all over the world. Explore our community where you can feel free to be yourself and share everything from your daily moments to life's highlights.\n" +
            "\n" +
            "Express yourself and connect with friends\n" +
            "\n" +
            "* Add photos and videos to your story that disappear after 24 hours, and bring them to life with fun creative tools.\n" +
            "* Message your friends with Messenger. Share and connect over what you see on feed and Stories.\n" +
            "* Create and discover short, entertaining videos on Instagram with Reels.\n" +
            "* Post photos and videos to your feed that you want to show on your profile.\n" +
            "\n" +
            "Learn more about your interests\n" +
            "\n" +
            "* Watch videos from your favourite creators and discover new content through Instagram video and Reels.\n" +
            "* Get inspired by photos and videos from new accounts in Explore.\n" +
            "* Discover brands and small businesses, and shop products that are relevant to your personal style.\n" +
            "Some Instagram features may not be available in your country or region.\n",
        subtitle: "Videos, Creators & Friends",
        iconUrl: "ad1987aa-6278-4408-b35f-304863998196",
        developers: ["Frantzisko Monifa", "Earl Sue"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        name: "Smart Receipts: Expenses and Tax",
        description: "AI-Powered Receipts Scanner & Expense Tracker.\n" +
            "PDF/CSV Expense Reports. Spend management.\n" +
            "Receipts keeper.\n" +
            "\n" +
            "Transform your phone into a powerful receipt scanner, expense tracker, and mileage tracker — all in one app. \n" +
            "Smart Receipts helps individuals, freelancers, and business owners capture every expense, maximise every ATO deduction, and turn tax season from a headache into a few taps.\n" +
            "\n" +
            "SMART RECEIPTS — YOUR ALL-IN-ONE EXPENSE SOLUTION\n" +
            "Whether you're managing personal finances or running a small business, Smart Receipts delivers customisable PDF, CSV, and ZIP reports built for real-world accounting. Organise expenses into \"folders,\" categorise spending, and generate professional reports that simplify tax filings, reimbursements, and bookkeeping.\n" +
            "\n" +
            "KEY FEATURES\n" +
            "• Powerful receipt scanner with AI-powered OCR — capture every detail in seconds\n" +
            "• Snap photos with your camera or import existing images\n" +
            "• Upload and process PDF receipts effortlessly\n" +
            "• Import your existing CSV files or bank statements in seconds\n" +
            "• Connect your bank account (USA & Canada only) to automatically pull in expenses and transactions\n" +
            "• Track price, tax, currency, and payment method for every purchase\n" +
            "• Tag entries with names, categories, comments, and custom metadata\n" +
            "• Built-in mileage tracker for reimbursement and ATO deduction claims\n" +
            "• Automatic exchange rate calculations for international travel and business trips\n" +
            "• Smart predictions based on past entries — faster reporting every time\n" +
            "• Fully customisable PDF, CSV, and ZIP reports\n" +
            "\n" +
            "SAVE HOURS EVERY WEEK\n" +
            "Stop typing expenses into spreadsheets. Smart Receipts eliminates manual data entry by combining a fast receipt scanner, CSV import, and direct bank sync (USA/Canada). Whether you're tracking a single business trip or a year of deductions, your records stay organised and tax-ready.\n" +
            "\n" +
            "BUILT FOR ACCOUNTING & BOOKKEEPING\n" +
            "Accountants, bookkeepers, and small business owners trust Smart Receipts to keep clients audit-ready. Export clean, ATO-friendly reports in seconds and spend less time chasing paperwork.\n" +
            "\n" +
            "YOUR DATA, SECURED\n" +
            "Smart Receipts protects your sensitive financial information with secure automatic backups to our private cloud and AI-powered OCR for accurate scanning. Your records stay safe, organised, and accessible whenever you need them.\n" +
            "\n" +
            "JOIN OVER 1,000,000 USERS\n" +
            "More than a million people trust Smart Receipts as their go-to expense tracker and mileage tracker. Built by a seasoned consultant, the app is designed for efficiency, flexibility, and the realities of modern financial management.\n" +
            "\n" +
            "Download Smart Receipts today and take control of your expenses, deductions, and tax returns.\n",
        subtitle: "Receipt Scanner, Tracker",
        iconUrl: "ecdd9658-a03d-4eb3-8370-6386fc70d9ee",
        developers: ["Orion Nestan"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: ["https://www.example.com"],
        order: null,
        categoryName: "Finance",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        name: "Substack",
        description: "",
        subtitle: "Videos, writing & Podcasts",
        iconUrl: "261be61a-cb4d-4de4-a9aa-0abf3156493a",
        developers: ["Iouri Bilal", "Sven Ameer"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "News",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        name: "Patreon",
        description: "Exclusive access to your favourite creators and communities from anywhere.\n" +
            "\n" +
            "\n" +
            "Patreon is where you can access exclusive podcasts, videos, art, writing, recipes, courses, music and more from your favourite creators, and build community with both the creators you love and other fans.\n" +
            "\n" +
            "\n" +
            "When you join a creator’s Patreon, you unlock access to a world of exclusive posts, a community group chat and more. Here’s how you can use the Patreon app to make your experience even better:\n" +
            "\n" +
            "\n" +
            "ACCESS exclusive work from your favourite creators in seconds, from sneak peeks and bonus episodes to demo tracks and behind-the-scenes looks. \n" +
            "\n" +
            "\n" +
            "JOIN the conversation in community group chats, where you can engage directly with creators and other fans in an intimate space outside of the comments section.\n" +
            "\n" +
            "\n" +
            "DOWNLOAD podcasts, music and other audio for easy offline listening.\n" +
            "\n" +
            "\n" +
            "BE the first to experience the latest releases from creators you love.\n" +
            "\n" +
            "\n" +
            "IMMERSE yourself in creators’ worlds, where their work is grouped and displayed in easy-to-navigate collections.\n" +
            "\n" +
            "\n" +
            "GET to know other fans and let other fans get to know you through personalised fan profiles.\n",
        subtitle: "Exclusive creator communities",
        iconUrl: "e484563e-99e2-4820-bb23-0b0b0aa1adc0",
        developers: ["Nazaire Sa'dia", "Disha Anu", "Olympas Iuppiter"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        name: "DocPlay",
        description: "Watch a curated collection of the world's most amazing and thought-provoking documentaries. From festival favourites to Oscar™ winners with new titles each and every week - start exploring DocPlay today!\n" +
            "\n" +
            "Premium Membership:\n" +
            "DocPlay Premium is a paid membership that gets you ad-free access to the entire DocPlay catalog in HD.\n",
        subtitle: "The World's Best Documentaries",
        iconUrl: "e3605c03-2a72-4416-a137-79b99a8a6f90",
        developers: ["Yoel Dileep", "Zoila Sara"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        name: "Letterboxd",
        description: "Letterboxd for iOS puts the popular social network for film lovers on your iPhone or iPad, so you can log films and catch up on your friends’ activity with ease.\n" +
            "\n" +
            "Sign in with your existing account (or create one for free) to enjoy our native app interface. These features of the web experience are supported, with more to come:\n" +
            "\n" +
            "– Sign in (with 1Password support) or create an account\n" +
            "– Browse popular, highly rated and most anticipated films (including our official list of the Top 250 Narrative Features)\n" +
            "– Log films with date, rating, review and tags\n" +
            "– View film info (including cast & crew, popular lists and reviews) and rate, like, watchlist or mark as watched\n" +
            "– View (and filter) your activity feed\n" +
            "– Read and comment on reviews and lists\n" +
            "– Create and edit lists\n" +
            "– View member profiles including films, reviews, diary entries, tags, stats and more\n" +
            "– Follow members to see their activity in your feed\n" +
            "– Filter and sort collections of films based on specific criteria\n" +
            "– Search for films, content and people\n" +
            "– Edit your profile settings\n",
        subtitle: "The social app for film lovers",
        iconUrl: "68d5dee6-9ede-4d52-a3eb-1c734b87f0d6",
        developers: ["Liss Azize"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        name: "ABC Listen: Radio & Podcasts",
        description: "Download the free ABC listen app to take your favourite podcasts, radio & audiobooks with you on the go. \n" +
            "\n" +
            "Stream live sport, choose your news, and explore a world of music anywhere, anytime, and all for free! \n" +
            "\n" +
            "APP FEATURES \n" +
            "\n" +
            "For Kids & Families: \n" +
            "• All new exclusive episodes of Bluey Listen Along.\n" +
            "• Create sub-profiles for Kids or multiple users.\n" +
            "• Optional Kids lock helps kids stay in a space designed just for them.\n" +
            "• Soundtrack your child’s day with ABC Kids listen podcasts, radio, audiobooks and music – all in one place. \n" +
            "\n" +
            "Live Radio on the Go: \n" +
            "• Instant access to all ABC local and national stations and radio programs, including ABC Radio National, ABC NEWS, ABC SPORT, ABC Kids listen, Double J, triple j and more. \n" +
            "• Tune in to live broadcasts and catch up on what you've missed. \n" +
            "• See upcoming programs or recently played music and tracklists \n" +
            "• Limited internet coverage? Find the broadcast frequencies for local and national ABC Radio from anywhere in the country. \n" +
            "• Hear live, expert and ad-free ABC SPORT coverage of national and international games, including AFL, NRL, cricket, tennis and soccer. \n" +
            "\n" +
            "Discover Podcasts & Audiobooks: \n" +
            "• Dive into a free podcast library with over 200 podcasts and radio programs available at your fingertips. \n" +
            "• Explore the free curated audiobook library, updated with new fiction, non-fiction and kids titles for readers of all ages. \n" +
            "• Exclusive ABC Timeless Audiobooks giving classic titles a fresh take by a new generation of Australian voices. \n" +
            "\n" +
            "Stay informed with Daily News and Sports: \n" +
            "• Stay up to date with essential news streams delivered in under 5 minutes. \n" +
            "• Go more in-depth with daily news briefings, covering local updates to global happenings.\n" +
            "\n" +
            "Tailored Music Collections, Classic Albums and Live Shows: \n" +
            "• Music for every mood - explore curated collections from popular stations like ABC Classic, ABC Country, ABC Jazz, Double J and triple j.\n" +
            "• Music for every occasion - soundtrack your day with Music for Your Warm Up, triple j House Party and Music To Sleep To collections and more. \n" +
            "• Music, songs and children's entertainment for kids of all ages to help little ears sleep, learn and play. \n" +
            "\n" +
            "Join the Conversation \n" +
            "• Tap directly into on-air conversations with Call or Text In buttons at your fingertips. \n" +
            "\n" +
            "\n" +
            "Life sounds better with ABC listen - download the free app today! ",
        subtitle: "Music, Sport, News, Audiobooks",
        iconUrl: "4b469e71-1672-4fae-873c-d55244afd584",
        developers: ["Erik Astrid"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "601a6641-7d7d-436d-bf20-7b11902192aa",
        name: "Discord — Talk, Play, Hang Out",
        subtitle: "Group Chat That's Fun & Games",
        description: "Discord is designed for gaming and great for just chilling with friends or building a community. Customise your own space and gather your friends to talk while playing your favourite games or just hang out.\n" +
            "\n" +
            "GROUP CHAT THAT’S ALL FUN AND GAMES\n" +
            "∙ Discord is great for playing games and chilling with friends or even building a worldwide community. Customise your own space to talk, play and hang out in.\n" +
            "\n" +
            "MAKE YOUR GROUP CHATS MORE FUN\n" +
            "∙ Create custom emojis, stickers, soundboard effects and more to add your personality to voice, video or text chat. Set your avatar, a custom status and write your own profile to show up in chat your way.\n" +
            "\n" +
            "STREAM LIKE YOU’RE IN THE SAME ROOM\n" +
            "∙ High-quality and low-latency streaming makes it feel like you’re hanging out on the couch with friends while playing a game, watching shows, looking at photos or idk, doing homework or something.\n" +
            "\n" +
            "HOP IN WHEN YOU’RE FREE, NO NEED TO CALL\n" +
            "∙ Easily hop in and out of voice or text chats without having to call or invite anyone, so you can chat with your friends before, during and after your game session.\n" +
            "\n" +
            "SEE WHO’S AROUND TO CHILL\n" +
            "∙ See who’s around, playing games or just hanging out. For supported games, you can see what modes or characters your friends are playing and directly join up.\n" +
            "\n" +
            "ALWAYS HAVE SOMETHING TO DO TOGETHER\n" +
            "∙ Watch videos, play built-in games, listen to music or just scroll together and spam memes. Seamlessly text, call, video chat and play games, all in one group chat.\n" +
            "\n" +
            "WHEREVER YOU GAME, HANG OUT HERE\n" +
            "∙ On your PC, phone or console, you can still hang out on Discord. Easily switch between devices and use tools to manage multiple group chats with friends.",
        iconUrl: "aa765045-ce5c-494b-bb9f-f7652b38266c",
        developers: ["Jaska Arend", "Elsa Grozdana", "Ramzan Alam"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        name: "Twitch — Live Streaming",
        subtitle: "Stream, Watch, Chat. Live.",
        description: "Twitch is where thousands of communities come together for our favorite streamers, for the games we love, for the lulz, for each other, for whatever. Download Twitch and join millions enjoying live games, music, sports, esports, podcasts, cooking shows, IRL streams, and whatever else crosses our community’s wonderfully absurd minds. We’ll see you in chat.\n" +
            "\n" +
            "Here’s a convenient list of other awesome things about Twitch:\n" +
            "\n" +
            "Everyone is “about” community. We actually are one: Whatever you nerd out about, you can find your people on Twitch. \n" +
            "Give support, get support: Find new streamers and subscribe to your favorites. Plus,  unlock exclusive perks for your support. \n" +
            "Start your own channel: The Twitch app is one of the easiest ways to start streaming. Just create an account, go live directly from the app, and bring people together around whatever you’re passionate about. \n" +
            "You never know what you’ll find: Popular games are always live, but so are music festivals, rocket launches, street tours of Tokyo, and goat yoga. Yes, really. \n" +
            "Dark mode: Y’all love this one. Black and purple have never looked this good together.\n",
        iconUrl: "0b87b97e-0c10-42f9-bfa0-ca311e60d845",
        developers: ["Tina Nora", "Misi Meena", "Reuel Liberato"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    {
        id: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        name: "Bluey's Quest for The Gold Pen",
        subtitle: "A story-driven adventure game",
        description:
            "Join Bluey in a new adventure game with story by the show's creator. Set off on an epic quest featuring new characters, fully animated cutscenes, and hand-drawn environments inspired by the Dragon and Escape episodes in the TV series. \n" +
            "\n" +
            "Explore vibrant worlds, solve trifficult puzzles and complete fun challenges, all as you embark on Bluey’s Quest for The Gold Pen.\n" +
            "\n" +
            "A NEW BLUEY STORY\n" +
            "Dive into an adventure game fuelled by a brand-new story from the show's creator! Discover the humour and warmth Bluey brings in this fun new game for the family, with story by Joe Brumm.\n" +
            "\n" +
            "EMBARK ON A HEART-WARMING ADVENTURE\n" +
            "Bluey is drawing at the table when Dad suddenly yoinks the Gold Pen she needs! Bluey sets off on an adventure with the whole family. Mum designs the strange and distant lands, Dad rocks up on his cool bike as self-declared King Goldie Horns, and Bingo transforms into her honk-happy alter ego — Bingooose! Away they go on an exciting quest to retrieve the Gold Pen – and have heaps of fun along the way.\n" +
            "\n" +
            "GO ON FUN-FILLED CHALLENGES Uncover hidden treasures, solve playful puzzles, and take on delightful mini-quests as you glide, fly, and skate through each level. Interact with quirky characters and help little lost critters return to their homes. Search near and far for goosefood and beads to unlock new moments in the adventure as you keep Bluey moving onwards in her quest.\n" +
            "\n" +
            "EXPLORE HAND-DRAWN WORLDS Explore lively levels brimming with snowy mountains, golden beaches, lush forests, and iconic Australian landscapes. Each environment is packed with vibrant details and opportunities for discovery.\n" +
            "\n" +
            "FUN FOR EVERYONE Just like the animated series, Bluey’s Quest for the Gold Pen sparks laughter and encourages players of all ages to discover through play. Packed full of trifficult puzzles and wholesome moments, this is an adventure for the whole household.\n",
        iconUrl: "d4911a18-5b87-4109-968f-cc7346832c38",
        developers: ["Viktorie Haiyang", "Natalija Zoilus"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Games",
        showcase: {
            name: "Apple Foundation Program",
            year: 2025,
            semester: 2
        }
    },
    // Apple Foundation Program 2026 Sem 1
    {
        id: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        name: "Duolingo: Language & Chess",
        subtitle: "Learn Spanish, Math & more",
        description: "Learn a new language, chess & more with the world's most downloaded education app! Duolingo is the fun, free app for learning 40+ languages through quick, bite-sized lessons. Practice speaking, reading, listening & writing to build your vocabulary & grammar skills.\n" +
            "\n" +
            "Designed by learning experts & loved by hundreds of millions worldwide, our lessons make learning effective & fun and help you prepare for real conversations in Spanish, French, Japanese, Korean, Chinese, Italian, German, English and more.\n" +
            "\n" +
            "\n" +
            "And now, you can learn CHESS on Duolingo! Whether you're a total beginner or looking to level up your game, you'll love learning chess the Duolingo way. Play matches and fun chess lessons for all levels, no matter the language - chess, ajedrez, xadrez, schach, Шахматы, الشطرنج.\n" +
            "\n" +
            "• Chess: Learn the moves, level up your game & play matches in our Chess course. Learn the basics, solve fun chess puzzles & improve your strategy with guided lessons. Whether you're new to chess or already play, our course is designed to help you have fun and build real skills. Checkmate!\n" +
            "\n" +
            "• Math: Forget lectures and math worksheets! Built by learning experts, our Math course makes math feel like a game. Boost learning and fight the summer slide with standards-aligned math lessons for elementary school, middle school, and high school students.\n" +
            "\n" +
            "• Music: Learn how to read music & play songs in our Music course, no instrument needed! Using an on-screen keyboard, you'll learn bit-by-bit.\n" +
            "\n" +
            "Whether you're learning a language for travel, school, career or your brain health, you'll love learning with Duolingo.\n" +
            "\n" +
            "\n" +
            "Why Duolingo?\n" +
            "\n" +
            "• Duolingo is fun & effective. Game-like language lessons & fun characters help you build speaking, reading, listening, & writing skills, plus enjoy fun chess & competitive online chess in one app.\n" +
            "\n" +
            "• Duolingo works. Designed by learning experts, Duolingo has a science-based teaching methodology proven to foster long-term knowledge retention across language lessons & chess lessons alike.\n" +
            "\n" +
            "• Track your progress. Work toward your learning goals with playful rewards & achievements when you make practicing language lessons or chess online part of your daily habit.\n" +
            "\n" +
            "• Join millions of learners. Stay motivated with competitive Leaderboards as you learn languages & play chess online alongside our global community.\n" +
            "\n" +
            "• Every course is free. Learn Spanish, French, German, Italian, Russian, Portuguese, Turkish, Dutch, Irish, Danish, Swedish, Ukrainian, Esperanto, Polish, Greek, Hungarian, Norwegian, Hebrew, Welsh, Arabic, Latin, Hawaiian, Scottish Gaelic, Vietnamese, Korean, Japanese, English, & even High Valyrian! And now, learn Math, Music & improve your Chess skills with fun, bite-sized lessons.\n" +
            "\n" +
            "\n" +
            "What the world is saying about Duolingo:\n" +
            "\n" +
            "\"Far & away the best language-learning app.\" - The Wall Street Journal\n" +
            "\n" +
            "\"This free app & website is among the most effective language-learning methods I've tried… lessons come in the form of brief challenges, speaking, translating, answering multiple-choice questions, that keep me coming back for more.\" - The New York Times\n" +
            "\n" +
            "\"Duolingo may hold the secret to the future of education.\" - TIME Magazine\n" +
            "\n" +
            "\"Duolingo is cheerful, lighthearted & fun.\" - Forbes\n" +
            "\n" +
            "\"I Can't Stop Playing Duolingo Chess.\" - Wired\n",
        iconUrl: "58e26c42-a120-4c08-9b46-be2749243817",
        developers: ["Märyäm Agapitos", "Aisha Anand"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Education",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        name: "Simply Piano: Learn Piano Fast",
        subtitle: "Piano Songs & Lessons",
        description: "A fast and fun way to learn piano - works with any piano or keyboard. Learn to play the songs you love with Simply Piano!\n" +
            "\n" +
            "Simply Piano is a fast and fun way to learn piano, from beginner to pro. Works with any piano or keyboard. Chosen as one of the best iPhone apps.\n" +
            "\n" +
            "- Tons of fun songs like Imagine, Chandelier, All Of Me and Counting Stars, also J.S. Bach\n" +
            "- Includes courses for different musical tastes and playing levels\n" +
            "- Learn the basics step-by-step from reading sheet music to playing with both hands\n" +
            "- Slow down library songs to choose your own pace for easy learning\n" +
            "- Personalized 5-Min Workouts ensuring you progress fast and always succeed\n" +
            "- Suitable for all ages, no previous knowledge required to learn piano\n" +
            "\n" +
            "No Piano? Try the Touch Courses with 3D Touch to turn your device into an on-screen keyboard!\n" +
            "\n" +
            "How it works:\n" +
            "- Place your device (iPhone/iPad/iPod) on your acoustic/MIDI piano or keyboard and play; the app will immediately recognize what you are playing\n" +
            "- Get instant feedback on your playing to quickly learn and improve your piano skills\n" +
            "- Discover the magic of music with fun songs in the Library and complete courses to start sounding like a pro\n" +
            "\n" +
            "How the Subscription Works:\n" +
            "- All app users can play two free courses. Upgrade to a premium subscription package at any time.\n" +
            "- Subscribers will receive full access to ALL courses. New courses and songs added every month!\n" +
            "- All recurring subscriptions will auto-renew unless auto-renewal is turned off at least 24 hours before the end of the current period.\n" +
            "- Account will be charged for renewal within 24-hours prior to the end of the current period, at the cost of the chosen package.\n" +
            "- Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable.\n" +
            "- Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.\n" +
            "- Your subscription is for your iTunes account and can be used on your iOS device.\n" +
            "- Payments will be charged to your iTunes account at confirmation of purchase.\n" +
            "- Subscriptions cannot be cancelled during the active subscription period.\n" +
            "\n" +
            "Simply Piano is developed by Simply, creators of award-winning apps Simply Guitar, Simply Sing, Piano Maestro and Piano Dust Buster.  Created by music educators, the apps are used by tens of thousands of music teachers worldwide with over 1 million songs learned every week. Simply are experts in creating educational and fun music apps for learning piano quickly and easily.\n" +
            "\n" +
            "Awards & Recognition -\n" +
            "- \"\"EMI’s Innovation Challenge”\n" +
            "- \"\"World Summit Award\"\", by the United Nations\n" +
            "- “Best Tools for Beginners”, NAMM\n" +
            "- \"\"Best Tablet Game\"\", GameIS\n" +
            "- “Parents' Choice Award”\n" +
            "- “Golden App”, Apps for Homeschooling\n" +
            "\n" +
            "Have questions, feedback or suggestions? Reach out to us via the in-app chat, just tap on Settings and ‘Have a Question’.\n" +
            "Enjoy Playing!\n",
        iconUrl: "65405e6c-4eab-4cab-bacb-8623e222fd6f",
        developers: ["Kristofor Lal"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Education",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        name: "Elevate — Brain Training",
        subtitle: "Vocab, Memory, & Math Puzzles",
        description: "Elevate is a brain training program designed to improve your mind’s focus, memory, speaking abilities, processing speed, math skills, and more. Each person is provided with a personalized training program that adjusts over time to maximize results.\n" +
            "\n" +
            "The more you train with Elevate, the more you’ll improve critical cognitive skills that are proven to boost productivity, earning power, and self-confidence. 90%+ report improved vocabulary, math skills, and overall mental sharpness when they frequently use Elevate.\n" +
            "\n" +
            "IN THE NEWS\n" +
            "\n" +
            "“Elevate comes out ahead” in the battle of the brain training apps. - CNET\n" +
            "\n" +
            "Elevate is a “cognitive pick-me-up” with games that are “good for mental breaks throughout the workday.” - Washington Post\n" +
            "\n" +
            "FEATURES\n" +
            "\n" +
            "• 40+ Brain Training Games: Improve your critical cognitive skills like focus, memory, processing, math, precision, and comprehension with 40+ brain training games.\n" +
            "• Performance Tracking: Measure your performance against yourself and others. Weekly reports highlight your key accomplishments and opportunities.\n" +
            "• Personalized Workouts: Customize your daily training focus and choose between 3 and 5 games. Get personalized daily workouts that include the skills you need most.\n" +
            "• Adaptive Progression: Train your brain with adaptive difficulty progression that ensures your experience is challenging.\n" +
            "• Workout Calendar: Track your streaks and stay motivated with Elevate’s workout calendar.\n" +
            "• Elevate Dash on Apple Watch: Play 4 additional mini-games and review your performance on your Apple Watch with Elevate Dash.\n" +
            "• And more!\n" +
            "\n" +
            "WHY YOU NEED ELEVATE\n" +
            "\n" +
            "• Express yourself more effectively in writing. Write with clarity, persuasiveness, and concision.\n" +
            "• Improve your spelling and punctuation. Avoid common writing pitfalls.\n" +
            "• Become a better reader. Read everyday materials faster and with greater understanding.\n" +
            "• Expand your vocabulary.\n" +
            "• Quickly and easily solve everyday math problems. Get better at comparing prices, splitting bills, and calculating discounts and markups. \n" +
            "• Speak more effectively. Become more articulate and better at communicating tone and meaning.\n" +
            "\n" +
            "\n" +
            "\n" +
            "RESEARCH BEHIND ELEVATE\n" +
            "\n" +
            "Elevate's games are designed in collaboration with experts in neuroscience and cognitive learning and are based on extensive scientific research. Elevate’s brain training algorithms further focus the learning experience by drawing from research in memory studies to develop a personalized training program for each member.\n",
        iconUrl: "d7beb5b9-b958-44e1-894d-649bc5ce4192",
        developers: ["Giosuè Rollie", "Víkingr Ela"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Education",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "181039d7-2674-464b-bc68-05a372f03558",
        name: "LinkedIn Learning",
        subtitle: "Online Courses to Learn Skills",
        description: "Achieve your next career goal with LinkedIn Learning—the only skill development platform based on the real-time skill and career insights from LinkedIn.\n" +
            "\n" +
            "With the LinkedIn Learning app, you can:\n" +
            "• Learn from industry experts on the most in-demand business, tech, and creative skills\n" +
            "• Get personalized content recommendations based on your skills and goals\n" +
            "• Stay up-to-date on the latest skills with new courses added weekly\n" +
            "• Learn the way you want online or offline—with bite-sized video, audio, or full course options\n" +
            "• Start learning a little bit every day with Daily\n" +
            "• Earn Professional Certificates and Continuing Education Credits\n" +
            "• Add certificates of completion to your LinkedIn profile \n" +
            "• Learn in the language that's best for you, including English, German, French, Spanish, Japanese, Chinese, Portuguese, Dutch, Indonesian, Polish, Turkish, and Korean\n" +
            "\n" +
            "Trending topics include:\n" +
            "• Artificial intelligence and generative AI\n" +
            "• Business productivity and software\n" +
            "• Cybersecurity\n" +
            "• Diversity, equity, and inclusion\n" +
            "• Leadership and management\n" +
            "• Software development\n",
        iconUrl: "dab6bd42-0b5f-46b0-ad4c-1a0e8dd2f0f1",
        developers: ["Aucaman Krystiana", "Zabulon Nindaanis", "Su-bin Barak"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Education",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        name: "Candy Crush Saga",
        subtitle: "The fun match 3 puzzle game!",
        description: "Start playing Candy Crush Saga today – a legendary puzzle game loved by millions of players around the world.\n" +
            "\n" +
            "With over a trillion levels played, this sweet match 3 puzzle game is one of the most popular mobile games of all time!\n" +
            "\n" +
            "Switch and match Candies in this tasty puzzle adventure to progress to the next level for that sweet winning feeling! Solve puzzles with quick thinking and smart moves, and be rewarded with delicious rainbow-colored cascades and tasty candy combos!\n" +
            "\n" +
            "Plan your moves by matching 3 or more candies in a row, using boosters wisely in order to overcome those extra sticky puzzles! Blast the chocolate and collect sweet candy across thousands of levels, guaranteed to have you craving more!\n" +
            "\n" +
            "Candy Crush Saga features:\n" +
            "\n" +
            "THE GAME THAT KEEPS YOU CRAVING MORE\n" +
            "Thousands of the best levels and puzzles in the Candy Kingdom and with more added every 2 weeks your sugar fix is never far away! \n" +
            "\n" +
            "MANY WAYS TO WIN REWARDS\n" +
            "Check back daily and spin the Daily Booster Wheel to receive free tasty rewards, and take part in time limited challenges to earn boosters to help you level up! \n" +
            "\n" +
            " VARIETY OF SUGAR-COATED CHALLENGES\n" +
            "Sweet ways to play: Game modes including Target Score, Clear the Jelly, Collect the Ingredients and Order Mode\n" +
            "\n" +
            "PLAY ALONE OR WITH FRIENDS\n" +
            "Get to the top of the leaderboard events and compare scores with friends and competitors!\n" +
            "\n" +
            "Levels range from easy to hard for all adults to enjoy – accessible on-the-go, offline and online.\n" +
            "It's easy to sync the game between devices and unlock full game features when connected to the Internet or Wifi.\n",
        iconUrl: "9fb303f7-5b03-43c7-8310-15aeb4857d26",
        developers: ["Geno Ceallach", "Deasún Ron"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Games",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        name: "Splitwise",
        subtitle: "Split expenses with friends",
        description: "Splitwise is the easiest way to share expenses with friends and family and stop stressing about “who owes who”. Millions of people around the world use Splitwise to organize group bills for households, trips, and more. Our mission is to reduce the stress and awkwardness that money places on our most important relationships.\n" +
            " \n" +
            "Splitwise is great for:\n" +
            "- Roommates splitting rent and apartment bills\n" +
            "- Group trips around the world\n" +
            "- Splitting a vacation house for skiing or at the beach\n" +
            "- Weddings and bachelor/bachelorette parties\n" +
            "- Couples sharing relationship costs\n" +
            "- Friends and co-workers who go out to lunch or dinner together frequently\n" +
            "- Loans and IOUS between friends \n" +
            "- And so much more\n" +
            " \n" +
            "Splitwise is simple to use:\n" +
            "- Create groups or private friendships for any splitting situation\n" +
            "- Add expenses, IOUs, or informal debts in any currency, with support for offline entry\n" +
            "- Expenses are backed up online so everyone can log in, view their balances, and add expenses\n" +
            "- Keep track of who should pay next, or settle up by recording cash payments or using our integrations\n" +
            " \n" +
            "We also have powerful features that can handle almost any money sharing situation. Here are some of our industry-leading features:\n" +
            "- Multi-platform support for smartphones and web\n" +
            "- Simplify debts into the easiest repayment plan\n" +
            "- Expense categorization\n" +
            "- Calculate group totals\n" +
            "- Export to CSV\n" +
            "- Comment directly on expenses\n" +
            "- Split expenses equally or unequally by percentages, shares, or exact amounts\n" +
            "- Add informal debts and IOUs\n" +
            "- Create bills that reccur monthly, weekly, yearly, fortnightly\n" +
            "- Add multiple payers on a single expense\n" +
            "- See total balances with a person across multiple groups and private expenses\n" +
            "- Custom user avatars\n" +
            "- Cover photos for groups \n" +
            "- Activity feed and push notifications help you stay on top of changes\n" +
            "- View your edit history for changes to an expense\n" +
            "- Any deleted group or bill can be restored easily\n" +
            "- World-class customer support\n" +
            "- Pay back using our integrated payments: Venmo and PayPal (US only), Paytm (India only)\n" +
            "- 100+ currencies and growing\n" +
            "- 7+ supported languages\n" +
            "\n" +
            "Endorsements:\n" +
            "“Makes it easy to split everything from your dinner bill to rent.” - NY Times\n" +
            "\"Fundamental for tracking finances. As good as WhatsApp for containing awkwardness.\" – The Financial Times\n" +
            "“I never fight with roommates over bills because of this genius expense-splitting app”- Business Insider\n" +
            "“The Single Best App You Can Download for Group Trips of Any Kind” - Thrillist\n" +
            "“Life Changing! I don’t review many things, but this app has seriously improved my quality of life. It has saved my sanity when it comes to splitting utilities, mortgage, groceries, dog expenses...the list goes on. No more saving receipts, making spreadsheets, and manually calculating each month. So handy for group trips/weekends, too! THANK YOU!!” – Courtney via the App Store\n" +
            "\n" +
            "We offer in-app purchases for “Splitwise Pro”, the benefits of which are described below. The subscription amount will be charged to your App Store account and will vary by plan and country. You’ll see the total price before completing your first payment. If you don’t choose to purchase “Splitwise Pro”, you can continue using Splitwise for free.\n" +
            "\n" +
            "Premium Subscription Service “Splitwise Pro”:\n" +
            "1. Store high-resolution receipts in the cloud (10GB cloud storage)\n" +
            "2. OCR integration for scanning and itemizing receipts\n" +
            "3. Backups to JSON, downloadable from our website\n" +
            "4. Convert expenses to different currencies using our Open Exchange Rates integration\n" +
            "5. Access to “spending by category” budgeting tools and other charts\n" +
            "6. Search full expense history\n",
        iconUrl: "f9ab8a29-f90f-4f01-bdae-dd91bd276bad",
        developers: ["Jitender Yannick", "Sachiko Yuliy"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Finance",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        name: "Strava: Run, Bike, Walk",
        subtitle: "Track & share with friends",
        description:
            "Strava makes fitness tracking social. We house your entire active journey in one spot – and you get to share it with friends. Here’s how:\n" +
            "\n" +
            "• Record everything – runs, rides, hikes, yoga and over 30 other sport types. Think of Strava as the homebase of your movement.\n" +
            "\n" +
            "• See the full story of your strength training – Lifting in the gym weekly, doing HIIT workouts, and showing up to your group weight training classes? Use your favorite device or strength app and your exercises, sets, reps, weights and a muscle map show up automatically. Or start your strength journey today and see how quickly strength workouts become a key part of your active life.\n" +
            "\n" +
            "• Discover anywhere – our Routes tool uses de-identified Strava data to intelligently recommend popular routes based on your preferences. You can also build your own.\n" +
            "\n" +
            "• Build a support network – Strava’s about celebrating movement. Here you’ll find your community and cheer each other on.\n" +
            "\n" +
            "• Train smarter – get data insights to understand your progress and see how you improve. Your Training Log is the record of all your workouts.\n" +
            "\n" +
            "• Get more from your workout – Powered by AI, Athlete Intelligence turns workout data into into instant insights. Keeping you motivated and ready for the next workout – without the guesswork.\n" +
            "\n" +
            "• Move safer – share your real-time location with loved ones while outdoors for an extra layer of safety.\n" +
            "\n" +
            "• Sync your favorite apps and devices – Strava is compatible with thousands of them (Apple Watch, Fitbit, Garmin – you name it).\n" +
            "\n" +
            "• Join and create challenges – join millions in monthly challenges to chase new goals, collect digital badges and stay accountable.\n" +
            "\n" +
            "• Embrace the unfiltered – your feed on Strava is filled with real efforts from real people. That’s how we motivate each other.\n" +
            "\n" +
            "• Whether you’re a world-class athlete or a total beginner, you belong here. Just record and go.\n" +
            "\n" +
            "Strava includes both a free version and a subscription version with premium features.\n" +
            "Strava uses HealthKit to export your Strava activities into the Health app and to read heart rate and biometric data.\n",
        iconUrl: "b10b346b-1277-479c-9068-b03f660e86be",
        developers: ["Yami Briggs", "Czarek Nina"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Health",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        name: "Blackmagic Camera",
        subtitle: "Unlock the power of your iPhone",
        description: "Introducing Digital Film for iPhone and iPad!\n" +
            "Blackmagic Camera unlocks the power of your iPhone and iPad by adding digital film camera controls and operating systems! Now you can create the same cinematic ‘look’ as Hollywood feature films. You get the same intuitive and user friendly interface as Blackmagic Design’s award winning cameras. So it’s just like using a professional digital film camera! This means you can adjust settings such as frame rate, shutter angle, white balance and ISO all in a single tap. Or record directly to Blackmagic Cloud in industry standard 10-bit Apple ProRes files up to 4K! Recording to Blackmagic Cloud Storage lets you collaborate on DaVinci Resolve projects with editors anywhere in the world, all at the same time!\n" +
            "\n" +
            "Get the \"Hollywood Look\" with Digital Film!\n" +
            "Blackmagic Camera puts the professional features you need for feature film, television and documentaries in your pocket. Now you can create YouTube and TikTok content with a cinematic look, and broadcast quality ENG! Imagine having a run and gun camera on hand to capture breaking news whenever it happens! Or use Blackmagic Camera as a B Cam to capture angles that are difficult to reach with traditional cameras, while still retaining control of important settings. Best of all, recording to Blackmagic Cloud allows you to get your footage to the newsroom or post production studio in minutes.\n" +
            "\n" +
            "Interactive Controls for Fast Setup \n" +
            "Blackmagic Camera has all the controls you need to quickly setup and start shooting!  Everything is interactive, so you can tap any item and instantly change settings without searching through confusing menus! The HUD shows status and record parameters, histogram, focus peaking indicators, levels, frame guides and more. Show or hide the HUD by swiping up or down. You can auto focus by tapping the screen in the area you want to focus. You can shoot in 16:9 or vertical aspect ratios, plus you can shoot 16:9 while holding your phone vertically if you want to shoot unobtrusively.\n" +
            "\n" +
            "On Screen Heads Up Display\n" +
            "The heads up display, or HUD, controls have the most important camera controls such as lens selection, frame rate, shutter angle, timecode, ISO, white balance, gain and audio levels. You can adjust settings such as exposure by touching the ISO indicator, or you can change the audio levels simply by touching the audio meters. Everything is interactive, so if you tap any item you can instantaneously change its settings without having to search through complex menus!\n" +
            "\n" +
            "Camera Setup Menus\n" +
            "The settings tab unlocks the full power of your phone’s camera, with quick access to advanced settings such as monitoring, audio, camera setup, recording and more! The record tab gives you total control over video resolution and recording format including industry standard Apple ProRes or space efficient H.264 and H.265. Plus, you can set anamorphic de-squeeze and lens correction settings. Professional audio options include AAC and PCM format and VU or PPM audio metering. You can even add external microphones! Or add 3D LUTs to recreate film looks!\n" +
            "\n" +
            "Media\n" +
            "The Blackmagic Camera media tab has all the controls you need to browse or scrub clips for quick review, search and sort and view the upload status of your media. Access your media from Blackmagic Camera’s all clips folder by choosing the Media button to see the thumbnails for each clip you have stored. Plus, you can save to the files folder on the phone, send it to Blackmagic Cloud Storage via Blackmagic Cloud or manually choose which clips to upload to a project library. You can even sync media from Blackmagic Camera directly into the DaVinci Resolve project so you’re ready to edit!\n" +
            "\n" +
            "Live Sync to Blackmagic Cloud Storage\n" +
            "When shooting with Blackmagic Camera, the video you capture can be instantly uploaded as a proxy file, followed by the camera originals, and saved to Blackmagic Cloud Storage. This means you can start editing quickly using your proxies, speeding up your workflow.",
        iconUrl: "d6e6f63c-9690-41f0-a20d-3c96bb45bc9a",
        developers: ["Sawsan Victoria", "Chip Sharia"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Photo & Video",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        name: "Microsoft Teams",
        subtitle: "Call. Chat. Collaborate.",
        description:
            "Whether you’re connecting with your community for an upcoming activity or working with teammates on a project, Microsoft Teams helps bring people together so that they can get things done. It’s the only app that has communities, events, chats, channels, meetings, storage, tasks, and calendars in one place—so you can easily connect and manage access to information. Get your community, family, friends, or workmates together to accomplish tasks, share ideas, and make plans. Join audio and video calls in a secure setting, collaborate in documents, and store files and photos with built-in cloud storage. You can do it all in Microsoft Teams. \n" +
            "\n" +
            "Easily connect with anyone: \n" +
            "• Skype is now part of Teams. Continue where you left off with your chats, calls and contacts in Microsoft Teams Free. \n" +
            "• Meet securely with communities, teammates, family, or friends.\n" +
            "• Set up a meeting within seconds and invite anyone by sharing a link or calendar invite. \n" +
            "• Chat 1-1 or to your entire community, @mention people in chats to get their attention. \n" +
            "• Create a dedicated community to discuss specific topics and make plans*.\n" +
            "• Work closely and collaborate by keeping conversations organized by specific topics and projects with teams and channels.\n" +
            "• Video or audio call anyone directly in Teams or instantly convert a group chat to a call. \n" +
            "• Use GIFs, emojis, and message animations to express yourself when words aren’t enough.\n" +
            " \n" +
            "Accomplish plans and projects together: \n" +
            "• Send photos and videos in chats to quickly and easily share important moments.\n" +
            "• Use cloud storage to access shared documents and files on the go. \n" +
            "• Organize shared content in a community — events, photos, links, files —so you don’t have to waste time searching*. \n" +
            "• Get the most out of your meetings by using screen share, whiteboard, or breakout in virtual rooms.\n" +
            "• Manage access to information and ensure the right people have access to the right info, even when people join and leave projects.\n" +
            "• Use task lists to stay on top of projects and plans - assign tasks, set due dates, and cross off items to keep everyone on the same page. \n" +
            "\n" +
            "Designed to give you peace of mind: \n" +
            "• Securely collaborate with others while maintaining control over your data.\n" +
            "• Keep communities safe by allowing owners to remove inappropriate content or members*.\n" +
            "• Enterprise-level security and compliance you expect from Microsoft 365**. \n" +
            "\n",
        iconUrl: "63b7e43c-6480-470f-8b3f-b16ad7d09af3",
        developers: ["Ariadna Subramanian", "Regin Anselma"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Business",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        name: "Snapchat: Chat with Friends",
        subtitle: "Share the moment",
        description: "Snapchat is a fast and fun way to share the moment with your friends and family\n" +
            "\n" +
            "SNAP \n" +
            "• Snapchat opens right to the Camera — just tap to take a photo, or press and hold for video.\n" +
            "• Express yourself with Lenses, Filters, Bitmoji and more! \n" +
            "• Try out new Lenses daily created by the Snapchat community!\n" +
            "\n" +
            "CHAT \n" +
            "• Stay in touch with friends through live messaging, or share your day with Group Stories.\n" +
            "• Video Chat with up to 16 friends at once — you can even use Lenses and Filters when chatting!\n" +
            "• Express yourself with Friendmojis — exclusive Bitmoji made just for you and a friend.\n" +
            "\n" +
            "STORIES\n" +
            "• Watch friends' Stories to see their day unfold.\n" +
            "• See Stories from the Snapchat community that are based on your interests.\n" +
            "• Discover breaking news and exclusive Original Shows.\n" +
            "\n" +
            "SPOTLIGHT\n" +
            "• Spotlight showcases the best of Snapchat!\n" +
            "• Submit your own Snaps or sit back, relax, and watch.\n" +
            "• Pick your favorites and share them with friends.\n" +
            "\n" +
            "MAP \n" +
            "• Share your location with your best friends or go off the grid with Ghost Mode.\n" +
            "• See what your friends are up to on your most personal map when they share their location with you. \n" +
            "• Explore live Stories from the community nearby or across the world!\n" +
            "\n" +
            "MEMORIES \n" +
            "• Save unlimited photos and videos of all your favorite moments.\n" +
            "• Edit and send old moments to friends or save them to your Camera Roll.\n" +
            "• Create Stories from your favorite Memories to share with friends and family.\n" +
            "\n" +
            "FRIENDSHIP PROFILE \n" +
            "• Every friendship has its own special profile to see the moments you’ve saved together.\n" +
            "• Discover new things you have in common with Charms — see how long you’ve been friends, your astrological compatibility, your Bitmoji fashion sense, and more!\n" +
            "• Friendship Profiles are just between you and a friend, so you can bond over what makes your friendship special.\n" +
            "\n" +
            "Happy Snapping!\n",
        iconUrl: "546fac9b-76f2-4c9f-adf3-6a11991ae254",
        developers: ["Cyra Favour", "Elkan Starla"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Apple Foundation Program",
            year: 2026,
            semester: 1
        }
    },
    // Capstone 2026 Sem 1
    {
        id: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        name: "Swipewipe: Photo Storage",
        subtitle: "Organize & Delete Duplicates",
        description: "Tidy up your camera roll, one swipe at a time. Swipewipe makes cleaning up your photo gallery fun and easy. Reminisce while you declutter!\n" +
            "\n" +
            "Finally, a dead-simple way to manage your memories. Go month-by-month, take a trip down memory lane with our \"On This Day\" feature, explore your travels on a stunning memory map, and bring old photos back to life with AI enhancement.\n" +
            "\n" +
            "Decide what to keep and what to bin with a simple swipe.\n" +
            "\n" +
            "Here's what makes it great:\n" +
            "• Simple Swipe: Right to keep, left to delete. It's that easy.\n" +
            "• On This Day: Relive your best memories from years gone by.\n" +
            "• Month-by-Month: Easily sort your photos chronologically.\n" +
            "• Memory Map: Rediscover your adventures all over the world.\n" +
            "• AI Photo Enhancer: Sharpen up your favourite memories.\n" +
            "• Easy Navigation: Tap to go back, hold for photo details.\n" +
            "\n" +
            "Top Features:\n" +
            "• Bookmarks: Set aside photos you're on the fence about.\n" +
            "• Progress Tracking: See how much you've tidied up.\n" +
            "• Stats: Track reviewed photos and the storage space you've saved.\n" +
            "• \"On This Day\" Widget: Reminisce daily and build up a streak.\n" +
            "• World Map: See exactly where your memories were made.\n" +
            "• Photo Enhancement: Make old, blurry, or low-quality photos look brilliant.\n" +
            "\n" +
            "Let's be honest, our camera rolls can be a bit of a mess. Reclaim your memories, rediscover forgotten moments, and free up some serious storage space today.\n" +
            "\n" +
            "Download Swipewipe and get swiping!\n",
        iconUrl: "7b0ad2ac-fcfd-4272-a260-77d374f56a79",
        developers: ["Laurentino Wulfric"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Utilities",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        name: "Pedometer++",
        subtitle: "Count Steps",
        description: "Available on the iPhone and Apple Watch, Pedometer++ is the best way to review your step count, walking distance, active calories, and heart rate data. \n" +
            "\n" +
            "Set a custom step count goal and track your progress over time. The built-in graphs make reviewing your data easy and fun. Everyone loves awards, and Pedometer++ includes a range of Badges to motivate and reward your hard work! The app also totals how far you’ve walked each day, and even counts the flights of stairs you encounter each day.\n" +
            "\n" +
            "With full-featured widget support, Pedometer++ can display your step count or update you on your daily progress right from your iPhone's lock screen or home screen. You can also share your workouts with others and view trends over time.\n" +
            "\n" +
            "The Apple Watch app puts all this data on your wrist. With a wide range of Complications, it’s easy to check your progress with just a glance. Add a single Complication to your daily watch face, or add several to build a comprehensive fitness-focused look! \n" +
            "\n" +
            "DETAILS:\n" +
            "For best results, keep your iPhone on you as you move throughout the day, ideally in a pocket close to your hips. If you have an Apple Watch, you can set Pedometer++ to sync step data across your devices for the most accurate data possible.\n" +
            "\n" +
            "The Apple Watch app can also start and track indoor and outdoor walking and running workouts and can serve as your guide while hiking.\n" +
            "\n" +
            "\n" +
            "ROUTES & MAPPING:\n" +
            "Pedometer++ is your ultimate companion for exploring the great outdoors. It allows you to import GPX files for waypoints and routes set by others. \n" +
            "\n" +
            "You can also use the app to create your own routes. Simply tap on your desired start and end points, and Pedometer++ will find the shortest route between them. You can then tweak the route based on terrain, trail popularity, or personal preference. \n" +
            "\n" +
            "Pedometer++ shows the distance of a route, the elevation changes you will encounter, and the estimated time it will take you to reach your destination. You can also monitor the weather that is expected along your route.\n" +
            "\n" +
            "The best part is that custom routing is available on the iPhone and Apple Watch. Of course, being out in nature often means losing cell service, so Pedometer++ allows you to download offline map data for large areas, not just for your specific route. Offline map data is also available on the iPhone and Apple Watch, as long as your Watch is within range of your phone.",
        iconUrl: "76731acf-95cc-4461-b0bb-aa3845bfb6b6",
        developers: ["Arushi Dechen", "Gautam Audrius"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Health",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        name: "Hoopla",
        subtitle: "Your library anywhere",
        description: "Thousands of free books, audio, comics, and more available right now with your library card. \n" +
            "\n" +
            "No subscription. No ads. Just borrow and read. \n" +
            "\n" +
            "Hoopla Digital connects your local public library to your phone, giving you instant access to thousands of free audiobooks, eBooks, comics, graphic novels, manga, and magazines with new titles added daily. \n" +
            "\n" +
            "Free Books and Audiobooks Available Right Now \n" +
            "Borrow audiobooks and eBooks of all genres. From romance to psychological thrillers, discover chart-topping new releases, indie authors, and classics to stream or download anytime. \n" +
            "\n" +
            "Comics, Manga, and Graphic Novels \n" +
            "Dive into an enormous library of comics and manga across every genre. Our ActionView feature brings panel-by-panel reading to life with stunning detail. \n" +
            "\n" +
            "Watch Free Movies and TV \n" +
            "Stream movies, anime, documentaries, and TV shows at home or on the go. Use BingePass for seven-day unlimited access to premium channels like Hallmark+ and PBS or SeasonPass to borrow and binge watch the full season in one sitting. \n" +
            "\n" +
            "Listen to Music Albums \n" +
            "Borrow full albums by artists like Taylor Swift, Sabrina Carpenter, Bruno Mars and Morgan Wallen. Shuffle between multiple albums to create a unique playlist of songs by your favorite musical artists. \n" +
            "\n" +
            "Built for How You Live \n" +
            "• Apple CarPlay support for hands-free audiobooks and music on the road\n" +
            "• Dark mode for comfortable late-night reading \n" +
            "• Sleep timer so you never lose your place \n" +
            "• Offline downloads — no data needed once borrowed \n" +
            "\n" +
            "All you need is a free library card from a participating library. ",
        iconUrl: "308c396b-2a14-42b5-ae39-354212f89993",
        developers: ["Osiris Zigmantas", "Ophiuchus Semisi", "Muzaffar Adeyemi"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        name: "Roost Social",
        subtitle: "Old school messages, by pigeon",
        description: "Slowcial Media. Make Friends and Stay Close. Watch your carrier pigeon travel in real time with your messages. Collect birds, train your flock, and stay in the moment.\n" +
            "\n" +
            "Roost brings back old school messages with carrier pigeons and snail mail. You send a note, a bird picks it up, and it flies across the world to your friends. No instant delivery. No read receipts ten seconds later. Just a little bird in the air, carrying your words, taking the time it takes.\n" +
            "\n" +
            "Watch yours and your friends birds fly in real time around the world. Be in the moment. Send something and go live your day. When your bird lands, it lands.\n" +
            "\n" +
            "BUILD YOUR ROOKERY\n" +
            "Catch birds of every feather. Your favorite New York Pigeon, rare cardinals, mythical phoenixes. Every one has its own speed based on their real speeds. Feed them, level them up, watch your flock grow.\n" +
            "\n" +
            "REAL MAPS, REAL FLIGHTS\n" +
            "Every delivery flies a real route across a real map. Track your bird as it goes. See where it is, how far it's come, when it's landing.\n" +
            "\n" +
            " FRIENDS, NOT FEEDS\n" +
            " No algorithms. No endless scroll. Just your people and the birds that carry your words. Add friends by username and keep your circle small and good.\n" +
            "\n" +
            "TRAIN YOUR FLOCK\n" +
            "Quick mini games boost speed, have fun. A faster pigeon means a faster message. A better flock means a better rookery.\n" +
            "\n" +
            "WEEKLY REWARDS\n" +
            "Log in for daily drops. Claim new birds from rotating events. Hunt for mythic birds in limited time releases.\n" +
            "\n" +
            "Slow your messages down. Send them by pigeon.\n" +
            "\n" +
            "Download Roost and launch your first flight.\n",
        iconUrl: "38dfdd5b-a44a-4469-b751-040a03b23a86",
        developers: ["Silvia Brage", "Þórgunnr Raginfrid", "Heidi Serafina"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "4c0ad5ee-d9ea-4d70-9842-a25f9e7ac777",
        name: "SignNow: e-Signature app",
        subtitle: "Sign documents & PDF forms",
        description: "SignNow is used by over 6 million people worldwide to sign, send, and manage documents — wherever they are, on any device.\n" +
            "Skip printing, scanning, and waiting. With SignNow, you can get legally binding e-signatures in minutes.\n" +
            "\n" +
            "SIGN & SEND DOCUMENTS\n" +
            "• Sign PDFs, Word files, and other formats in just a few taps\n" +
            "• Send documents to one or more recipients via email or link\n" +
            "• Set the signing order and assign roles\n" +
            "• Get notified in real time when documents are opened or signed\n" +
            "• Collect in-person signatures with Kiosk Mode — ideal for events, front desks, or check-ins\n" +
            "\n" +
            "FILL & EDIT DOCUMENTS\n" +
            "• Fill out forms, add text, checkboxes, dates, and stamps\n" +
            "• Convert images (JPEG, PNG, BMP, etc.) into PDFs\n" +
            "• Import files from email, Google Drive, Dropbox, OneDrive, and more\n" +
            "• Create reusable templates for documents you send often\n" +
            "\n" +
            "MANAGE YOUR DOCUMENT WORKFLOW\n" +
            "• Collaborate with your team on shared documents\n" +
            "• Track document status and view detailed audit history\n" +
            "• Organize files into folders for quick access\n" +
            "• Store all signed documents securely\n" +
            "\n" +
            "SECURITY & COMPLIANCE\n" +
            "• 256-bit encryption for data in transit and at rest\n" +
            "• Legally binding e-signatures compliant with ESIGN, UETA, and eIDAS\n" +
            "• Detailed audit trails with timestamps, IP addresses, and signer info\n" +
            "• Works offline — sign and edit documents without internet, sync when back online\n" +
            "• Supports MobileIron AppConnect for enterprise-grade security\n" +
            "\n" +
            "MORE WAYS TO WORK\n" +
            "• Sign in with your Google or Apple account\n" +
            "• Access documents from mobile or web\n" +
            "• Print documents directly from the app\n" +
            "• Use widgets for quick access to key actions\n",
        iconUrl: "72ffdc60-1d22-46a9-8315-dcbf605cd6bb",
        developers: ["Tutku Magnus"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Utilities",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        name: "Bandcamp",
        subtitle: "Buy music, support artists.",
        description: "Bandcamp is an online record store and music community where passionate fans connect with and directly support the artists they love.\n" +
            "\n" +
            "The Bandcamp app lets fans explore a vast catalog of music by artists from every corner of the globe, allows them to directly support artists by buying their merch (and wishlisting albums & tracks for purchase at a later time), and lets them instantly listen to the music they've purchased, online or offline.",
        iconUrl: "e5d956fd-0583-4cf4-9c04-544384eee795",
        developers: ["Myranda Onouphrios", "Raz Aoede"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Entertainment",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        name: "FocusFlight - Deepfocus Timer",
        subtitle: "Take off into deep focus",
        description: "## Focus Timer\n" +
            "## App Blocker\n" +
            "\n" +
            "In a world full of distractions, FocusFlight offers a unique way to focus: turning every session into an immersive flight journey.\n" +
            "\n" +
            "From boarding and takeoff to staying focused in the air and landing at the end, FocusFlight combines aviation-inspired design with practical focus tools. It is more than a timer or app blocker — it is an experience that helps you avoid distractions, get into flow, and complete what matters.\n" +
            "\n" +
            "FocusFlight has been featured by the App Store as App of the Day. Whether you are studying, working, reading, or simply trying to put your phone down, FocusFlight helps you start with intention and end with a sense of completion.\n" +
            "\n" +
            "FOCUSFLIGHT FEATURES\n" +
            "\n" +
            "【Immersive Flight Experience】\n" +
            "Opening FocusFlight feels like boarding a focus flight. Set your boarding pass, choose your task and focus duration, then begin your own deep focus journey. When the session ends, your flight lands safely with a clear sense of achievement.\n" +
            "\n" +
            "【Airplane Mode, Block Distractions】\n" +
            "Turn on “Airplane Mode” to block distracting apps and websites during your focus session. Powered by Apple’s Screen Time integration, FocusFlight helps you stay away from interruptions and focus on what matters.\n" +
            "\n" +
            "【3D Map Window View】\n" +
            "During your focus session, watch your journey through a 3D map window. As time passes, your flight moves across the world map, turning focus into a journey you can see and feel.\n" +
            "\n" +
            "【3D Flight Routes】\n" +
            "Every focus session becomes a visualized flight route. See where you departed, where you are heading, and review the routes you have completed.\n" +
            "\n" +
            "【Random Route Mode】\n" +
            "Not sure where to fly? Start with Random Route Mode. No need to choose a destination in advance — just begin focusing, and discover where you land when the session ends.\n" +
            "\n" +
            "【FlightLog】\n" +
            "Every focus flight is saved in FlightLog. Review your departure city, landing city, focus duration, flight distance, and route history.\n" +
            "\n" +
            "【Membership Cards & Flight Miles】\n" +
            "As your focus time and flight miles grow, you can unlock and upgrade your own membership cards. Each card marks your progress and gives your journey a stronger sense of identity.\n" +
            "\n" +
            "【Multiple Map Modes】\n" +
            "FocusFlight offers 3D, satellite, and classic map modes. Explore routes and destinations from different perspectives, and enjoy traveling the world while staying focused.\n" +
            "\n" +
            "【White Noise & Focus Music】\n" +
            "During each focus flight, you can turn on white noise or focus music to create a calmer environment for studying, working, or reading. From airplane ambience to soothing focus tracks, FocusFlight helps you enter a quieter, more focused state.\n" +
            "\n" +
            "【Focus Records & Data Tracking】\n" +
            "Each session leaves a clear record, including your boarding pass, flight data, route, and focus duration. Use these records to review your focus habits and see the value of every session.\n" +
            "\n" +
            "【Different Focus Types】\n" +
            "Choose focus types through seat options, such as study, work, reading, or creative time. Make every flight better matched to your current task, and make focusing more flexible and fun.\n",
        iconUrl: "594d534e-99cd-4041-93c1-46c273a848ec",
        developers: ["Gunta Ingulf"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Utilities",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        name: "Mr Health",
        subtitle: "Personal Health Companion",
        description: "Mr Health helps you understand what’s actually inside the products you buy every day.\n" +
            "\n" +
            "Scan food, cosmetics, alcohol, and pet food to see clear, easy-to-understand breakdowns of ingredients — without the confusing labels, marketing fluff, or fine print.\n" +
            "\n" +
            "Whether you’re standing in the supermarket aisle or checking something at home, Mr Health gives you the information you need to make more informed choices.\n" +
            "\n" +
            "What you can scan\n" +
            "\t•\tFood & drinks\n" +
            "\t•\tCosmetics & personal care\n" +
            "\t•\tAlcohol\n" +
            "\t•\tPet food\n" +
            "\n" +
            "Each product is analysed and rated using a consistent, transparent scoring system so you can easily compare options.\n" +
            "\n" +
            "How it works\n" +
            "\t1.\tScan the barcode\n" +
            "\t2.\tSee a clear score and category\n" +
            "\t3.\tView ingredient insights and explanations\n" +
            "\t4.\tCompare with better alternatives\n" +
            "\n" +
            "No guesswork. No digging through labels.\n" +
            "\n" +
            "Free features\n" +
            "\t•\tScan food and cosmetics (limited daily scans)\n" +
            "\t•\tView basic product scores\n" +
            "\t•\tSee alternative product suggestions\n" +
            "\n" +
            "Premium features\n" +
            "\n" +
            "Upgrade to unlock the full Mr Health experience:\n" +
            "\t•\tUnlimited scans\n" +
            "\t•\tFull access to alcohol scans\n" +
            "\t•\tFull access to pet food scans\n" +
            "\t•\tNo blurred results or daily limits\n" +
            "\t•\tPriority access to new features\n" +
            "\n" +
            "Premium is designed for people who want the full picture — across everything they eat, drink, use, or feed their pets.\n" +
            "\n" +
            "Our approach\n" +
            "\n" +
            "Mr Health uses ingredient analysis, nutritional balance frameworks, and additive research to provide comparative product ratings.\n" +
            "Scores are designed to help you compare products — not to diagnose, treat, or replace professional advice.\n" +
            "\t•\tAlcohol is rated based on formulation, additives, and transparency\n" +
            "\t•\tPet food is rated based on ingredient quality and formulation\n" +
            "\t•\tCosmetics are rated based on ingredient profiles and exposure\n" +
            "\t•\tFood is rated using nutritional balance and ingredient analysis\n" +
            "\n" +
            "Important notes\n" +
            "\t•\tMr Health does not provide medical or veterinary advice\n" +
            "\t•\tScores compare products within the same category\n" +
            "\t•\tAlways consult qualified professionals for individual health needs\n" +
            "\n" +
            "Why Mr Health\n" +
            "\t•\tOne app for food, alcohol, cosmetics, and pet food\n" +
            "\t•\tClear explanations in plain English\n" +
            "\t•\tBuilt for everyday shopping, not perfection\n" +
            "\t•\tNo brand partnerships influencing scores\n",
        iconUrl: "c6409053-52db-440a-8583-3e2a9ee60383",
        developers: ["Emiliya Aada"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Health",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    },
    {
        id: "3ef625e2-3796-4756-831f-cda3d46114ab",
        name: "Yubo: Make friends & chat now",
        subtitle: "Meet new friends, find your bff",
        description: "Welcome to Yubo – the ultimate social platform for making new friends all over the world! With millions of users worldwide, we’re all about connecting you with like-minded people in a fun and safe place! \n" +
            "\n" +
            "FEW THINGS YOU NEED TO KNOW ABOUT YUBO\n" +
            "\n" +
            "1) SWIPE TO MAKE NEW FRIENDS: Use our swipe feature to find new friends who are online and share the same interests! With just a swipe, you could meet your new bestie!\n" +
            "\n" +
            "2) CHAT WITH FRIENDS WORLDWIDE: One of the coolest things about Yubo is that you can chat with people from all over the world! Whether you're feeling silly, want to sing, dance, or chat about your day, Yubo has got you covered!\n" +
            "\n" +
            "3) FIND YOUR TRIBE: At Yubo, finding your tribe is key to making lasting connections! Thanks to the Tags, you can find other people into gaming, beauty, sports, music, dance, and so much more! So, whether you’re a gamer, a makeup artist, or just looking for like-minded friends, Yubo has got you covered!\n" +
            "\n" +
            "4) IT’S FREE: Yubo is totally free to use! \n" +
            "\n" +
            "5) IT’S SAFE: We take your safety seriously. That's why we've designed many features and tools to ensure you can use Yubo safely. \n" +
            "\n" +
            "So, what are you waiting for? \n",
        iconUrl: "fb634641-fc81-4342-9f52-0dd154a22781",
        developers: ["Muireann Onnophris", "Mira Nontle"],
        approvalStatus: "APPROVED",
        rejectionReason: null,
        links: [],
        order: null,
        categoryName: "Social Media",
        showcase: {
            name: "Capstone",
            year: 2026,
            semester: 1
        }
    }
]

type NewProjectMediaType = Omit<ProjectMedia, "id">

export const projectMediaData: NewProjectMediaType[] = [
    {
        order: "",
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "6fcc12df-28ce-449a-83c6-fb2a38e84bd7",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "31df5f95-083f-4881-9e2d-f3b42e03cd11",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "11d35ee7-0a2a-4c10-9fa5-a2e6482f4eae",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "69064039-8d63-4fe2-b4c5-0fa46086da39",
        mediaUrl: "f50c81e0-dbf3-4fb7-9e87-bffb848d9c9d",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "15860d99-4e9d-4870-98d8-e3aa88b74624",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "5e1aa249-c881-4bd6-a2f2-9a114a1caea5",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "3e06ad3e-f992-4d12-808b-9ae346c6d653",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "3e06ad3e-f992-4d12-808b-9ae346c6d653",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "92e52aa6-92ae-44a6-90de-e04d4dc1f4c6",
        mediaUrl: "4d520f57-73b6-4620-a072-7ab1c0611264",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "72aa86d5-6e3d-4b3a-b366-a6d4e0e24f75",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "ad763471-32ac-44b0-88d3-336e7dd7f0ac",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "d2b3800d-f62c-4518-9dc8-32061b6abf38",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "6629b104-1f33-4264-92d5-437b514d7fd7",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "f3cae66d-6c92-4d34-90fe-6e4afb889c55",
        mediaUrl: "5359999d-1e73-4b90-996a-04a54c6d8aa6",
        mediaType: "SCREENSHOT",
        deviceType: "TV"
    },
    {
        order: "",
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "cecdf8c8-2b7c-4968-8b14-8acf6ea5fa00",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "d26caccd-32a1-40c5-b24b-a25453222aa3",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "44c58321-7b60-48c8-bde1-cfc3d9d248f6",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "e57666ab-186d-45ca-ba5b-b8a5703bea49",
        mediaUrl: "434331c2-b390-4fef-9dcf-ac9813f76b35",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "ef6acd60-355d-427b-91e5-9d10bcb2a2f5",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "f86772ad-f121-43f6-932d-1c4693498835",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "02328a4c-0336-47d8-90ef-60ef96390d87",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "bc39d09b-1b2d-4c15-a07a-39563200157b",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "9659268c-7b60-47c5-9818-48718ad963e5",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "37d84efb-4b02-4694-a85f-40a9aa6d725c",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "b5dadbc2-ef55-4201-8052-6bab1f12ed28",
        mediaUrl: "34c17330-171f-4d1f-9433-c453a9f022ec",
        mediaType: "SCREENSHOT",
        deviceType: "TV"
    },
    {
        order: "",
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "3cbe00bd-f269-4bc8-8cf8-8f3a0360963e",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "6ad331e6-910e-41e0-8cc1-595fe966faed",
        mediaUrl: "b8a42708-75cd-4f23-aede-9fd644cdae12",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "3dfa64a7-ac51-4dc6-83d8-d5543a09bc48",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "2713734f-e46f-46f3-8a2d-945b5b22ece2",
        mediaUrl: "7ae7d8b4-9ff9-40f5-b59a-84a3e4427b8a",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "601a6641-7d7d-436d-bf20-7b11902192aa",
        mediaUrl: "999dd8cc-ab4d-48c9-8e89-774bd536b224",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "c6bc2e0e-4c29-472e-b0c4-1e353ea24d7c",
        mediaUrl: "acbee86f-7c6e-4983-90f9-4b157ef59e7d",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "b8bab4fb-2b94-44b1-9859-3b30e5ce2660",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "90309509-4d4b-4d8b-92d3-798e6f8a0269",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "1433f794-e118-4a61-9292-b9b196d7a73e",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "d5d6d726-b382-47af-aa34-bf63ebfbc0a0",
        mediaUrl: "b919ba51-4f05-45f4-ade2-7747bd3b9ef4",
        mediaType: "SCREENSHOT",
        deviceType: "DESKTOP"
    },
    {
        order: "",
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "20f3c14c-1a89-4a24-84ef-13add0b889de",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "ecf961e9-aee6-40a3-bfaf-8901392e46eb",
        mediaUrl: "73a458bf-aabb-4b76-9023-c9a4bb2ea508",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "af217389-0fc5-4eae-aeba-6a1ebd313bb8",
        mediaUrl: "b41fc61b-d098-46e7-98b8-ec9d3e2aa492",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "bbf180cc-e281-451b-b6d6-06e5f2c6bc4c",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "73e6b87e-9159-4c70-9b6d-556dd7149cb4",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "1f8d0846-1958-4b6f-b350-ce981b863ef8",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ae40dc9-4321-45b2-a2a3-bd26292faaa9",
        mediaUrl: "5323bca5-fb8f-4271-819d-641a713aff01",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "f9617d57-0cc4-450e-ba91-39a65b7ae771",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "3cc7d039-1b85-420e-94e9-572d28aba041",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "516b7949-ad6b-4851-b686-880b70c9ec75",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "6b03c85d-16ab-47c2-ae93-306b54b52b3e",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "181039d7-2674-464b-bc68-05a372f03558",
        mediaUrl: "c0e6f07b-b514-421b-bb52-5947af7844b0",
        mediaType: "SCREENSHOT",
        deviceType: "TABLET"
    },
    {
        order: "",
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "1371ff61-ec36-4c54-aded-f3f3f8362cbf",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "4752beb8-e38f-409b-a6a1-469c66528ad1",
        mediaUrl: "9163f111-4168-4cba-b106-5ac54463333a",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "b6118d84-ed9a-4953-8d9d-723bfa83014d",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "714002cf-fda8-4ce3-98f7-f2b52b92fdf8",
        mediaUrl: "520e2f52-783b-4913-bd3b-01ca5c494c33",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "b7437035-3da3-472a-a576-ad87a87cd45b",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "69713fee-abcb-4a90-8987-1402c4928ad0",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "5699bda6-e3ff-4037-8698-5bf54d60d1a8",
        mediaType: "SCREENSHOT",
        deviceType: "WATCH"
    },
    {
        order: "",
        projectId: "fd878b06-542c-48c1-be7e-42effb2adeb6",
        mediaUrl: "2a9aa191-dbd5-4956-99e1-f957b7342dc4",
        mediaType: "SCREENSHOT",
        deviceType: "WATCH"
    },
    {
        order: "",
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "8f0bb76b-1631-4b3f-8cd5-346b9e0ad3be",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "973fbf56-e4f3-48e0-b827-0cd0864a0398",
        mediaUrl: "43a105e3-1afe-4ad6-a1c1-a225a3c1e4f2",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "7ce643ef-2f31-4971-b3dd-0c526fe2e588",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "4b38d484-8d56-46d1-b6a6-31ee4bd1359d",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "78034fbd-fcc7-4f77-898e-8324dc569da7",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "c8608063-24f2-437e-bdbb-eedabb153552",
        mediaType: "SCREENSHOT",
        deviceType: "AR"
    },
    {
        order: "",
        projectId: "43ec2b48-0d1e-4005-8b09-b5674fbd4f4f",
        mediaUrl: "f26c0675-3082-481c-9e2c-386e91bbe011",
        mediaType: "SCREENSHOT",
        deviceType: "AR"
    },
    {
        order: "",
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "37cabef7-59c2-412f-b866-bf47c5a9c5df",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "80bee0a6-cf6a-41c5-80fc-89d45a23b3b3",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "9deafdbc-b50f-437f-94ea-fdd46b2c3b99",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "cf1a1be5-25ed-4239-9b61-d9895c832dfb",
        mediaUrl: "982ee922-41bf-45d8-a946-b79b12164ed3",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "0dbed4e8-a350-47bc-a276-b2ac9f899d40",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "e1e4f5e4-08d0-4eb4-8808-412fe12975ea",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "bccbeeea-dc23-45f6-b2c4-d5a4525df803",
        mediaUrl: "e1e4f5e4-08d0-4eb4-8808-412fe12975ea",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "880ef0ad-9d31-4510-aa60-3f2f2c10f6bc",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "d17a45fa-cf52-4f4f-b61b-4fc51fd1a730",
        mediaType: "SCREENSHOT",
        deviceType: "WATCH"
    },
    {
        order: "",
        projectId: "48a9a93c-e109-4c33-8675-f267b0fa880e",
        mediaUrl: "63cd773b-19cf-4bfd-a992-a8847f063c58",
        mediaType: "SCREENSHOT",
        deviceType: "WATCH"
    },
    {
        order: "",
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "edea552b-aa04-458b-80d9-46bd2e524f90",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "5a18c8cd-5dd6-4a76-bd57-6a4210375be5",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "704a41d4-545a-4584-b14f-a29fc3d9a963",
        mediaType: "SCREENSHOT",
        deviceType: "TV"
    },
    {
        order: "",
        projectId: "2e1c5e5c-d75b-4e80-9965-4bc456092ba5",
        mediaUrl: "19c16358-dfd5-47f0-86d3-4cbb71182ee1",
        mediaType: "SCREENSHOT",
        deviceType: "TV"
    },
    {
        order: "",
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "893b334a-175e-4983-8b08-87f838b4b774",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "ec866bf4-58ec-426d-96dc-738d875a7617",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "480490ca-a41a-4b05-98b8-f8027a47c73b",
        mediaUrl: "fb43fdd1-af23-4a7e-b7fe-bb8cc15f7652",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "46e9d3f4-0e3a-44eb-afba-15da5b0159f1",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "6db209e9-3c84-4021-b3d2-fe4f379ab3ff",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "8b231bab-1711-456d-b957-6b36ca6db6f1",
        mediaUrl: "59e02454-ba07-4971-a766-ada7bcca6f88",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "905a88f8-44dd-4120-8aef-009cf82d7b78",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "452ab937-8832-4b6d-8dff-a9c69c2bd332",
        mediaType: "SCREENSHOT",
        deviceType: "DESKTOP"
    },
    {
        order: "",
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "e0459a06-87fe-47f5-97e6-a68e018b0f69",
        mediaType: "SCREENSHOT",
        deviceType: "DESKTOP"
    },
    {
        order: "",
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "c363524f-0d20-4551-9023-0a43ef97332e",
        mediaType: "SCREENSHOT",
        deviceType: "DESKTOP"
    },
    {
        order: "",
        projectId: "508663c5-dce5-4e07-96ae-1300e6d96d88",
        mediaUrl: "c363524f-0d20-4551-9023-0a43ef97332e",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "985d1580-d83a-4a93-be58-ba81de5a639e",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "e4c37641-e09a-4e0f-af84-01155cf8f943",
        mediaUrl: "dad5e167-5d6d-48ff-bc1d-b47c28491731",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "7a088314-87c2-45a0-bd5e-289d60d671ca",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "62b580e2-3c7f-4c32-b1ba-cec8963476b2",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "408e056b-58dc-4214-ac07-6172ced5f817",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
    {
        order: "",
        projectId: "3ef625e2-3796-4756-831f-cda3d46114ab",
        mediaUrl: "59d355a0-9c67-4ec3-bd5b-42f2667fd358",
        mediaType: "SCREENSHOT",
        deviceType: "PHONE"
    },
]
