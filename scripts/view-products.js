async function viewProducts() {
  try {
    const response = await fetch('https://panda-market-api.vercel.app/products?page=1&pageSize=50');
    const data = await response.json();

    const { list, totalCount } = data;

    console.log(`총 ${totalCount}개의 상품이 있습니다.\n`);
    console.log('='.repeat(80));

    list.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   가격: ${product.price.toLocaleString()}원`);
      console.log(`   설명: ${product.description || '(설명 없음)'}`);
      console.log(`   태그: ${product.tags.join(', ') || '(태그 없음)'}`);
      console.log(`   이미지: ${product.images.length}개`);
      console.log(`   좋아요: ${product.favoriteCount}개`);
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

viewProducts();
