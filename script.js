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

class RoleFocusController {
    constructor(buttons, elements) {
        this.buttons = [...buttons];
        this.elements = elements;
        this.roles = {
            qa: {
                kicker: 'GAME QA PORTFOLIO',
                summary: '게임 시스템을 직접 구현한 경험을 바탕으로, 현상을 재현 가능한 조건과 기록으로 정리하는 QA를 지향합니다. 확인하지 않은 성능 개선을 단정하지 않고 Baseline과 근거를 먼저 남기겠습니다.',
                focus: '재현 조건 · 기대 결과와 실제 결과 · 심각도 판단 · 재검증 기록을 중심으로 프로젝트를 봅니다.',
            },
            client: {
                kicker: 'GAME CLIENT PORTFOLIO',
                summary: 'Unity와 C#으로 게임 기능을 구현하며 데이터, 로직, 표현의 책임을 나누는 구조를 연습해 왔습니다. 기술 이름보다 문제를 어떻게 나누고 검증했는지 설명하겠습니다.',
                focus: '시스템 구조 · 담당 코드 · 문제 해결 과정 · 측정 가능한 근거를 중심으로 프로젝트를 봅니다.',
            },
            planning: {
                kicker: 'GAME PLANNING PORTFOLIO',
                summary: '직접 구현하고 플레이해 본 경험을 바탕으로, 규칙과 피드백이 사용자의 선택에 어떤 영향을 주는지 분석합니다. 의도와 실제 플레이 결과를 구분해 기록하겠습니다.',
                focus: '게임 규칙 · 플레이 흐름 · UI 피드백 · 팀 QA에서 확인한 개선점을 중심으로 프로젝트를 봅니다.',
            },
        };
    }

    start() {
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', () => this.select(button.dataset.role));
            button.addEventListener('keydown', (event) => this.navigateWithKeyboard(event, index));
        });
        this.select(document.body.dataset.activeRole || 'qa');
    }

    navigateWithKeyboard(event, currentIndex) {
        const direction = {
            ArrowRight: 1,
            ArrowDown: 1,
            ArrowLeft: -1,
            ArrowUp: -1,
        }[event.key];

        if (!direction) return;
        event.preventDefault();

        const nextIndex = (currentIndex + direction + this.buttons.length) % this.buttons.length;
        const nextButton = this.buttons[nextIndex];
        this.select(nextButton.dataset.role);
        nextButton.focus();
    }

    select(roleName) {
        const role = this.roles[roleName];
        if (!role) return;

        this.buttons.forEach((button) => {
            const isSelected = button.dataset.role === roleName;
            button.classList.toggle('is-active', isSelected);
            button.setAttribute('aria-selected', String(isSelected));
            button.tabIndex = isSelected ? 0 : -1;
        });

        this.elements.kicker.textContent = role.kicker;
        this.elements.summary.textContent = role.summary;
        this.elements.focus.textContent = role.focus;
        document.body.dataset.activeRole = roleName;

        document.querySelectorAll('[data-role-view]').forEach((panel) => {
            panel.hidden = panel.dataset.roleView !== roleName;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScrollRevealController().start();
    new NavbarController(document.getElementById('navbar')).start();
    new AnchorNavigationController().start();
    new RoleFocusController(document.querySelectorAll('.role-tab'), {
        kicker: document.getElementById('role-kicker'),
        summary: document.getElementById('role-summary'),
        focus: document.getElementById('role-focus'),
    }).start();
});
