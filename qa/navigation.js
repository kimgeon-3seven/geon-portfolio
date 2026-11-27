// History can restore a fragment without opening a disclosure a reader closed.
function revealLinkedDetails() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;

    let disclosure = target.closest('details');
    let revealed = false;
    while (disclosure) {
        if (!disclosure.open) {
            disclosure.open = true;
            revealed = true;
        }
        disclosure = disclosure.parentElement.closest('details');
    }
    if (revealed) target.scrollIntoView();
}

window.addEventListener('hashchange', revealLinkedDetails);
revealLinkedDetails();
