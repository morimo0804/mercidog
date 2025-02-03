const { createClient } = microcms;
const client = createClient({
    serviceDomain: 'mercidog',
    apiKey: 'S3qlC2DSpDS2IfSPwLfBleHW11fJvnkWLKFW'
});

/* 記事取得処理 */
function loadNews(limit = 3, pageId = 'index', currentPage = 1) {
    client.get({
        endpoint: 'news',
        queries: {
            limit: limit,
            offset: (currentPage - 1) * limit,
            orders: '-publishedAt'
        }
    }).then((res) => {
        const newsListElement = document.querySelector('.news__list');
        newsListElement.innerHTML = '';

        res.contents.forEach((item) => {
            const articleElement = document.createElement('article');
            articleElement.className = 'post__item';
            articleElement.innerHTML = `
    <a href="single.html?id=${item.id}" class="post__link">
            <time class="post__date" datetime="${item.publishedAt.split('T')[0]}">
                ${new Date(item.publishedAt).toLocaleDateString('ja-JP')}
            </time>
        <h3 class="post__title">${item.title}</h3>
    </a>
`;
            newsListElement.appendChild(articleElement);
        });

        if (pageId === 'news' && res.totalCount > limit) {
            createPagination(res.totalCount, limit, currentPage);
        }
    }).catch((err) => {
        console.error(err);
        const newsListElement = document.querySelector('.news__list');
        newsListElement.innerHTML = '<p>ニュースを読み込めませんでした。インターネット接続を確認してください。</p>';
    });
}

/* ページネーション */
function createPagination(totalCount, limit, currentPage = 1) {
    const paginationElement = document.createElement('div');
    paginationElement.className = 'pagination';

    const totalPages = Math.ceil(totalCount / limit);

    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    /* 前へボタン処理 */
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '<';
    prevLink.className = 'page-link';
    if (currentPage === 1) {
        prevLink.classList.add('disabled');
    }
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            loadNews(limit, 'news', currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationElement.appendChild(prevLink);

    /* ページ番号ボタン処理 */
    const maxVisiblePages = 5;
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    if (startPage > 1) {
        const firstPageLink = document.createElement('a');
        firstPageLink.href = '#';
        firstPageLink.textContent = '1';
        firstPageLink.className = 'page-link';
        firstPageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadNews(limit, 'news', 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationElement.appendChild(firstPageLink);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.className = 'page-link';
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadNews(limit, 'news', i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationElement.appendChild(pageLink);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }

        const lastPageLink = document.createElement('a');
        lastPageLink.href = '#';
        lastPageLink.textContent = totalPages;
        lastPageLink.className = 'page-link';
        lastPageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadNews(limit, 'news', totalPages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationElement.appendChild(lastPageLink);
    }

    /* 次へボタン処理 */
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '>';
    nextLink.className = 'page-link';
    if (currentPage === totalPages) {
        nextLink.classList.add('disabled');
    }
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            loadNews(limit, 'news', currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationElement.appendChild(nextLink);

    const newsInnerElement = document.querySelector('.news__inner');
    newsInnerElement.appendChild(paginationElement);
}

/* single.htmlでの表示 */
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // single.htmlのみ処理
    const isSinglePage = document.querySelector('.single__title') !== null;

    if (!isSinglePage) {
        // news.htmlなら実行せずに終了
        return;
    }

    const titleElement = document.querySelector('.single__title');
    const contentElement = document.querySelector('.post__text');
    const dateElement = document.querySelector('.post__date');
    const metaTitle = document.querySelector('title');
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    const metaOgDescription = document.querySelector('meta[property="og:description"]');
    const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]');
    const metaTwitterDescription = document.querySelector('meta[name="twitter:description"]');

    if (!contentElement) {
        console.error('.post__text が見つかりません');
        return;
    }

    if (!id) {
        console.error('記事IDが見つかりません');
        contentElement.innerHTML = '<p>記事が見つかりません。</p>';
        return;
    }

    contentElement.innerHTML = '<p>読み込み中...</p>';

    try {
        const response = await client.get({
            endpoint: 'news',
            contentId: id
        });

        titleElement.textContent = response.title;
        contentElement.innerHTML = response.content;
        dateElement.textContent = new Date(response.publishedAt).toLocaleDateString('ja-JP');

        if (metaTitle) metaTitle.textContent = `${response.title} | トリミングサロン Merci Dog`;
        if (metaDescription) metaDescription.setAttribute("content", response.content.slice(0, 100) + "...");
        if (metaOgTitle) metaOgTitle.setAttribute("content", response.title);
        if (metaOgDescription) metaOgDescription.setAttribute("content", response.content.slice(0, 100) + "...");
        if (metaTwitterTitle) metaTwitterTitle.setAttribute("content", response.title);
        if (metaTwitterDescription) metaTwitterDescription.setAttribute("content", response.content.slice(0, 100) + "...");

    } catch (error) {
        console.error('Error:', error);
        contentElement.innerHTML = '<p>記事を取得できませんでした。</p>';
    }

    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }
});