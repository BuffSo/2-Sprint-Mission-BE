/**
 * Production 환경에 데이터 import하기
 *
 * 사용법:
 * 1. 프로덕션 DATABASE_URL을 환경 변수로 설정
 * 2. node scripts/import-to-production.js
 *
 * 또는
 * DATABASE_URL="프로덕션DB주소" node scripts/import-to-production.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const OLD_API_URL = 'https://panda-market-api.vercel.app';

// 품질 필터링 함수들
function isValidProduct(product) {
  if (product.price === 0 || product.price > 100000000) {
    return false;
  }

  const name = product.name.trim();
  if (name.length < 2 || /^[ㅇㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ\d]+$/.test(name)) {
    return false;
  }

  const description = (product.description || '').trim();
  if (description.length < 2 || description === '.' || description === 'string') {
    return false;
  }

  const testKeywords = ['테스트', 'test', 'ㅇㅇ', '123', 'string', 'zzz'];
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();

  for (const keyword of testKeywords) {
    if (lowerName === keyword || lowerDesc === keyword) {
      return false;
    }
  }

  return true;
}

function isValidArticle(article) {
  const title = (article.title || '').trim();
  if (title.length < 2 || /^[ㅇㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ\d]+$/.test(title)) {
    return false;
  }

  const content = (article.content || '').trim();
  if (content.length < 2) {
    return false;
  }

  if (title.includes('<script>') || content.includes('<script>')) {
    return false;
  }

  const testKeywords = ['테스트', 'test', 'ㅇㅇㅇㅇ', '123', 'dd', 'asd'];
  const lowerTitle = title.toLowerCase();

  for (const keyword of testKeywords) {
    if (lowerTitle === keyword) {
      return false;
    }
  }

  if (title === content) {
    return false;
  }

  return true;
}

async function importData() {
  try {
    console.log('🚀 Starting data import to PRODUCTION...\n');
    console.log('⚠️  WARNING: This will import data to the production database!\n');

    // Verify we're connected to the right database
    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`📊 Database: ${dbUrl.substring(0, 50)}...\n`);

    // Get a user to assign as owner
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.error('❌ No users found. Please create at least one user first.');
      process.exit(1);
    }

    const defaultUser = users[0];
    console.log(`👤 Using ${defaultUser.email} as owner/author\n`);

    let totalProductsImported = 0;
    let totalProductsSkipped = 0;
    let totalArticlesImported = 0;
    let totalArticlesSkipped = 0;

    // Import Products
    console.log('📦 Importing products...\n');
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching products page ${page}...`);
      const response = await fetch(`${OLD_API_URL}/products?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      const { list, totalCount } = data;

      if (!list || list.length === 0) {
        hasMore = false;
        break;
      }

      for (const product of list) {
        if (!isValidProduct(product)) {
          totalProductsSkipped++;
          continue;
        }

        const existing = await prisma.product.findFirst({
          where: { name: product.name }
        });

        if (existing) {
          totalProductsSkipped++;
          continue;
        }

        try {
          await prisma.product.create({
            data: {
              name: product.name,
              description: product.description || '',
              price: product.price,
              tags: product.tags || [],
              images: product.images || [],
              authorId: defaultUser.id,
              favoriteCount: 0,
            }
          });
          totalProductsImported++;
        } catch (error) {
          console.error(`   ❌ Failed: "${product.name}"`);
        }
      }

      if (totalProductsImported >= totalCount || list.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Products: ${totalProductsImported} imported, ${totalProductsSkipped} skipped\n`);

    // Import Articles
    console.log('📝 Importing articles...\n');
    page = 1;
    hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching articles page ${page}...`);
      const response = await fetch(`${OLD_API_URL}/articles?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      const { list, totalCount } = data;

      if (!list || list.length === 0) {
        hasMore = false;
        break;
      }

      for (const article of list) {
        if (!isValidArticle(article)) {
          totalArticlesSkipped++;
          continue;
        }

        const existing = await prisma.article.findFirst({
          where: { title: article.title }
        });

        if (existing) {
          totalArticlesSkipped++;
          continue;
        }

        try {
          await prisma.article.create({
            data: {
              title: article.title,
              content: article.content || '',
              author: {
                connect: { id: defaultUser.id }
              },
              favoriteCount: 0,
            }
          });
          totalArticlesImported++;
        } catch (error) {
          console.error(`   ❌ Failed: "${article.title}"`);
        }
      }

      if (totalArticlesImported >= totalCount || list.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Articles: ${totalArticlesImported} imported, ${totalArticlesSkipped} skipped\n`);

    console.log('='.repeat(80));
    console.log('\n✨ Import completed!\n');
    console.log(`📊 Summary:`);
    console.log(`   Products: ${totalProductsImported} imported`);
    console.log(`   Articles: ${totalArticlesImported} imported`);
    console.log(`   Total: ${totalProductsImported + totalArticlesImported} items\n`);

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importData();
