/*
 * Lampa plugin: hide_type_labels (облегчённая версия, строгие правила)
 * Убирает метки типа на карточках (.card__type: «Фильм», «Сериал», «MOV», «TV»)
 * только в разделах «Торренты» и «Клубничка». В остальных разделах метки остаются.
 *
 * Как работает: при открытии экрана у активной Activity проверяется component.
 * Если он точно совпадает с одним из имён в списке COMPONENTS, на корневой элемент
 * экрана один раз вешается класс, а CSS скрывает внутри него все .card__type.
 * Карточки, подгружаемые позже (прокрутка, пагинация), скрываются самим CSS —
 * скрипт для этого не работает. Слежения за DOM нет, поэтому нагрузка минимальна.
 * Заголовок и url экрана не проверяются, поэтому смена языка интерфейса
 * на работу плагина не влияет.
 */
(function () {
    'use strict';

    if (window.plugin_hide_type_labels_ready) return;
    window.plugin_hide_type_labels_ready = true;

    // ===== НАСТРОЙКА ======================================================
    // Точные имена компонентов (Lampa.Activity.active().component),
    // в которых нужно скрыть метки. Сравнение строгое, без учёта регистра.
    // Чтобы добавить раздел, впишите его component в этот список.
    // Если нужно узнать component экрана, включите отладку:
    //   localStorage.setItem('hide_type_debug', '1')
    var COMPONENTS = [
        'mytorrents',        // Торренты
        'sisi_view_lampac'   // Клубничка
    ];
    // Через сколько мс после открытия экрана повторять попытку, если корень
    // экрана ещё не готов. Останавливается сразу после успеха.
    var RETRY_DELAYS = [0, 250, 700, 1500, 3000];
    // ======================================================================

    var CLASS_NAME = 'hide-type-labels';
    var timers = [];
    var list = COMPONENTS.map(function (c) { return String(c).toLowerCase(); });

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
        return list.indexOf(String(a.component || '').toLowerCase()) !== -1;
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
            var msg = 'component=' + (a && a.component) + ' | target=' + isTarget(a);
            console.log('[hide_type_labels]', msg);
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
