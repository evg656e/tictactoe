console.log('defining WebSocket');

/*!
    \class WebSocket
    \brief WebSocket adapter
*/
export default (function() {
    if (typeof Qt === 'object')
        return require('qml-polyfill/lib/websocket');

    if (typeof exports === 'object' && typeof module === 'object')
        return require('ws'); //! \see https://www.npmjs.com/package/ws

    return WebSocket;
}());
