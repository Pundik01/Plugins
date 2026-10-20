$('<style>')
  .attr('id', 'hide-card-type-mytorrents')
  .text('.hide-card-type .card__type { display: none !important; }')
  .appendTo('head');

  function checkAndHideCardType() {
    var activity = Lampa.Activity.active();
    var isMyTorrents = activity && (activity.component === 'mytorrents' || activity.url === 'mytorrents');
    if (isMyTorrents) {
        $('body').addClass('hide-card-type');
    } else {
        $('body').removeClass('hide-card-type');
    }
  }

  checkAndHideCardType();

  if (Lampa.Listener) {
    Lampa.Listener.follow('activity', function(e) {
      checkAndHideCardType();
    });
  }
