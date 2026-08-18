class ScrollRevealController {
    constructor(selector = '.reveal', visibleOffset = 100) {
        this.elements = [...document.querySelectorAll(selector)];
        this.visibleOffset = visibleOffset;
        this.onScroll = this.onScroll.bind(this);
    }

    start() {
        this.onScroll();
        window.addEventListener('scroll', this.onScroll, { passive: true });
    }

    onScroll() {
        const threshold = window.innerHeight - this.visibleOffset;

        this.elements.forEach((element) => {
            if (element.getBoundingClientRect().top < threshold) {
                element.classList.add('active');
            }
        });
    }
}

class NavbarController {
    constructor(navbar) {
        this.navbar = navbar;
        this.onScroll = this.onScroll.bind(this);
    }

    start() {
        if (!this.navbar) return;
        this.onScroll();
        window.addEventListener('scroll', this.onScroll, { passive: true });
    }

    onScroll() {
        this.navbar.style.paddingTop = window.scrollY > 50 ? '0' : '1rem';
    }
}

class AnchorNavigationController {
    constructor(headerOffset = 100) {
        this.headerOffset = headerOffset;
    }

    start() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => this.navigate(event, anchor));
        });
    }

    navigate(event, anchor) {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();

        if (target instanceof HTMLDetailsElement) {
            target.open = true;
        }

        window.scrollTo({
            top: target.offsetTop - this.headerOffset,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScrollRevealController().start();
    new NavbarController(document.getElementById('navbar')).start();
    new AnchorNavigationController().start();
});
