const gridTarget = document.getElementById('tc-grid');
const gridCase = gridTarget.closest('details');

// History can restore the hash without revealing the contents of a closed case.
function revealLinkedCase() {
    if (location.hash === '#tc-grid' && !gridCase.open) {
        gridCase.open = true;
        gridTarget.scrollIntoView();
    }
}

window.addEventListener('hashchange', revealLinkedCase);
revealLinkedCase();
