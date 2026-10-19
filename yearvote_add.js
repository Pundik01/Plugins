  // Функция для перемещения .card__age в .card__view
  function moveCardAge() {
    // Найти только обычные карточки, исключая карточки эпизодов
    var cards = document.querySelectorAll('.card:not(.card-episode)');

    cards.forEach(function(card) {
      var cardView = card.querySelector('.card__view');
      var cardAge = card.querySelector('.card__age');

      // Переместить только если оба элемента существуют и cardAge еще не внутри cardView
      if (cardView && cardAge && !cardView.contains(cardAge)) {
        cardView.appendChild(cardAge);
      }
    });
  }

  // Выполнить сразу для существующих карточек
  // addStyles();
  moveCardAge();

  // Отслеживать динамическое создание новых карточек
  var observer = new MutationObserver(function(mutations) {
    moveCardAge();
  });

  // Наблюдать за изменениями в body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
