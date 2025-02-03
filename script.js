document.addEventListener('DOMContentLoaded', () => {
    /* 画面遷移動作 */
    const body = document.body;
    const animationBg = document.querySelector('.op-animation');

    // トップページのみアニメーション
    const isTopPage = window.location.pathname === '/mercidog/' || window.location.pathname.endsWith('index.html');

    if (isTopPage) {
        setTimeout(() => {
            body.classList.add('move-order', 'loaded');
        }, 100);

        const lastElement = animationBg?.querySelector('.op-animation__element:last-child');
        if (lastElement) {
            lastElement.addEventListener('animationend', () => {
                animationBg.style.display = 'none';
            });
        }
    } else {
        body.classList.add('loaded');
        if (animationBg) {
            animationBg.style.display = 'none';
        }
    }

    /* フェードイン動作 */
    const scrollElements = document.querySelectorAll('.scroll-up, .scroll-left, .scroll-right, .bg');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('on');
                if (entry.target.classList.contains('bg')) {
                    entry.target.classList.add('is-animated');
                }
            }
        });
    }, { threshold: 0.3 });

    scrollElements.forEach((el) => observer.observe(el));

    /* カルーセル動作 */
    const images = document.querySelectorAll('.slide__image');

    const updateImages = () => {
        images.forEach((img) => {
            const desktopSrc = img.getAttribute('data-desktop');
            if (window.innerWidth >= 768 && desktopSrc) {
                img.setAttribute('src', desktopSrc);
            } else {
                const originalSrc = img.getAttribute('src');
                img.setAttribute('src', originalSrc);
            }
        });
    };

    updateImages();
    window.addEventListener('resize', updateImages);
});

/* ハンバーガーメニュー動作 */
const ham = document.querySelector('#js-hamburger');
const nav = document.querySelector('#js-nav');
const body = document.body;

ham.addEventListener('click', function () {
    const isActive = ham.classList.toggle('active');
    nav.classList.toggle('active');

    if (isActive) {
        body.classList.add('no-scroll');
    } else {
        body.classList.remove('no-scroll');
    }
});

/* ページ内リンク動作 */
document.querySelectorAll('a.scroll').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    block: 'start'
                });
            }

            // メニューを閉じる動作
            if (ham.classList.contains('active')) {
                ham.classList.remove('active');
                nav.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        }
    });
});