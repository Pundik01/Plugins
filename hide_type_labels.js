/*
 * Lampa plugin: hide_type_labels
 * Убирает метки типа на карточках (.card__type: «Фильм», «Сериал», «MOV», «TV»)
 * в разделах «Торренты» и «Клубничка». В остальных разделах метки остаются.
 *
 * Как работает: у активного экрана (Lampa.Activity.active()) проверяются
 * component / title / url. Если экран подходит под правила ниже, на его корневой
 * элемент вешается класс, а CSS скрывает внутри него все .card__type.
 * Карточки, которые подгружаются позже (прокрутка, пагинация), скрываются сами.
 */
(function () {
    'use strict';

    if (window.plugin_hide_type_labels_ready) return;
    window.plugin_hide_type_labels_ready = true;

    // ===== НАСТРОЙКА ======================================================
    // Названия компонентов (Lampa.Activity.active().component), url и заголовков,
    // где метки нужно скрыть. Если какой-то экран «Клубнички» не подхватился,
    // включите отладку (см. ниже), посмотрите его component и допишите сюда.
    var COMPONENT_RE = /torrent|sisi|porn|xxx|adult|bongacams|chaturbate|xvideos|xhamster|eporner|spankbang|ebalovo|pornhub/i;
    var TITLE_RE     = /клубничк|торрент|torrent|18\+/i;
    // ======================================================================

    var CLASS_NAME = 'hide-type-labels';

    function addStyle() {
        if (document.getElementById('hide-type-labels-style')) return;
        var st = document.createElement('style');
        st.id = 'hide-type-labels-style';
        st.textContent = '.' + CLASS_NAME + ' .card__type{display:none !important;}';
        document.head.appendChild(st);
    }

    function activeActivity() {
        try { return Lampa.Activity.active(); } catch (e) { return null; }
    }

    function isTarget(a) {
        if (!a) return false;
        var comp  = String(a.component || '');
        var title = String(a.title || '');
        var url   = String(a.url || '');
        return COMPONENT_RE.test(comp) || TITLE_RE.test(title) || COMPONENT_RE.test(url);
    }

    function getRoot(a) {
        try {
            if (a && a.activity && typeof a.activity.render === 'function') return a.activity.render();
        } catch (e) {}
        return $('.activity--active');
    }

    function debug(a) {
        try {
            if (localStorage.getItem('hide_type_debug') !== '1') return;
            var msg = 'component=' + (a && a.component) + ' | title=' + (a && a.title) +
                      ' | target=' + isTarget(a);
            console.log('[hide_type_labels]', msg, a && a.url);
            if (Lampa.Noty) Lampa.Noty.show(msg);
        } catch (e) {}
    }

    function apply() {
        var a = activeActivity();
        if (!a) return;
        if (isTarget(a)) {
            var root = getRoot(a);
            if (root && root.length && !root.hasClass(CLASS_NAME)) root.addClass(CLASS_NAME);
        }
    }

    var timer = null;
    function schedule() {
        if (timer) return;
        timer = setTimeout(function () {
            timer = null;
            apply();
        }, 150);
    }

    function start() {
        addStyle();

        // Событие смены экрана
        try {
            Lampa.Listener.follow('activity', function (e) {
                if (e && (e.type === 'start' || e.type === 'archive' || e.type === 'create')) {
                    debug(activeActivity());
                    schedule();
                    setTimeout(apply, 600);
                    setTimeout(apply, 1500);
                }
            });
        } catch (e) {}

        // Страховка: следим за DOM, пока экран достраивается
        try {
            var obs = new MutationObserver(schedule);
            obs.observe(document.body, { childList: true, subtree: true });
        } catch (e) {}

        apply();
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
