/*
 * Lampa plugin: hide_type_labels (облегчённая версия)
 * Убирает метки типа на карточках (.card__type: «Фильм», «Сериал», «MOV», «TV»)
 * в разделах «Торренты» и «Клубничка». В остальных разделах метки остаются.
 *
 * Как работает: при открытии экрана у активной Activity проверяются
 * component / title / url. Если экран подходит под правила ниже, на его корневой
 * элемент один раз вешается класс, а CSS скрывает внутри него все .card__type.
 * Карточки, подгружаемые позже (прокрутка, пагинация), скрываются самим CSS —
 * скрипт для этого не работает. Слежения за DOM нет, поэтому нагрузка минимальна.
 */
(function () {
    'use strict';

    if (window.plugin_hide_type_labels_ready) return;
    window.plugin_hide_type_labels_ready = true;

    // ===== НАСТРОЙКА ======================================================
    // Если какой-то экран не подхватился, включите отладку:
    //   localStorage.setItem('hide_type_debug', '1')
    // посмотрите его component и допишите сюда.
    var COMPONENT_RE = /torrent|sisi|porn|xxx|adult|bongacams|chaturbate|xvideos|xhamster|eporner|spankbang|ebalovo|pornhub/i;
    var TITLE_RE     = /клубничк|торрент|torrent|18\+/i;
    // Через сколько мс после открытия экрана повторять попытку, если корень
    // экрана ещё не готов. Останавливается сразу после успеха.
    var RETRY_DELAYS = [0, 250, 700, 1500, 3000];
    // ======================================================================

    var CLASS_NAME = 'hide-type-labels';
    var timers = [];

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

    // true — экран обработан (не целевой или класс уже стоит)
    function apply() {
        var a = activeActivity();
        if (!a) return false;
        if (!isTarget(a)) return true;
        var root = getRoot(a);
        if (!root || !root.length) return false;
        if (!root.hasClass(CLASS_NAME)) root.addClass(CLASS_NAME);
        return true;
    }

    function clearTimers() {
        while (timers.length) clearTimeout(timers.pop());
    }

    function run() {
        clearTimers();
        debug(activeActivity());
        RETRY_DELAYS.forEach(function (delay) {
            timers.push(setTimeout(function () {
                if (apply()) clearTimers();
            }, delay));
        });
    }

    function start() {
        addStyle();

        try {
            Lampa.Listener.follow('activity', function (e) {
                if (e && (e.type === 'start' || e.type === 'archive' || e.type === 'create')) run();
            });
        } catch (e) {}

        run();
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
