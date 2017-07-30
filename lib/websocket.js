console.log('defining WebSocket');

/*!
    \class WebSocket
    \brief WebSocket adapter
*/
export default (function() {
    if (typeof Qt === 'object')
        return require('qml-polyfill/lib/websocket');

    if (typeof exports === 'object' && typeof module === 'object')
        //! \see https://www.npmjs.com/package/ws
        //! \see https://stackoverflow.com/a/41063795/2895579
        return eval('require')('ws');

    return WebSocket;
}());
