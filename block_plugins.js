var requestBlackList = ['/metric/'];
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    for (var i = 0; i < requestBlackList.length; i++) {
        if (options.url.indexOf(requestBlackList[i]) >= 0) {
            options.beforeSend = function (jqXHR) {
                console.warn('Blocked request: ', options.url);
                jqXHR.abort();
            };
            break;
        }
    }
});

var pluginBlacklist = ['shots', 'tsarea', 'qrcode.js', 'vast.js'];
var originalAppendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(node) {
  if (
    node.tagName === 'SCRIPT' &&
    node.src
  ) {
    for (var i = 0; i < pluginBlacklist.length; i++) {
      if (node.src.indexOf(pluginBlacklist[i]) !== -1) {
        console.warn('Blocked script: ' + node.src);
        return node;
      }
    }
  }

  return originalAppendChild.call(this, node);
};
