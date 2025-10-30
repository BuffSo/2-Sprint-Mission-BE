const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const OLD_API_URL = 'https://panda-market-api.vercel.app';

// 품질 필터링 함수
function isValidProduct(product) {
  // 가격이 0원이거나 비정상적으로 높은 경우 제외
  if (product.price === 0 || product.price > 100000000) {
    return false;
  }

  // 상품명이 너무 짧거나 의미 없는 경우 제외
  const name = product.name.trim();
  if (name.length < 2 || /^[ㅇㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ\d]+$/.test(name)) {
    return false;
  }

  // 설명이 너무 짧거나 없는 경우 제외
  const description = (product.description || '').trim();
  if (description.length < 2 || description === '.' || description === 'string') {
    return false;
  }

  // 테스트 키워드가 들어간 경우 제외
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

async function importProducts() {
  try {
    console.log('🚀 Starting product import from old API...\n');

    // Get current user to assign as owner
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    // Use the first user as the default owner
    const defaultOwner = users[0];
    console.log(`📦 Using ${defaultOwner.email} as product owner\n`);

    let page = 1;
    const pageSize = 100;
    let totalImported = 0;
    let totalSkipped = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching page ${page}...`);

      const response = await fetch(`${OLD_API_URL}/products?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();

      const { list, totalCount } = data;

      if (!list || list.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Found ${list.length} products on this page`);

      for (const product of list) {
        try {
          // 품질 필터링 체크
          if (!isValidProduct(product)) {
            totalSkipped++;
            console.log(`   ⏭️  Skipped "${product.name}" (품질 기준 미달)`);
            continue;
          }

          // Check if product already exists by name to avoid duplicates
          const existing = await prisma.product.findFirst({
            where: { name: product.name }
          });

          if (existing) {
            console.log(`   ⏭️  Skipped "${product.name}" (already exists)`);
            continue;
          }

          // Create product in new database
          await prisma.product.create({
            data: {
              name: product.name,
              description: product.description || '',
              price: product.price,
              tags: product.tags || [],
              images: product.images || [],
              authorId: defaultOwner.id,
              favoriteCount: 0, // Reset favorite count for new database
            }
          });

          totalImported++;
          console.log(`   ✅ Imported: "${product.name}" (${product.price.toLocaleString()}원)`);
        } catch (error) {
          console.error(`   ❌ Failed to import "${product.name}":`, error.message);
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
    console.log(`📊 Total products imported: ${totalImported}`);
    console.log(`⏭️  Total products skipped: ${totalSkipped}`);

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importProducts();
