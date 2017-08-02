console.log('defining WebSocket');

/*!
    \class WebSocket
    \brief WebSocket adapter
*/
export default (function() {
    if (typeof Qt === 'object')
        return require('polyfill-qml/lib/websocket');

    if (typeof exports === 'object' && typeof module === 'object')
        //! \see https://stackoverflow.com/a/41063795/2895579
        //! \see https://www.npmjs.com/package/ws
        return eval('require')('ws');

    return WebSocket;
}());
