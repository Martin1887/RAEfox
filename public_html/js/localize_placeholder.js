navigator.mozL10n.ready ( function () {
    // grab l10n object
    var _ = navigator.mozL10n.get;
    // Notifications
    var inputSearch = document.querySelector("#inputSearch");
    if (inputSearch) {
        inputSearch.placeholder = _(inputSearch.getAttribute('data-l10n-id'));
    }
});