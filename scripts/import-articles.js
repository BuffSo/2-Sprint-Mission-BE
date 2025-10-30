const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const OLD_API_URL = 'https://panda-market-api.vercel.app';

// 품질 필터링 함수
function isValidArticle(article) {
  // 제목이 너무 짧거나 의미 없는 경우 제외
  const title = (article.title || '').trim();
  if (title.length < 2 || /^[ㅇㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ\d]+$/.test(title)) {
    return false;
  }

  // 내용이 너무 짧거나 없는 경우 제외
  const content = (article.content || '').trim();
  if (content.length < 2) {
    return false;
  }

  // XSS 스크립트가 포함된 경우 제외
  if (title.includes('<script>') || content.includes('<script>')) {
    return false;
  }

  // 테스트 키워드가 제목에 있는 경우 제외
  const testKeywords = ['테스트', 'test', 'ㅇㅇㅇㅇ', '123', 'dd', 'asd'];
  const lowerTitle = title.toLowerCase();

  for (const keyword of testKeywords) {
    if (lowerTitle === keyword) {
      return false;
    }
  }

  // 제목과 내용이 완전히 동일한 경우 제외 (저품질)
  if (title === content) {
    return false;
  }

  return true;
}

async function importArticles() {
  try {
    console.log('🚀 Starting article import from old API...\n');

    // Get current user to assign as author
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    // Use the first user as the default author
    const defaultAuthor = users[0];
    console.log(`📝 Using ${defaultAuthor.email} as article author\n`);

    let page = 1;
    const pageSize = 100;
    let totalImported = 0;
    let totalSkipped = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching page ${page}...`);

      const response = await fetch(`${OLD_API_URL}/articles?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();

      const { list, totalCount } = data;

      if (!list || list.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Found ${list.length} articles on this page`);

      for (const article of list) {
        try {
          // 품질 필터링 체크
          if (!isValidArticle(article)) {
            totalSkipped++;
            console.log(`   ⏭️  Skipped "${article.title}" (품질 기준 미달)`);
            continue;
          }

          // Check if article already exists by title to avoid duplicates
          const existing = await prisma.article.findFirst({
            where: { title: article.title }
          });

          if (existing) {
            console.log(`   ⏭️  Skipped "${article.title}" (already exists)`);
            continue;
          }

          // Create article in new database
          await prisma.article.create({
            data: {
              title: article.title,
              content: article.content || '',
              author: {
                connect: { id: defaultAuthor.id }
              },
              favoriteCount: 0, // Reset favorite count for new database
            }
          });

          totalImported++;
          console.log(`   ✅ Imported: "${article.title}"`);
        } catch (error) {
          console.error(`   ❌ Failed to import "${article.title}":`, error.message);
        }
      }

      // Check if there are more pages
      if (totalImported >= totalCount || list.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✨ Import completed!`);
    console.log(`📊 Total articles imported: ${totalImported}`);
    console.log(`⏭️  Total articles skipped: ${totalSkipped}`);

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importArticles();
