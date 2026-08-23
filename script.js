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

class RoleContentRepository {
    constructor() {
        this.roles = {
            qa: {
                kicker: 'GAME QA PORTFOLIO',
                summary: 'Unity 프로젝트에서 확인한 오류를 재현 조건, 원인 확인, 수정 내용, 동일 경로의 재검증 순서로 정리했습니다. 측정하지 않은 성능 효과는 추가 검증 항목으로 분리했습니다.',
                focus: '재현 조건 · 기대 결과와 실제 결과 · 수정 내용 · 재검증 기록',
                resumeUrl: 'https://docs.google.com/document/d/1dCVpQIYkkI47YZY23ezAKFxfIgx9utmdFBN063jTV7E/edit?tab=t.0',
                introUrl: 'https://docs.google.com/document/d/1fXRcvqIc9Iv9emB_g-8ULm9EVxp71F2boU72wr1U1V4/edit?tab=t.0',
            },
            client: {
                kicker: 'GAME CLIENT PORTFOLIO',
                summary: '2인·4주 Felheim과 5인·6주 IDLE CITY에서 담당한 기능을 기준으로, 오류·원인 확인·수정·재검증 기록과 현재 확인 가능한 영상을 정리했습니다.',
                focus: 'Felheim과 IDLE CITY의 오류 · 원인 확인 · 수정 · 재검증 과정',
                documentsVisible: false,
            },
            planning: {
                kicker: 'GAME PLANNING PORTFOLIO',
                summary: 'IDLE CITY에서 구현한 건설 입력·배치 피드백과 팀 QA에서 수정한 수익 조건을 플레이 흐름에 따라 정리했습니다.',
                focus: '게임 규칙 · 플레이 흐름 · UI 피드백 · 팀 QA에서 수정한 조건',
                resumeUrl: 'https://docs.google.com/document/d/1dCVpQIYkkI47YZY23ezAKFxfIgx9utmdFBN063jTV7E/edit?tab=t.pps9g3pjydpz',
                introUrl: 'https://docs.google.com/document/d/1fXRcvqIc9Iv9emB_g-8ULm9EVxp71F2boU72wr1U1V4/edit?tab=t.th1zo5uof4qu',
            },
        };
    }

    get(roleName) {
        return this.roles[roleName];
    }

    has(roleName) {
        return Boolean(this.roles[roleName]);
    }
}

class RoleFocusController {
    constructor(buttons, elements, repository = new RoleContentRepository()) {
        this.buttons = [...buttons];
        this.elements = elements;
        this.repository = repository;
    }

    start() {
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', () => this.select(button.dataset.role));
            button.addEventListener('keydown', (event) => this.navigateWithKeyboard(event, index));
        });

        const queryRole = new URLSearchParams(window.location.search).get('role');
        const initialRole = this.repository.has(queryRole) ? queryRole : 'client';
        this.select(initialRole, false);
    }

    navigateWithKeyboard(event, currentIndex) {
        const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!direction) return;

        event.preventDefault();
        const nextIndex = (currentIndex + direction + this.buttons.length) % this.buttons.length;
        const nextButton = this.buttons[nextIndex];
        this.select(nextButton.dataset.role);
        nextButton.focus();
    }

    select(roleName, updateUrl = true) {
        const role = this.repository.get(roleName);
        if (!role) return;

        this.buttons.forEach((button) => {
            const selected = button.dataset.role === roleName;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
        });

        this.elements.kicker.textContent = role.kicker;
        this.elements.summary.textContent = role.summary;
        this.elements.focus.textContent = role.focus;

        const documentsVisible = role.documentsVisible !== false;
        this.elements.resume.hidden = !documentsVisible;
        this.elements.intro.hidden = !documentsVisible;
        if (documentsVisible) {
            this.elements.resume.href = role.resumeUrl;
            this.elements.intro.href = role.introUrl;
        }

        document.body.dataset.activeRole = roleName;
        document.querySelectorAll('[data-role-view]').forEach((panel) => {
            panel.hidden = panel.dataset.roleView !== roleName;
        });

        if (updateUrl) {
            const url = new URL(window.location.href);
            url.searchParams.set('role', roleName);
            window.history.replaceState({}, '', url);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnchorNavigationController().start();
    new SectionNavigationController(document.querySelectorAll('[data-section-link]')).start();
    new RoleFocusController(document.querySelectorAll('.role-tab'), {
        kicker: document.getElementById('role-kicker'),
        summary: document.getElementById('role-summary'),
        focus: document.getElementById('role-focus'),
        resume: document.getElementById('resume-link'),
        intro: document.getElementById('intro-link'),
    }).start();
});
