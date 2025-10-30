async function viewArticles() {
  try {
    const response = await fetch('https://panda-market-api.vercel.app/articles?page=1&pageSize=30');
    const data = await response.json();

    const { list, totalCount } = data;

    console.log(`총 ${totalCount}개의 게시글이 있습니다.\n`);
    console.log('='.repeat(80));

    list.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   내용: ${(article.content || '').substring(0, 100)}...`);
      console.log(`   작성자: ${article.writer?.nickname || '(알 수 없음)'}`);
      console.log(`   좋아요: ${article.likeCount}개`);
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

viewArticles();
