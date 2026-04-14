import re

with open('frontend/src/pages/social/SocialMain.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace activeCreatorId init
text = text.replace(
    "const [activeCreatorId, setActiveCreatorId] = useState<number | null>(MOCK_CREATORS[0].id);",
    "const [activeCreatorId, setActiveCreatorId] = useState<number | null>(null);"
)

# Replace statuses init
text = text.replace(
    "const [statuses, setStatuses] = useState(INITIAL_STATUSES);",
    "const [statuses, setStatuses] = useState<ScraperConfig[]>([]);\n  const [creators, setCreators] = useState<Creator[]>([]);\n  const [feed, setFeed] = useState<Post[]>([]);\n\n  useEffect(() => {\n    const loadData = async () => {\n      try {\n        const [feedData, creatorsData, statusesData] = await Promise.all([\n          fetchGlobalFeed(),\n          fetchCreators(),\n          fetchProcessStatuses()\n        ]);\n        setFeed(feedData);\n        setCreators(creatorsData);\n        setStatuses(statusesData);\n        if(creatorsData.length > 0) setActiveCreatorId(creatorsData[0].id);\n      } catch (e) { console.error('Failed to load social data', e); }\n    };\n    loadData();\n  }, []);"
)

# Fix references in JSX
text = text.replace("MOCK_CREATORS", "creators")
text = text.replace("MOCK_FEED", "feed")
text = text.replace("INITIAL_STATUSES", "statuses")

with open('frontend/src/pages/social/SocialMain.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
