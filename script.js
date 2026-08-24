class AnchorNavigationController {
    constructor(headerOffset = 88) {
        this.headerOffset = headerOffset;
    }

    start() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => this.navigate(event, anchor));
        });
    }

    navigate(event, anchor) {
        const selector = anchor.getAttribute('href');
        if (!selector || selector === '#') return;

        const target = document.querySelector(selector);
        if (!target) return;

        event.preventDefault();
        if (target instanceof HTMLDetailsElement) target.open = true;

        const top = target.getBoundingClientRect().top + window.scrollY - this.headerOffset;
        window.scrollTo({
            top,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    }
}

class SectionNavigationController {
    constructor(links) {
        this.links = [...links];
        this.linksById = new Map(this.links.map((link) => [link.dataset.sectionLink, link]));
    }

    start() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => this.update(entries),
            { rootMargin: '-20% 0px -68% 0px', threshold: [0, 0.1] },
        );

        this.linksById.forEach((link, id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });
    }

    update(entries) {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;

        this.links.forEach((link) => {
            const active = link.dataset.sectionLink === visible.target.id;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnchorNavigationController().start();
    new SectionNavigationController(document.querySelectorAll('[data-section-link]')).start();
});

