const { createClient } = microcms;
const client = createClient({
    serviceDomain: 'mercidog',
    apiKey: 'S3qlC2DSpDS2IfSPwLfBleHW11fJvnkWLKFW'
});

document.addEventListener('DOMContentLoaded', () => {
    client.get({
        endpoint: 'menu',
        queries: {
            limit: 100,
        }
    })
        .then((response) => {
            const menuContainer = document.querySelector('.menu__container');

            response.contents.forEach((item) => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu__item';

                // スクロールヒントを挿入（id="table-td"の時）
                const scrollHint = item.tableid === "table-td"
                    ? `
                        <div id="scroll-wrapper">
                            <div id="scroll-wrapper__inner">
                                <div id="scroll-title">スクロールできます</div>
                                <div id="scroll-line"></div>
                            </div>
                        </div>
                    `
                    : "";

                // コンテンツ作成
                menuItem.innerHTML = `
                    <h3 class="menu__subtitle">${item.title || ""}</h3>
                    ${scrollHint}
                    <div id="${item.tableid || ""}" class="menu__table">${item.table}</div>
                `;

                menuContainer.appendChild(menuItem);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            const menuContainer = document.querySelector('.menu__container');
            menuContainer.innerHTML = '<p>メニューを読み込めませんでした。</p>';
        });
});